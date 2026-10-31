import { AssistantService } from './assistant.service';
import { RuleBasedAssistantProvider } from './providers/rule-based.provider';

describe('AssistantService', () => {
  const service = new AssistantService(new RuleBasedAssistantProvider());

  it('uses page context to produce role-relevant read-only guidance', async () => {
    const response = await service.chat({
      assistantId: 'parnegarin',
      message: 'برای نوبت‌های امروز کمکم کن',
      identity: { id: 'owner-1', role: 'SALON_OWNER', tenantId: 'salon-1' },
      context: { route: '/dashboard/salons/salon-1/bookings' },
    });

    expect(response.conversationId).toBeTruthy();
    expect(response.message.role).toBe('assistant');
    expect(response.message.content).toContain('بازه‌های خالی');
    expect(response.message.content).toContain('بدون پیش‌نمایش و تأیید');
  });

  it('does not execute unregistered actions', () => {
    const response = service.confirmAction('unknown-action');
    expect(response.message.content).toContain('اجرا نشد');
  });
});
