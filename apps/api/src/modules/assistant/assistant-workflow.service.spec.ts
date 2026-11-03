import { AssistantWorkflowService } from './assistant-workflow.service';
import type { ModelRequest } from './assistant.types';
import { AssistantBusinessService } from './assistant-business.service';
import { ConfigService } from '@nestjs/config';

const workflows = new AssistantWorkflowService();
const request = (message: string, route = '/salons/first/book'): ModelRequest => ({
  businessId: 'parnegarin', instructions: '', tools: [],
  history: [{ role: 'user', content: message }], page: { route },
  executeTool: jest.fn(),
});
describe('Grounded workflow assistance', () => {
  it('uses the actual booking step and known error codes without claiming a write', () => {
    const r = request('چرا نمی‌توانم این مرحله را ادامه بدهم؟');
    r.page!.workflow = { id: 'booking', stepId: 'time', completed: ['service', 'date'], issues: ['no_slots', 'untrusted_code'] };
    const result = workflows.respond(r)!;
    expect(result.guide?.currentStep).toBe(4);
    expect(result.guide?.source).toBe('page-state');
    expect(result.content).toContain('روز یا متخصص دیگری');
    expect(result.content).not.toContain('untrusted_code');
    expect(r.executeTool).not.toHaveBeenCalled();
  });
  it('cannot advance the real form from a next-step chat message', () => {
    const r = request('مرحله بعدی چیست؟');
    r.page!.workflow = { id: 'booking', stepId: 'service', issues: ['missing_service'] };
    const result = workflows.respond(r)!;
    expect(result.guide?.currentStep).toBe(1);
    expect(result.content).toContain('فرم را جلو نمی‌برد');
  });
  it('ignores a forged workflow from another page', () => {
    const r = request('الان چه کار کنم؟');
    r.page!.workflow = { id: 'salon-create', stepId: 'review' };
    expect(workflows.respond(r)?.guide?.id).toBe('booking');
    expect(workflows.respond(r)?.guide?.source).toBe('guide');
  });
  it('remembers explanation progress but resets it on a page change', () => {
    const r = request('مرحله بعدی');
    r.state = { guide: { id: 'booking', step: 1, route: '/salons/first/book' } };
    expect(workflows.respond(r)?.guide?.currentStep).toBe(3);
    r.page = { route: '/salons/other/book' };
    expect(workflows.respond(r)?.guide?.currentStep).toBe(2);
  });
  it('does not intercept live-data questions or unrelated how-to knowledge', () => {
    expect(workflows.respond(request('نوبت بعدی من', '/staff'))).toBeUndefined();
    expect(workflows.respond(request('راهنمای لغو نوبت', '/'))).toBeUndefined();
    expect(workflows.respond(request('قیمت این خدمت چنده؟'))).toBeUndefined();
  });
  it('discloses the demo onboarding instead of presenting it as real registration', () => {
    const result = workflows.respond(request('راهنمای این صفحه', '/salons/new'))!;
    expect(result.content).toContain('مسیر نمایشی');
    expect(result.guide?.href).toBe('/dashboard/salons/new');
  });
  it('does not assume a cause when no known error is available', () => {
    expect(workflows.respond(request('چرا این مرحله خطا می‌دهد؟'))?.content).toContain('علت قطعی مشخص نیست');
  });
  it('does not expose Parnegarin workflows for another business', () => {
    const r = request('راهنمای این صفحه'); r.businessId = 'other-app';
    expect(workflows.respond(r, 'booking')).toBeUndefined();
    expect(workflows.catalog('other-app')).toEqual([]);
  });
  it('uses host-registered workflows for another system and escapes route patterns', () => {
    const businesses = new AssistantBusinessService(new ConfigService({ ASSISTANT_BUSINESSES_JSON: JSON.stringify([
      { assistantId: 'another-app', name: 'سامانه دیگر', knowledge: [], workflows: [
        { id: 'request', title: 'درخواست', path: '/requests/v1.0', paths: ['/requests/v1.0'], steps: [
          { id: 'info', title: 'اطلاعات', instruction: 'فرم را تکمیل کنید.' },
        ] },
      ] },
    ]) }));
    const service = new AssistantWorkflowService(businesses);
    const r = request('راهنمای این صفحه', '/requests/v1.0'); r.businessId = 'another-app';
    expect(service.respond(r)?.guide?.id).toBe('request');
    r.page = { route: '/requests/v1x0' };
    expect(service.respond(r)).toBeUndefined();
  });
  it('rejects unsafe navigation URLs in a server workflow manifest', () => {
    expect(() => new AssistantBusinessService(new ConfigService({ ASSISTANT_BUSINESSES_JSON: JSON.stringify([
      { assistantId: 'another-app', name: 'سامانه دیگر', knowledge: [], workflows: [
        { id: 'bad', title: 'bad', path: '//evil.example', paths: ['/x'], steps: [{ id: 'info', title: 'info', instruction: 'text' }] },
      ] },
    ]) }))).toThrow('workflow');
  });
  it('keeps admin assistance explicit about demo data without accessing private tools', () => {
    const service = new AssistantWorkflowService(new AssistantBusinessService(new ConfigService()));
    const r = request('راهنمای این صفحه', '/financial'); r.businessId = 'parnegarin-admin';
    const result = service.respond(r)!;
    expect(result.content).toContain('نمایشی');
    expect(result.guide?.id).toBe('admin-navigation');
    expect(r.executeTool).not.toHaveBeenCalled();
  });
});
