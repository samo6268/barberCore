import { ConfigService } from '@nestjs/config';
import {
  ForbiddenException,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { AssistantService } from './assistant.service';
import { AssistantBusinessService } from './assistant-business.service';

function fixture() {
  const provider = {
    name: 'test',
    isReady: jest.fn(() => true),
    respond: jest.fn().mockResolvedValue({ content: 'پاسخ با داده واقعی', citations: [] }),
  };
  const businesses = new AssistantBusinessService(new ConfigService());
  const tools = { definitions: jest.fn(() => []), execute: jest.fn() };
  const sessions = {
    principal: jest.fn(() => ({ scope: 'test-scope', sessionToken: 'signed-guest' })),
    start: jest.fn().mockResolvedValue({
      id: 'conversation',
      lock: 'lock',
      history: [
        { role: 'user', content: 'سالن در تهران می‌خواهم' },
        { role: 'assistant', content: 'چه خدمتی؟' },
      ],
    }),
    save: jest.fn().mockResolvedValue(undefined),
    release: jest.fn().mockResolvedValue(undefined),
  };
  const prisma = {
    user: {
      findUnique: jest
        .fn()
        .mockResolvedValue({ id: 'real-user', role: 'CUSTOMER', isActive: true }),
    },
  };
  const service = new AssistantService(
    provider,
    businesses,
    tools as any,
    sessions as any,
    prisma as any,
  );
  return { provider, businesses, tools, sessions, prisma, service };
}
const dto = {
  assistantId: 'parnegarin',
  message: 'رنگ مو',
  context: { route: '/salons' },
  identity: { id: 'forged', role: 'SUPER_ADMIN', tenantId: 'another-salon' },
};
describe('Assistant gateway', () => {
  it('ignores forged browser identity and includes the server conversation history', async () => {
    const f = fixture();
    await f.service.chat(dto);
    expect(f.prisma.user.findUnique).not.toHaveBeenCalled();
    expect(f.tools.definitions).toHaveBeenCalledWith('parnegarin', undefined);
    const request = f.provider.respond.mock.calls[0][0] as any;
    expect(request.instructions).toContain('بازدیدکننده ناشناس');
    expect(request.instructions).not.toContain('forged');
    expect(request.history).toHaveLength(3);
    expect(request.history[0].content).toContain('تهران');
  });
  it('loads the current role from the database instead of trusting token role', async () => {
    const f = fixture();
    await f.service.chat(dto, { sub: 'real-user', role: 'SUPER_ADMIN' });
    expect(f.tools.definitions).toHaveBeenCalledWith('parnegarin', {
      id: 'real-user',
      role: 'CUSTOMER',
    });
  });
  it('rejects deactivated accounts before model access', async () => {
    const f = fixture();
    f.prisma.user.findUnique.mockResolvedValueOnce({
      id: 'real-user',
      role: 'CUSTOMER',
      isActive: false,
    });
    await expect(
      f.service.chat(dto, { sub: 'real-user', role: 'CUSTOMER' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(f.provider.respond).not.toHaveBeenCalled();
  });
  it('does not silently fall back to fake answers without credentials', async () => {
    const f = fixture();
    f.provider.isReady.mockReturnValue(false);
    await expect(f.service.chat(dto)).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
  it('rejects unregistered businesses before accessing tools', async () => {
    const f = fixture();
    await expect(f.service.chat({ ...dto, assistantId: 'unknown' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(f.provider.respond).not.toHaveBeenCalled();
  });
  it('releases the conversation lock after provider failure', async () => {
    const f = fixture();
    f.provider.respond.mockRejectedValueOnce(new ServiceUnavailableException());
    await expect(f.service.chat(dto)).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(f.sessions.release).toHaveBeenCalledWith('conversation', 'lock');
    expect(f.sessions.save).not.toHaveBeenCalled();
  });
  it('denies all write actions', () => {
    expect(() => fixture().service.confirmAction('cancel-booking')).toThrow(ForbiddenException);
  });
});
