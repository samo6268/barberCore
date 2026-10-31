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
  instructions: string;
  history: ModelMessage[];
  tools: ToolDefinition[];
  executeTool: (name: string, input: unknown) => Promise<ModelToolResult>;
}
