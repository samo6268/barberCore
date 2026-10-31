'use client';
import {
  AssistantTransportError,
  type AssistantChatRequest,
  type AssistantChatResponse,
  type AssistantTransport,
} from '@adaptive-assistant/core';
import type { AxiosError } from 'axios';
import { api } from '@/lib/api';

/** Reuses the app's token attachment and refresh queue instead of bypassing them. */
export function createParnegarinAssistantTransport(): AssistantTransport {
  let sessionToken: string | undefined;
  return {
    resetConversation() {
      sessionToken = undefined;
    },
    async chat(
      request: AssistantChatRequest,
      signal?: AbortSignal,
    ): Promise<AssistantChatResponse> {
      try {
        const { data } = await api.post(
          '/assistant/chat',
          { ...request, sessionToken },
          { signal },
        );
        const result = (data.data ?? data) as AssistantChatResponse;
        sessionToken = result.sessionToken ?? sessionToken;
        return result;
      } catch (error) {
        const response = (error as AxiosError<{ message?: string }>).response;
        const status = response?.status ?? 0;
        const message =
          status === 401
            ? 'برای دیدن اطلاعات شخصی دوباره وارد شوید.'
            : status === 404
              ? 'گفتگو منقضی شده است؛ از دکمه گفتگوی تازه استفاده کنید.'
              : status === 429
                ? 'سهمیه یا ظرفیت گفتگو کافی نیست؛ کمی بعد تلاش کنید.'
                : status === 409
                  ? 'لطفاً تا پایان پاسخ قبلی صبر کنید.'
                  : status === 503 && typeof response?.data.message === 'string'
                    ? response.data.message
                    : 'ارتباط با سرویس میمو برقرار نشد؛ دوباره تلاش کنید.';
        throw new AssistantTransportError(message, status);
      }
    },
  };
}
