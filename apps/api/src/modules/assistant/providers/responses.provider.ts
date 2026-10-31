import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import type { AssistantProvider, ProviderResult } from './assistant-provider';
import type { ModelRequest } from '../assistant.types';

interface OutputItem {
  type: string;
  name?: string;
  call_id?: string;
  arguments?: string;
  content?: Array<{ type: string; text?: string; refusal?: string }>;
  [key: string]: unknown;
}

@Injectable()
export class ResponsesAssistantProvider implements AssistantProvider {
  readonly name = 'responses';
  private readonly logger = new Logger(ResponsesAssistantProvider.name);
  constructor(private readonly config: ConfigService) {}

  isReady() {
    return (
      !!this.config.get<string>('ASSISTANT_API_KEY')?.trim() &&
      !!this.config.get<string>('ASSISTANT_MODEL')?.trim()
    );
  }

  async respond(request: ModelRequest): Promise<ProviderResult> {
    if (!this.isReady())
      throw new ServiceUnavailableException(
        'اتصال مدل میمو هنوز تنظیم نشده است. مدیر سامانه باید کلید API و نام مدل را تنظیم کند.',
      );
    const base = this.config
      .get<string>('ASSISTANT_API_BASE_URL', 'https://api.openai.com/v1')
      .replace(/\/$/, '');
    const url = new URL(base);
    if (
      url.protocol !== 'https:' &&
      !(['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) && url.protocol === 'http:')
    ) {
      throw new ServiceUnavailableException('آدرس سرویس مدل باید HTTPS باشد.');
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 45_000);
    const input: unknown[] = [...request.history];
    const sources = new Map<string, { title: string; url?: string }>();
    let toolCalls = 0;
    try {
      for (let round = 0; round < 5; round++) {
        const { data } = await axios.post<{ status: string; output: OutputItem[] }>(
          `${base}/responses`,
          {
            model: this.config.getOrThrow<string>('ASSISTANT_MODEL'),
            instructions: request.instructions,
            input,
            tools: request.tools,
            parallel_tool_calls: false,
            tool_choice: round === 4 ? 'none' : 'auto',
            max_output_tokens: 3000,
            store: false,
          },
          {
            headers: {
              Authorization: `Bearer ${this.config.getOrThrow<string>('ASSISTANT_API_KEY')}`,
              'Content-Type': 'application/json',
            },
            signal: controller.signal,
            timeout: 45_000,
            maxRedirects: 0,
            maxContentLength: 1_000_000,
          },
        );
        if (data.status !== 'completed' || !Array.isArray(data.output))
          throw new Error('Incomplete model response');
        const calls = data.output.filter((item) => item.type === 'function_call');
        if (!calls.length) {
          const content = data.output
            .filter((item) => item.type === 'message')
            .flatMap((item) => item.content ?? [])
            .map((item) =>
              item.type === 'output_text' ? item.text : item.type === 'refusal' ? item.refusal : '',
            )
            .filter(Boolean)
            .join('\n');
          if (!content) throw new Error('Empty model response');
          return { content: content.slice(0, 16000), citations: [...sources.values()].slice(0, 8) };
        }
        input.push(...data.output);
        for (const call of calls) {
          if (++toolCalls > 4 || !call.call_id || !call.name)
            throw new Error('Tool call budget exceeded');
          let result: unknown;
          try {
            const value = await request.executeTool(call.name, JSON.parse(call.arguments ?? '{}'));
            result = value.data;
            for (const source of value.sources ?? [])
              sources.set(source.url || source.title, source);
          } catch {
            result = {
              error:
                'ابزار در دسترس نیست، ورودی معتبر نیست یا مجوز دسترسی ندارید. هیچ داده‌ای را حدس نزنید.',
            };
          }
          input.push({
            type: 'function_call_output',
            call_id: call.call_id,
            output: JSON.stringify(result).slice(0, 24000),
          });
        }
      }
      throw new Error('Response budget exceeded');
    } catch (error) {
      // Never log Axios config, request bodies, tool results or credentials.
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      this.logger.warn({
        event: 'assistant_provider_failure',
        status: status ?? 'timeout_or_protocol',
      });
      throw new ServiceUnavailableException(
        status === 401 || status === 403
          ? 'سرویس مدل اجازه اتصال نداد؛ مدیر سامانه باید کلید و دسترسی ارائه‌دهنده را بررسی کند.'
          : status === 429
            ? 'سهمیه یا ظرفیت سرویس مدل موقتاً کافی نیست؛ لطفاً کمی بعد تلاش کنید.'
            : 'دریافت پاسخ از مدل موقتاً امکان‌پذیر نیست. لطفاً دوباره تلاش کنید.',
      );
    } finally {
      clearTimeout(timer);
    }
  }
}
