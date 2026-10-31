import type { LocalAssistantState, ModelRequest } from '../assistant.types';
export interface ProviderResult {
  content: string;
  state?: LocalAssistantState;
  citations?: Array<{ title: string; url?: string }>;
}
export interface AssistantProvider {
  readonly name: string;
  isReady(): boolean;
  respond(request: ModelRequest): Promise<ProviderResult>;
}
export const ASSISTANT_PROVIDER = Symbol('ASSISTANT_PROVIDER');
