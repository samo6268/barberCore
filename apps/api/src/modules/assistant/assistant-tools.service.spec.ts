import { ConfigService } from '@nestjs/config';
import { AssistantToolsService } from './assistant-tools.service';
import { AssistantBusinessService } from './assistant-business.service';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
const salonId = '1b4e8a0e-1dc0-4e4b-9075-059a41d852c0';
function fixture(extra?: string) {
  const config = new ConfigService({ ASSISTANT_BUSINESSES_JSON: extra });
  const marketplace = {
    searchSalons: jest.fn().mockResolvedValue({
      meta: { total: 1 },
      data: [
        {
          id: salonId,
          slug: 'real',
          name: 'سالن واقعی',
          services: [{ id: 's', name: 'کوتاهی', price: 1200000 }],
          minPrice: 1200000,
        },
      ],
    }),
  };
  const bookings = {
    findMyBookings: jest.fn().mockResolvedValue({ meta: { total: 0 }, data: [] }),
  };
  const salons = { overview: jest.fn().mockRejectedValue(new ForbiddenException()) };
  const prisma = { salon: { findFirst: jest.fn().mockResolvedValue(null) } };
  const availability = { getAvailableSlots: jest.fn() };
  const tools = new AssistantToolsService(
    new AssistantBusinessService(config),
    marketplace as any,
    availability as any,
    bookings as any,
    salons as any,
    {} as any,
    prisma as any,
    config,
  );
  return { tools, marketplace, bookings, salons, prisma, availability };
}
describe('Assistant read-only tools', () => {
  it('does not expose private tools to guests', async () => {
    const f = fixture();
    expect(f.tools.definitions('parnegarin').some((t) => t.name === 'my_bookings')).toBe(false);
    await expect(
      f.tools.execute('parnegarin', undefined, 'my_bookings', {}),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(f.bookings.findMyBookings).not.toHaveBeenCalled();
  });
  it('injects the authenticated user id, and rejects model-selected user ids', async () => {
    const f = fixture(),
      actor = { id: 'authenticated', role: 'CUSTOMER' };
    await f.tools.execute('parnegarin', actor, 'my_bookings', {});
    expect(f.bookings.findMyBookings).toHaveBeenCalledWith('authenticated', { page: 1, limit: 5 });
    await expect(
      f.tools.execute('parnegarin', actor, 'my_bookings', { userId: 'victim' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
  it('rechecks ownership in the existing domain service', async () => {
    const f = fixture();
    await expect(
      f.tools.execute('parnegarin', { id: 'owner', role: 'SALON_OWNER' }, 'salon_overview', {
        salonId,
        date: null,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(f.salons.overview).toHaveBeenCalledWith(salonId, 'owner', undefined);
  });
  it('returns live public data with explicit currency and source links', async () => {
    const f = fixture();
    const response = await f.tools.execute('parnegarin', undefined, 'search_salons', {
      city: 'تهران',
      service: 'کوتاهی',
      query: null,
      gender: null,
    });
    expect((response.data as any).salons[0].minPrice.amountToman).toBe(120000);
    expect(response.sources?.[0].url).toBe('/salons/real');
  });
  it('does not disclose availability for an inactive or deleted salon', async () => {
    const f = fixture();
    const date = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    await expect(
      f.tools.execute('parnegarin', undefined, 'available_slots', {
        salonId,
        date,
        serviceIds: [salonId],
        staffId: null,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(f.availability.getAvailableSlots).not.toHaveBeenCalled();
  });
  it('isolates business knowledge and blocks Parnegarin tools for other businesses', async () => {
    const f = fixture(
      JSON.stringify([
        {
          assistantId: 'another',
          name: 'سازمان دیگر',
          description: 'خدمات دیگر',
          knowledge: [{ id: 'one', title: 'دانش خصوصی برند', text: 'راهنمای همان کسب‌وکار' }],
        },
      ]),
    );
    expect(
      f.tools.definitions('another', { id: 'x', role: 'SALON_OWNER' }).map((t) => t.name),
    ).toEqual(['calendar_dates', 'knowledge_search']);
    const result = await f.tools.execute('another', undefined, 'knowledge_search', {
      query: 'راهنما',
    });
    expect(JSON.stringify(result.data)).not.toContain('پرنگارین');
    await expect(f.tools.execute('another', undefined, 'search_salons', {})).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
  it('provides server-derived Persian and Gregorian dates in Tehran time', async () => {
    const response = await fixture().tools.execute('parnegarin', undefined, 'calendar_dates', {});
    const data = response.data as any;
    expect(data.timeZone).toBe('Asia/Tehran');
    expect(data.days).toHaveLength(30);
    expect(data.days[0].gregorian).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(data.days[0].persian).toBeTruthy();
    expect(data.days[0].persianDate).toMatch(/^1[34]\d{2}\/\d{1,2}\/\d{1,2}$/);
    expect(data.days[1].daysFromToday).toBe(1);
  });
  it('rejects SQL-like or invented tool names without executing them', async () => {
    await expect(
      fixture().tools.execute('parnegarin', { id: 'x', role: 'SUPER_ADMIN' }, 'execute_sql', {
        sql: 'select * from users',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
