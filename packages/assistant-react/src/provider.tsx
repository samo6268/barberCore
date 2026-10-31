'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import {
  detectHostTheme,
  resolveSuggestions,
  type AssistantChatResponse,
  type AssistantMessage,
  type AssistantReaction,
  type AssistantSuggestion,
} from '@adaptive-assistant/core';
import type { AssistantProviderProps } from './types';

interface AssistantState {
  open: boolean;
  setOpen: (open: boolean) => void;
  messages: AssistantMessage[];
  suggestions: AssistantSuggestion[];
  reaction: AssistantReaction;
  busy: boolean;
  setListening: (active: boolean) => void;
  send: (message: string) => Promise<void>;
  manifest: AssistantProviderProps['manifest'];
  context: AssistantProviderProps['context'];
  style: CSSProperties;
}

const AssistantContext = createContext<AssistantState | null>(null);

const id = () => `assistant-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function AssistantProvider({
  children,
  manifest,
  transport,
  context,
  identity,
  theme = 'inherit',
  initialOpen = false,
}: AssistantProviderProps) {
  const [open, setOpenState] = useState(initialOpen);
  const [reaction, setReaction] = useState<AssistantReaction>('idle');
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const focused = useRef(false);
  const mounted = useRef(true);
  const completionTimer = useRef<ReturnType<typeof setTimeout>>();
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [conversationId, setConversationId] = useState<string>();
  const [resolvedTheme, setResolvedTheme] = useState(theme === 'inherit' ? {} : theme);
  const reactionTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (theme !== 'inherit') {
      setResolvedTheme(theme);
      return;
    }
    const sync = () => setResolvedTheme(detectHostTheme());
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style', 'data-theme', 'dir'] });
    return () => observer.disconnect();
  }, [theme]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(reactionTimer.current);
      clearTimeout(completionTimer.current);
    };
  }, []);

  const reactFor = useCallback((next: AssistantReaction, duration = 1800) => {
    if (reactionTimer.current) clearTimeout(reactionTimer.current);
    setReaction(next);
    if (next !== 'thinking') reactionTimer.current = setTimeout(() => setReaction(focused.current ? 'listening' : 'idle'), duration);
  }, []);

  const setOpen = useCallback((next: boolean) => {
    setOpenState(next);
    if (next && !pending.current) reactFor('greeting');
    if (!next) focused.current = false;
  }, [reactFor]);

  const setListening = useCallback((active: boolean) => {
    focused.current = active;
    if (!pending.current) reactFor(active ? 'listening' : 'idle');
  }, [reactFor]);

  const suggestions = useMemo(
    () => resolveSuggestions(manifest, context, identity?.role).slice(0, 4),
    [manifest, context, identity?.role],
  );

  const send = useCallback(async (content: string) => {
    const clean = content.trim();
    if (!clean || pending.current) return;
    pending.current = true;
    setBusy(true);
    clearTimeout(completionTimer.current);
    const started = Date.now();
    const settle = (next: AssistantReaction) => {
      if (!mounted.current) return;
      completionTimer.current = setTimeout(() => {
        if (mounted.current && !pending.current) reactFor(next, next === 'error' ? 2500 : 1800);
      }, Math.max(0, 650 - (Date.now() - started)));
    };
    setMessages((current) => [
      ...current,
      { id: id(), role: 'user', content: clean, createdAt: new Date().toISOString() },
    ]);
    reactFor('thinking');
    try {
      const response: AssistantChatResponse = await transport.chat({
        assistantId: manifest.assistantId,
        conversationId,
        message: clean,
        identity,
        context,
      });
      if (!mounted.current) return;
      setConversationId(response.conversationId);
      setMessages((current) => [...current, response.message]);
      settle('success');
    } catch {
      if (!mounted.current) return;
      setMessages((current) => [
        ...current,
        {
          id: id(),
          role: 'assistant',
          content: 'الان ارتباطم با سرویس برقرار نشد. چند لحظه دیگر دوباره امتحان می‌کنیم.',
          createdAt: new Date().toISOString(),
        },
      ]);
      settle('error');
    } finally {
      pending.current = false;
      if (mounted.current) setBusy(false);
    }
  }, [context, conversationId, identity, manifest.assistantId, reactFor, transport]);

  const style = useMemo(() => ({
    '--assistant-primary': resolvedTheme.primary,
    '--assistant-primary-foreground': resolvedTheme.primaryForeground,
    '--assistant-background': resolvedTheme.background,
    '--assistant-surface': resolvedTheme.surface,
    '--assistant-text': resolvedTheme.text,
    '--assistant-muted': resolvedTheme.muted,
    '--assistant-border': resolvedTheme.border,
    '--assistant-font': resolvedTheme.fontFamily,
    '--assistant-radius': resolvedTheme.radius,
  } as CSSProperties), [resolvedTheme]);

  const value = useMemo(() => ({
    open, setOpen, messages, suggestions, reaction, busy, setListening, send, manifest, context, style,
  }), [open, setOpen, messages, suggestions, reaction, busy, setListening, send, manifest, context, style]);

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
}

export function useAssistant() {
  const value = useContext(AssistantContext);
  if (!value) throw new Error('useAssistant must be used inside AssistantProvider');
  return value;
}
