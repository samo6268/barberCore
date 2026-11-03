import type { AssistantGuide, LocalAssistantState, ModelRequest } from '../assistant.types';
export interface ProviderResult {
  content: string;
  state?: LocalAssistantState;
  citations?: Array<{ title: string; url?: string }>;
  guide?: AssistantGuide;
  suggestions?: Array<{ id: string; label: string; prompt: string }>;
}
export interface AssistantProvider {
  readonly name: string;
  isReady(): boolean;
  capabilities?(): Record<string, unknown>;
  respond(request: ModelRequest): Promise<ProviderResult>;
}
export const ASSISTANT_PROVIDER = Symbol('ASSISTANT_PROVIDER');
