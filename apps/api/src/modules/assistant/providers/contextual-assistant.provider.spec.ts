import { ConfigService } from '@nestjs/config';
import { AssistantBusinessService } from '../assistant-business.service';
import { AssistantWorkflowService } from '../assistant-workflow.service';
import { InternalKnowledgeProvider } from './internal-knowledge.provider';
import { ContextualAssistantProvider } from './contextual-assistant.provider';
import type { ModelRequest } from '../assistant.types';

describe('Grounded semantic routing', () => {
  const businesses = new AssistantBusinessService(new ConfigService());
  function fixture(action: string, extra = {}) {
    const plan = { action, articleIds: [], workflowId: '', city: '', service: '', choice: 0, date: '', gender: '', ...extra };
    const understanding = { plan: jest.fn().mockResolvedValue(plan), status: () => ({ understanding: 'ollama' }) };
    const provider = new ContextualAssistantProvider(new InternalKnowledgeProvider(businesses), new AssistantWorkflowService(), understanding as any, businesses);
    const r: ModelRequest = {
      businessId: 'parnegarin', instructions: '', tools: [], page: { route: '/salons' },
      history: [{ role: 'user', content: 'برنامه شخصی‌ام را ببینم' }], executeTool: jest.fn(),
    };
    return { provider, r, understanding };
  }
  it('still requires authentication for a model-selected private query', async () => {
    const f = fixture('mine');
    const result = await f.provider.respond(f.r);
    expect(result.content).toContain('ابتدا وارد حساب');
    expect(f.r.executeTool).not.toHaveBeenCalled();
  });
  it('does not promote a customer into an owner role', async () => {
    const f = fixture('owner'); f.r.actor = { id: 'customer', role: 'CUSTOMER' };
    const result = await f.provider.respond(f.r);
    expect(result.content).toContain('فقط با حساب مالک');
    expect(f.r.executeTool).not.toHaveBeenCalled();
  });
  it('uses registered article text verbatim rather than generated facts', async () => {
    const f = fixture('knowledge', { articleIds: ['cancellation'] });
    const result = await f.provider.respond(f.r);
    expect(result.citations?.[0].url).toBe('/profile/bookings');
    expect(result.content).toContain('سیاست منتشرشده');
  });
  it('reads prices through the authorized domain tool, preserving selection', async () => {
    const f = fixture('details', { choice: 2 });
    f.r.state = { intent: 'search', choices: [{ id: 'one', slug: 'first', name: 'یک' }, { id: 'two', slug: 'second', name: 'دو' }] };
    (f.r.executeTool as jest.Mock).mockResolvedValue({ data: { id: 'two', slug: 'second', name: 'سالن دو', services: [] } });
    const result = await f.provider.respond(f.r);
    expect(f.r.executeTool).toHaveBeenCalledWith('salon_details', { slug: 'second' });
    expect(result.content).toContain('سالن دو');
  });
  it('guides the live form without waiting for an optional language model', async () => {
    const f = fixture('clarify');
    f.r.page = { route: '/salons/example/book', workflow: { id: 'booking', stepId: 'date', issues: ['missing_date'] } };
    f.r.history = [{ role: 'user', content: 'الان چه کار کنم؟' }];
    const result = await f.provider.respond(f.r);
    expect(result.guide?.currentStep).toBe(3);
    expect(f.understanding.plan).not.toHaveBeenCalled();
  });
  it('compares only live services from the selected centers without inventing distance', async () => {
    const f = fixture('compare');
    f.r.history = [{ role: 'user', content: 'گزینه اول و دوم را مقایسه کن' }];
    f.r.state = { intent: 'search', service: 'کوتاهی', choices: [
      { id: 'a', slug: 'first', name: 'اول' }, { id: 'b', slug: 'second', name: 'دوم' },
    ] };
    (f.r.executeTool as jest.Mock).mockImplementation(async (_name, args) => ({
      data: { name: args.slug, services: [{ name: 'کوتاهی', price: { amountToman: 150000 }, durationMinutes: 30 }] },
      sources: [{ title: args.slug, url: '/salons/' + args.slug }],
    }));
    const result = await f.provider.respond(f.r);
    expect(f.r.executeTool).toHaveBeenCalledTimes(2);
    expect(result.citations).toHaveLength(2);
    expect(result.content).toContain('۱۵۰٬۰۰۰ تومان');
    expect(result.content).toContain('فاصله و کیفیت تضمینی');
  });
  it('resolves a user-supplied Persian date through the real calendar path instead of dropping it', async () => {
    const f = fixture('availability');
    f.r.history = [{ role: 'user', content: 'برای ۱۴۰۵/۸/۱۸ وقت داره؟' }];
    f.r.state = { selected: { id: 'center', slug: 'first', name: 'مرکز' } };
    (f.r.executeTool as jest.Mock).mockImplementation(async name => ({ data:
      name === 'salon_details' ? { id: 'center', slug: 'first', name: 'مرکز', services: [{ id: 'service', name: 'کوتاهی' }] } :
      name === 'calendar_dates' ? { days: [{ gregorian: '2026-11-09', persianDate: '1405/8/18', persian: 'دوشنبه ۱۸ آبان' }] } :
      { slots: [{ time: '10:00' }], notice: 'وقت قطعی نیست' },
    }));
    const result = await f.provider.respond(f.r);
    expect(f.r.executeTool).toHaveBeenCalledWith('available_slots', expect.objectContaining({ date: '2026-11-09' }));
    expect(result.content).toContain('10:00');
  });
  it('can explicitly clear a previous gender preference without confusing all salons with unisex salons', async () => {
    const f = fixture('search', { city: 'تهران', gender: 'ALL' });
    f.r.state = { intent: 'search', city: 'تهران', gender: 'FEMALE' };
    (f.r.executeTool as jest.Mock).mockResolvedValue({ data: { total: 0, salons: [] } });
    await f.provider.respond(f.r);
    expect(f.r.executeTool).toHaveBeenCalledWith('search_salons', expect.objectContaining({ gender: null }));
  });
});
