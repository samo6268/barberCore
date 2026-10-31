import { ConfigService } from '@nestjs/config';
import { ForbiddenException } from '@nestjs/common';
import axios from 'axios';
import { AssistantBusinessService } from '../assistant-business.service';
import { InternalKnowledgeProvider } from './internal-knowledge.provider';
import type { LocalAssistantState, ModelRequest } from '../assistant.types';

const id1 = '11111111-1111-4111-8111-111111111111';
const id2 = '22222222-2222-4222-8222-222222222222';
const serviceId = '33333333-3333-4333-8333-333333333333';
function fixture(extra?: string) {
  const provider = new InternalKnowledgeProvider(
    new AssistantBusinessService(new ConfigService({ ASSISTANT_BUSINESSES_JSON: extra })),
  );
  const tool = jest.fn(async (name: string, args: Record<string, unknown>) => {
    switch (name) {
      case 'search_salons':
        return {
          data: {
            total: 2,
            salons: [
              {
                id: id1,
                slug: 'first',
                name: 'سالن یک',
                city: 'تهران',
                minPrice: { amountToman: 120000, unit: 'تومان' },
              },
              {
                id: id2,
                slug: 'second',
                name: 'سالن دو',
                city: 'تهران',
                minPrice: { amountToman: 180000, unit: 'تومان' },
              },
            ],
          },
          sources: [
            { title: 'سالن یک', url: '/salons/first' },
            { title: 'سالن دو', url: '/salons/second' },
          ],
        };
      case 'salon_details':
        return {
          data: {
            id: args.slug === 'second' ? id2 : id1,
            slug: args.slug,
            name: args.slug === 'second' ? 'سالن دو' : 'سالن یک',
            services: [
              {
                id: serviceId,
                name: 'کوتاهی مو',
                price: { amountToman: 120000, unit: 'تومان' },
                durationMinutes: 30,
              },
            ],
          },
          sources: [{ title: 'سالن', url: `/salons/${args.slug}` }],
        };
      case 'calendar_dates':
        return {
          data: {
            days: Array.from({ length: 30 }, (_, index) => {
              const date = new Date(Date.now() + index * 86400000);
              const p = new Intl.DateTimeFormat('en-US', {
                timeZone: 'Asia/Tehran',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              }).formatToParts(date);
              const get = (type: string) => p.find((x) => x.type === type)!.value;
              return {
                daysFromToday: index,
                gregorian: `${get('year')}-${get('month')}-${get('day')}`,
                persian: new Intl.DateTimeFormat('fa-IR', {
                  timeZone: 'Asia/Tehran',
                  dateStyle: 'full',
                }).format(date),
              };
            }),
          },
        };
      case 'available_slots':
        return {
          data: { slots: [{ time: '10:30' }, { time: '12:00' }], notice: 'رزرو قطعی نشده است.' },
          sources: [{ title: 'رزرو', url: '/salons/second/book' }],
        };
      case 'my_bookings':
        return {
          data: {
            total: 1,
            bookings: [
              {
                status: 'CONFIRMED',
                startsAt: new Date().toISOString(),
                salon: 'سالن خودم',
                services: ['کوتاهی'],
                price: { amountToman: 120000, unit: 'تومان' },
              },
            ],
          },
        };
      case 'my_salons':
        return { data: [{ id: id1, slug: 'first', name: 'سالن مدیر' }] };
      case 'salon_overview':
        return {
          data: {
            salon: 'سالن مدیر',
            date: '2026-10-31',
            today: {
              total: 3,
              revenue: { amountToman: 500000, unit: 'تومان' },
              statusCounts: { COMPLETED: 2, CONFIRMED: 1 },
            },
          },
        };
      default:
        throw new Error(`Unexpected tool ${name}`);
    }
  });
  const ask = (content: string, state?: LocalAssistantState, patch: Partial<ModelRequest> = {}) =>
    provider.respond({
      businessId: 'parnegarin',
      instructions: '',
      history: [{ role: 'user', content }],
      tools: [],
      executeTool: tool,
      state,
      page: { route: '/' },
      ...patch,
    });
  return { provider, tool, ask };
}
describe('Internal knowledge engine - no external model', () => {
  let network: jest.SpyInstance;
  beforeEach(() => {
    network = jest
      .spyOn(axios, 'post')
      .mockRejectedValue(new Error('External requests are forbidden'));
  });
  afterEach(() => {
    expect(network).not.toHaveBeenCalled();
    network.mockRestore();
  });
  it('is ready without any model settings and answers a booking guide from knowledge', async () => {
    const f = fixture();
    expect(f.provider.isReady()).toBe(true);
    const result = await f.ask('چطور نوبت بگیرم؟');
    expect(result.content).toContain('رزرو');
    expect(result.citations?.[0].url).toBe('/salons');
    expect(f.tool).not.toHaveBeenCalled();
  });
  it('does not return an unrelated FAQ for unsupported questions', async () => {
    const result = await fixture().ask('پایتخت فرانسه چیست؟');
    expect(result.content).toContain('پاسخ مطمئنی');
    expect(result.citations).toEqual([]);
  });
  it('uses role-appropriate page help without reading operational data', async () => {
    const f = fixture();
    const result = await f.ask('در این صفحه چه کارهایی می‌توانم انجام بدهم؟', undefined, {
      page: { route: '/staff/settlements' },
    });
    expect(result.content).toContain('تسویه');
    expect(f.tool).not.toHaveBeenCalled();
  });
  it('keeps the service while asking for a missing city', async () => {
    const f = fixture();
    const first = await f.ask('سالن برای کوتاهی مو میخوام');
    expect(first.state?.pending).toBe('city');
    expect(f.tool).not.toHaveBeenCalled();
    const second = await f.ask('تهران', first.state);
    expect(second.content).toContain('سالن یک');
    expect(f.tool).toHaveBeenCalledWith(
      'search_salons',
      expect.objectContaining({ city: 'تهران', service: 'کوتاهی' }),
    );
  });
  it('normalizes Arabic letters and Persian option digits', async () => {
    const f = fixture();
    const first = await f.ask('سالن كوتاهي در تهران');
    const second = await f.ask('گزینه ۲', first.state);
    expect(f.tool).toHaveBeenLastCalledWith('salon_details', { slug: 'second' });
    expect(second.content).toContain('۱۲۰٬۰۰۰');
  });
  it('keeps the chosen salon when asking for the earliest available appointment', async () => {
    const f = fixture();
    const search = await f.ask('سالن کوتاهی در تهران');
    const detail = await f.ask('گزینه دوم', search.state);
    const slots = await f.ask('اولین وقت خالی', detail.state);
    expect(f.tool).toHaveBeenCalledWith(
      'available_slots',
      expect.objectContaining({ salonId: id2, serviceIds: [serviceId] }),
    );
    expect(slots.content).toContain('10:30');
    expect(slots.content).toContain('رزرو قطعی نشده');
  });
  it('handles service and date follow-ups without restarting a salon search', async () => {
    const f = fixture();
    const search = await f.ask('سالن در تهران');
    const detail = await f.ask('گزینه دوم', search.state);
    const step = await f.ask('کوتاهی مو', detail.state);
    expect(step.state?.pending).toBe('date');
    f.tool.mockClear();
    const slots = await f.ask('فردا', step.state);
    expect(f.tool.mock.calls.some(([name]) => name === 'search_salons')).toBe(false);
    expect(slots.content).toContain('10:30');
  });
  it('reads the current public salon from page context only through the public tool', async () => {
    const f = fixture();
    await f.ask('قیمت خدمات این سالن', undefined, { page: { route: '/salons/second' } });
    expect(f.tool).toHaveBeenCalledWith('salon_details', { slug: 'second' });
  });
  it('does not invent prices or salons when there are no live results', async () => {
    const f = fixture();
    f.tool.mockResolvedValueOnce({ data: { total: 0, salons: [] } } as any);
    const result = await f.ask('سالن کوتاهی در تهران');
    expect(result.content).toContain('پیدا نشد');
    expect(result.content).not.toContain('120000');
  });
  it('requires login before personal booking reads', async () => {
    const f = fixture();
    const result = await f.ask('نوبت‌های من را نشان بده');
    expect(result.content).toContain('وارد حساب');
    expect(f.tool).not.toHaveBeenCalled();
  });
  it('reads only the verified user bookings through the authorized registry', async () => {
    const f = fixture();
    const result = await f.ask('نوبت‌های من', undefined, {
      actor: { id: 'verified', role: 'CUSTOMER' },
    });
    expect(f.tool).toHaveBeenCalledWith('my_bookings', {});
    expect(result.content).toContain('سالن خودم');
  });
  it('blocks a customer from owner analytics', async () => {
    const f = fixture();
    const result = await f.ask('درآمد امروز سالن چقدر است', undefined, {
      actor: { id: 'customer', role: 'CUSTOMER' },
    });
    expect(result.content).toContain('حساب مالک');
    expect(f.tool).not.toHaveBeenCalled();
  });
  it('formats authorized owner summaries with their financial meaning', async () => {
    const f = fixture();
    const result = await f.ask('خلاصه وضعیت امروز', undefined, {
      actor: { id: 'owner', role: 'SALON_OWNER' },
    });
    expect(result.content).toContain('سود خالص');
    expect(f.tool).toHaveBeenCalledWith(
      'salon_overview',
      expect.objectContaining({ salonId: id1 }),
    );
  });
  it('returns access denial instead of inventing data when a domain permission fails', async () => {
    const f = fixture();
    f.tool.mockRejectedValueOnce(new ForbiddenException());
    const result = await f.ask('خلاصه وضعیت امروز', undefined, {
      actor: { id: 'owner', role: 'SALON_OWNER' },
    });
    expect(result.content).toContain('دسترسی ندارید');
  });
  it('does not silently substitute today for unsupported historical range reports', async () => {
    const f = fixture();
    const result = await f.ask('گزارش ماه گذشته', undefined, {
      actor: { id: 'owner', role: 'SALON_OWNER' },
    });
    expect(result.content).toContain('گزارش بازه‌ای');
    expect(f.tool.mock.calls.some(([name]) => name === 'salon_overview')).toBe(false);
  });
  it('does not disclose prices when the question is outside the business domain', async () => {
    const f = fixture();
    const result = await f.ask('قیمت بیت کوین در تهران چنده؟');
    expect(f.tool).not.toHaveBeenCalled();
    expect(result.content).not.toContain('120000');
  });
  it('does not execute mutation requests', async () => {
    const f = fixture();
    const result = await f.ask('نوبتم را لغو کن');
    expect(result.content).toContain('لغو');
    expect(f.tool).not.toHaveBeenCalled();
  });
  it('uses the registered page guide for another host product', async () => {
    const f = fixture(
      JSON.stringify([
        {
          assistantId: 'example',
          name: 'نمونه',
          description: 'محصول دیگر',
          knowledge: [
            {
              id: 'requests',
              title: 'درخواست‌ها',
              text: 'از این صفحه درخواست جدید بسازید.',
              path: '/requests',
            },
          ],
        },
      ]),
    );
    const result = await f.ask('راهنمای این صفحه', undefined, {
      businessId: 'example',
      page: { route: '/requests/new' },
    });
    expect(result.content).toContain('درخواست جدید');
    expect(result.citations?.[0].url).toBe('/requests');
    expect(f.tool).not.toHaveBeenCalled();
  });
  it('uses knowledge of the selected business without leaking Parnegarin content', async () => {
    const f = fixture(
      JSON.stringify([
        {
          assistantId: 'example',
          name: 'نمونه',
          description: 'سامانه دیگر',
          knowledge: [
            {
              id: 'request',
              title: 'ثبت درخواست',
              text: 'درخواست را در صفحه درخواست‌ها ثبت کنید.',
              keywords: ['ثبت درخواست'],
              path: '/requests',
            },
          ],
        },
      ]),
    );
    const result = await f.ask('چگونه درخواست ثبت کنم', undefined, { businessId: 'example' });
    expect(result.content).toContain('صفحه درخواست');
    expect(result.content).not.toContain('سالن');
    expect(f.tool).not.toHaveBeenCalled();
  });
});
