import { ConfigService } from '@nestjs/config';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AssistantSessionService } from './assistant-session.service';
const mockValues = new Map<string, string>();
const mockRedis = {
  on: jest.fn(),
  disconnect: jest.fn(),
  set: jest.fn(async (key: string, value: string, ...args: unknown[]) => {
    if (args.includes('NX') && mockValues.has(key)) return null;
    mockValues.set(key, value);
    return 'OK';
  }),
  get: jest.fn(async (key: string) => mockValues.get(key) || null),
  eval: jest.fn(async (script: string, _count: number, key: string, value: string) => {
    if (script.includes('INCR')) return 1;
    if (mockValues.get(key) === value) mockValues.delete(key);
    return 1;
  }),
};
jest.mock('ioredis', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => mockRedis),
}));
describe('Conversation isolation', () => {
  let service: AssistantSessionService;
  beforeEach(() => {
    mockValues.clear();
    service = new AssistantSessionService(
      new ConfigService({ REDIS_URL: 'redis://localhost', JWT_ACCESS_SECRET: 'test-secret' }),
    );
  });
  afterEach(() => service.onModuleDestroy());
  it('signs guests and binds their token to one business', () => {
    const first = service.principal('parnegarin');
    expect(service.principal('parnegarin', undefined, first.sessionToken).scope).toBe(first.scope);
    expect(() => service.principal('other', undefined, first.sessionToken)).toThrow(
      UnauthorizedException,
    );
    expect(() => service.principal('parnegarin', undefined, first.sessionToken + 'x')).toThrow(
      UnauthorizedException,
    );
  });
  it('does not accept an authenticated user id from guest tokens', () => {
    expect(
      service.principal('parnegarin', { id: 'real', role: 'CUSTOMER' }, 'untrusted').scope,
    ).toBe('parnegarin:user:real:CUSTOMER');
  });
  it('does not allow another user or business to resume a conversation', async () => {
    const session = await service.start('parnegarin:user:a:CUSTOMER');
    await service.save(session.id, 'parnegarin:user:a:CUSTOMER', [
      { role: 'user', content: 'private' },
    ]);
    await service.release(session.id, session.lock);
    await expect(service.start('parnegarin:user:b:CUSTOMER', session.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(service.start('other:user:a:CUSTOMER', session.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
  it('sets a one-hour history TTL and returns only the bounded recent history', async () => {
    const session = await service.start('scope');
    await service.save(
      session.id,
      'scope',
      Array.from({ length: 40 }, (_, i) => ({
        role: i % 2 ? ('assistant' as const) : ('user' as const),
        content: String(i),
      })),
    );
    const call = mockRedis.set.mock.calls.find((c) => c[0] === `mimo:conversation:${session.id}`)!;
    expect(call.slice(2)).toEqual(['EX', 3600]);
    expect(JSON.parse(call[1]).history).toHaveLength(12);
  });
});
