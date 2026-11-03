import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { PassportModule } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { PrismaService } from '../../prisma/prisma.service';
import { AssistantController } from './assistant.controller';
import { AssistantService } from './assistant.service';
import { AssistantAuthGuard } from './assistant-auth.guard';

const secret = 'test-only-secret';
const service = {
  chat: jest.fn().mockResolvedValue({ conversationId: 'qa', message: { content: 'test' } }),
  status: () => ({ ready: true }),
  confirmAction: jest.fn(),
};
const body = { assistantId: 'parnegarin', message: 'سؤال', context: { route: '/salons' } };
describe('Assistant HTTP validation and optional authentication', () => {
  let app: NestFastifyApplication;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        PassportModule,
        ThrottlerModule.forRoot([
          { name: 'short', ttl: 1000, limit: 50 },
          { name: 'medium', ttl: 10000, limit: 50 },
          { name: 'long', ttl: 60000, limit: 50 },
        ]),
      ],
      controllers: [AssistantController],
      providers: [
        AssistantAuthGuard,
        JwtStrategy,
        { provide: ConfigService, useValue: new ConfigService({ JWT_ACCESS_SECRET: secret }) },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn().mockResolvedValue({ id: 'verified-user', isActive: true }),
            },
          },
        },
        { provide: AssistantService, useValue: service },
      ],
    }).compile();
    app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter(), {
      logger: false,
    });
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });
  afterAll(async () => {
    await app.close();
  });
  it('accepts only bounded workflow identifiers, not form values or secrets', async () => {
    const res = await app.inject({
      method: 'POST', url: '/assistant/chat', remoteAddress: '127.0.0.6',
      payload: { ...body, context: { route: '/salons/x/book', workflow: { id: 'booking', stepId: 'date', phone: '09121234567' } } },
    });
    expect(res.statusCode).toBe(400);
  });
  it('allows an anonymous question without treating body identity as authentication', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/assistant/chat',
      payload: { ...body, identity: { id: 'victim', role: 'SUPER_ADMIN' } },
    });
    expect(res.statusCode).toBe(201);
    expect(service.chat.mock.calls.at(-1)?.[1]).toBeUndefined();
  });
  it('rejects a malformed token instead of downgrading to a guest', async () => {
    const before = service.chat.mock.calls.length;
    const res = await app.inject({
      method: 'POST',
      url: '/assistant/chat',
      headers: { authorization: 'Bearer invalid' },
      payload: body,
    });
    expect(res.statusCode).toBe(401);
    expect(service.chat.mock.calls.length).toBe(before);
  });
  it('rejects malformed nested context and oversized messages', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/assistant/chat',
      remoteAddress: '127.0.0.3',
      payload: {
        ...body,
        context: { route: 'https://untrusted.example' },
        message: 'x'.repeat(4001),
      },
    });
    expect(res.statusCode).toBe(400);
  });
  it('limits anonymous turns before invoking the service', async () => {
    const before = service.chat.mock.calls.length;
    const responses = [];
    for (let i = 0; i < 3; i++)
      responses.push(
        await app.inject({
          method: 'POST',
          url: '/assistant/chat',
          remoteAddress: '127.0.0.9',
          payload: body,
        }),
      );
    expect(responses.map((r) => r.statusCode)).toEqual([201, 201, 429]);
    expect(service.chat.mock.calls.length - before).toBe(2);
  });
  it('passes only the verified JWT identity to the service', async () => {
    const token = new JwtService({ secret }).sign(
      { sub: 'verified-user', role: 'CUSTOMER' },
      { expiresIn: 60 },
    );
    const res = await app.inject({
      method: 'POST',
      url: '/assistant/chat',
      remoteAddress: '127.0.0.4',
      headers: { authorization: `Bearer ${token}` },
      payload: body,
    });
    expect(res.statusCode).toBe(201);
    expect(service.chat.mock.calls.at(-1)?.[1]?.sub).toBe('verified-user');
  });
});
