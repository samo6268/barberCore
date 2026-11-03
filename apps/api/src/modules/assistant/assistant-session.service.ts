import {
  Injectable,
  OnModuleDestroy,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
  HttpException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, createHmac, randomUUID, timingSafeEqual } from 'crypto';
import Redis from 'ioredis';
import type { AssistantActor, ModelMessage, LocalAssistantState } from './assistant.types';

interface Conversation {
  scope: string;
  history: ModelMessage[];
  state?: LocalAssistantState;
}
@Injectable()
export class AssistantSessionService implements OnModuleDestroy {
  private readonly redis: Redis;
  private readonly secret: string;
  private readonly dailyLimit: number;
  constructor(config: ConfigService) {
    this.redis = new Redis(config.getOrThrow<string>('REDIS_URL'), {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      commandTimeout: 5000,
      retryStrategy: (attempt) => Math.min(10000, 300 * attempt),
    });
    this.redis.on('error', () => {});
    this.secret = config.getOrThrow<string>('JWT_ACCESS_SECRET');
    this.dailyLimit = Math.max(
      1,
      Math.min(1000, Number(config.get('ASSISTANT_DAILY_TURN_LIMIT', 60)) || 60),
    );
  }
  onModuleDestroy() {
    this.redis.disconnect();
  }
  async healthy(): Promise<boolean> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        this.redis.ping().then(value => value === 'PONG'),
        new Promise<boolean>(resolve => { timer = setTimeout(() => resolve(false), 2000); }),
      ]);
    } catch { return false; }
    finally { if (timer) clearTimeout(timer); }
  }
  private sign(payload: string) {
    return createHmac('sha256', this.secret)
      .update(`assistant-guest:${payload}`)
      .digest('base64url');
  }
  principal(businessId: string, actor?: AssistantActor, token?: string) {
    if (actor)
      return { scope: `${businessId}:user:${actor.id}:${actor.role}`, sessionToken: undefined };
    if (!token) {
      const payload = Buffer.from(
        JSON.stringify({ id: randomUUID(), businessId, exp: Date.now() + 3600_000 }),
      ).toString('base64url');
      token = `${payload}.${this.sign(payload)}`;
    }
    try {
      const [payload, signature, extra] = token.split('.');
      const expected = Buffer.from(this.sign(payload)),
        received = Buffer.from(signature || '');
      if (extra || expected.length !== received.length || !timingSafeEqual(expected, received))
        throw new Error();
      const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
      if (data.businessId !== businessId || typeof data.id !== 'string' || data.exp <= Date.now())
        throw new Error();
      return { scope: `${businessId}:guest:${data.id}`, sessionToken: token };
    } catch {
      throw new UnauthorizedException('نشست گفتگو منقضی یا نامعتبر است؛ گفتگوی تازه‌ای شروع کنید.');
    }
  }
  private key(scope: string) {
    return createHash('sha256').update(scope).digest('hex');
  }
  async start(scope: string, conversationId?: string) {
    const id = conversationId || randomUUID();
    const lockKey = `mimo:lock:${id}`;
    const lock = randomUUID();
    if (!(await this.redis.set(lockKey, lock, 'EX', 60, 'NX')))
      throw new ConflictException('لطفاً تا پایان پاسخ قبلی صبر کنید.');
    try {
      const raw = await this.redis.get(`mimo:conversation:${id}`);
      if (conversationId && !raw)
        throw new NotFoundException('گفتگو منقضی شده است؛ گفتگوی تازه‌ای شروع کنید.');
      const stored: Conversation = raw ? JSON.parse(raw) : { scope, history: [] };
      if (stored.scope !== scope) throw new NotFoundException('گفتگو در دسترس نیست.');
      const quotaKey = `mimo:quota:${this.key(scope)}:${new Date().toISOString().slice(0, 10)}`;
      const count = (await this.redis.eval(
        "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],86400) end; return n",
        1,
        quotaKey,
      )) as number;
      if (count > this.dailyLimit) throw new HttpException('سهمیه روزانه گفتگو تمام شده است.', 429);
      return { id, lock, history: stored.history, state: stored.state };
    } catch (error) {
      await this.release(id, lock);
      throw error;
    }
  }
  async save(id: string, scope: string, history: ModelMessage[], state?: LocalAssistantState) {
    const recent = history.slice(-12);
    while (recent.reduce((sum, item) => sum + item.content.length, 0) > 24000 && recent.length > 2)
      recent.splice(0, 2);
    await this.redis.set(
      `mimo:conversation:${id}`,
      JSON.stringify({ scope, history: recent, state }),
      'EX',
      3600,
    );
  }
  async release(id: string, lock: string) {
    await this.redis.eval(
      "if redis.call('GET',KEYS[1])==ARGV[1] then return redis.call('DEL',KEYS[1]) end return 0",
      1,
      `mimo:lock:${id}`,
      lock,
    );
  }
}
