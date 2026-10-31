export { attachCharacterGaze } from './character-motion';
export type AssistantDirection = 'rtl' | 'ltr';
export type AssistantReaction = 'idle' | 'greeting' | 'listening' | 'thinking' | 'success' | 'error';
export type ToolRisk = 'read' | 'suggest' | 'draft' | 'confirm' | 'restricted';

export interface AssistantIdentity {
  id?: string;
  displayName?: string;
  role?: string;
  tenantId?: string;
  locale?: string;
}

export interface AssistantPageContext {
  route: string;
  title?: string;
  entityType?: string;
  entityId?: string;
  section?: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
}

export interface AssistantTheme {
  primary?: string;
  primaryForeground?: string;
  background?: string;
  surface?: string;
  text?: string;
  muted?: string;
  border?: string;
  fontFamily?: string;
  radius?: string;
  direction?: AssistantDirection;
  mode?: 'light' | 'dark';
}

export interface AssistantSuggestion {
  id: string;
  label: string;
  prompt: string;
  icon?: string;
  routes?: string[];
  roles?: string[];
}

export interface AssistantManifest {
  assistantId: string;
  businessId: string;
  name: string;
  characterName: string;
  description?: string;
  locale: string;
  direction: AssistantDirection;
  greeting: string;
  inputPlaceholder: string;
  disclosure?: string;
  vocabulary?: Record<string, string>;
  suggestions: AssistantSuggestion[];
  theme?: AssistantTheme;
}

export interface AssistantActionPreview {
  id: string;
  toolName: string;
  title: string;
  description?: string;
  risk: ToolRisk;
  payload: Record<string, unknown>;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  confirmationRequired: boolean;
  expiresAt?: string;
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  action?: AssistantActionPreview;
  citations?: Array<{ title: string; url?: string }>;
}

export interface AssistantChatRequest {
  assistantId: string;
  conversationId?: string;
  message: string;
  identity?: AssistantIdentity;
  context: AssistantPageContext;
}

export interface AssistantChatResponse {
  conversationId: string;
  message: AssistantMessage;
  suggestions?: AssistantSuggestion[];
}

export interface AssistantTool<TInput = unknown, TOutput = unknown> {
  name: string;
  description: string;
  risk: ToolRisk;
  roles?: string[];
  validate?: (input: unknown) => TInput;
  execute: (input: TInput, context: AssistantToolContext) => Promise<TOutput>;
}

export interface AssistantToolContext {
  identity?: AssistantIdentity;
  page: AssistantPageContext;
  signal?: AbortSignal;
}

export class ToolRegistry {
  private readonly tools = new Map<string, AssistantTool>();

  register(tool: AssistantTool): () => void {
    if (this.tools.has(tool.name)) throw new Error(`Assistant tool already registered: ${tool.name}`);
    this.tools.set(tool.name, tool);
    return () => this.tools.delete(tool.name);
  }

  get(name: string, role?: string): AssistantTool | undefined {
    const tool = this.tools.get(name);
    if (!tool) return undefined;
    if (tool.roles?.length && (!role || !tool.roles.includes(role))) return undefined;
    return tool;
  }

  list(role?: string): AssistantTool[] {
    return Array.from(this.tools.values()).filter(
      (tool) => !tool.roles?.length || (!!role && tool.roles.includes(role)),
    );
  }
}

export interface AssistantTransport {
  chat(request: AssistantChatRequest, signal?: AbortSignal): Promise<AssistantChatResponse>;
  confirmAction?(actionId: string, signal?: AbortSignal): Promise<AssistantChatResponse>;
}

export class HttpAssistantTransport implements AssistantTransport {
  constructor(
    private readonly endpoint: string,
    private readonly getToken?: () => string | null | Promise<string | null>,
  ) {}

  async chat(request: AssistantChatRequest, signal?: AbortSignal): Promise<AssistantChatResponse> {
    const token = await this.getToken?.();
    const response = await fetch(`${this.endpoint.replace(/\/$/, '')}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(request),
      signal,
    });
    if (!response.ok) throw new Error(`Assistant gateway returned ${response.status}`);
    const payload = await response.json();
    return (payload.data ?? payload) as AssistantChatResponse;
  }

  async confirmAction(actionId: string, signal?: AbortSignal): Promise<AssistantChatResponse> {
    const token = await this.getToken?.();
    const response = await fetch(
      `${this.endpoint.replace(/\/$/, '')}/actions/${encodeURIComponent(actionId)}/confirm`,
      {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        signal,
      },
    );
    if (!response.ok) throw new Error(`Assistant action confirmation returned ${response.status}`);
    const payload = await response.json();
    return (payload.data ?? payload) as AssistantChatResponse;
  }
}

export function detectHostTheme(element?: Element | null): AssistantTheme {
  if (typeof window === 'undefined') return {};
  const host = element ?? document.documentElement;
  const styles = window.getComputedStyle(host);
  const read = (name: string, fallback = '') => styles.getPropertyValue(name).trim() || fallback;
  const background = read('--color-background', styles.backgroundColor);
  const rgb = background.match(/\d+(?:\.\d+)?/g)?.slice(0, 3).map(Number) ?? [];
  const luminance = rgb.length === 3 ? (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000 : 255;
  return {
    primary: read('--color-primary', '#a86345'),
    primaryForeground: read('--color-primary-foreground', '#fffaf4'),
    background,
    surface: read('--color-surface', '#ffffff'),
    text: read('--color-text', styles.color),
    muted: read('--color-text-muted', '#6f6662'),
    border: read('--color-border', '#ded7d2'),
    fontFamily: read('--font-sans', styles.fontFamily),
    radius: read('--radius-xl', '18px'),
    direction: (styles.direction || document.documentElement.dir || 'ltr') as AssistantDirection,
    mode: luminance < 128 ? 'dark' : 'light',
  };
}

export function resolveSuggestions(
  manifest: AssistantManifest,
  context: AssistantPageContext,
  role?: string,
): AssistantSuggestion[] {
  return manifest.suggestions.filter((suggestion) => {
    const routeMatches = !suggestion.routes?.length || suggestion.routes.some((route) =>
      route === '/' ? context.route === '/' : context.route.startsWith(route),
    );
    const roleMatches = !suggestion.roles?.length || (!!role && suggestion.roles.includes(role));
    return routeMatches && roleMatches;
  });
}
