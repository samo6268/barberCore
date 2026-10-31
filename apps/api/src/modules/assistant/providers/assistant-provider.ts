import type { AssistantChatDto } from '../assistant.dto';

export interface ProviderResult {
  content: string;
  citations?: Array<{ title: string; url?: string }>;
}

export interface AssistantProvider {
  readonly name: string;
  respond(request: AssistantChatDto): Promise<ProviderResult>;
}

export const ASSISTANT_PROVIDER = Symbol('ASSISTANT_PROVIDER');
