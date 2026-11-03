export interface AssistantActor {
  id: string;
  role: string;
}
export interface AssistantSource {
  title: string;
  url?: string;
}
export interface ToolDefinition {
  type: 'function';
  name: string;
  description: string;
  strict: true;
  parameters: {
    type: 'object';
    properties: Record<string, unknown>;
    required: string[];
    additionalProperties: false;
  };
}
export interface ModelMessage {
  role: 'user' | 'assistant';
  content: string;
}
export interface ModelToolResult {
  data: unknown;
  sources?: AssistantSource[];
}
export interface ModelRequest {
  businessId?: string;
  actor?: AssistantActor;
  page?: { route: string; entityId?: string; workflow?: WorkflowContext };
  state?: LocalAssistantState;
  instructions: string;
  history: ModelMessage[];
  tools: ToolDefinition[];
  executeTool: (name: string, input: unknown) => Promise<ModelToolResult>;
}

export interface LocalAssistantState {
  guide?: { id: string; step: number; route: string };
  intent?: 'search' | 'details' | 'availability' | 'owner' | 'staff';
  city?: string;
  service?: string;
  gender?: 'FEMALE' | 'MALE' | 'UNISEX';
  selected?: { id: string; slug?: string; name: string };
  choices?: Array<{ id: string; slug?: string; name: string }>;
  serviceChoices?: Array<{ id: string; name: string }>;
  serviceIds?: string[];
  date?: string;
  pending?: 'city' | 'salon' | 'service' | 'date';
}

/** UI hints only. Never used to authorize a request or to assert a database write. */
export interface WorkflowContext {
  id: string;
  stepId?: string;
  completed?: string[];
  issues?: string[];
}
export interface AssistantGuide {
  id: string;
  title: string;
  currentStep: number;
  totalSteps: number;
  steps: Array<{ id: string; title: string; current: boolean }>;
  href?: string;
  source: 'page-state' | 'guide';
}
