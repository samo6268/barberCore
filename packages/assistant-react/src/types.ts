import type {
  AssistantIdentity,
  AssistantManifest,
  AssistantPageContext,
  AssistantTheme,
  AssistantTransport,
} from '@adaptive-assistant/core';
import type { ReactNode } from 'react';

export interface AssistantProviderProps {
  children: ReactNode;
  manifest: AssistantManifest;
  transport: AssistantTransport;
  context: AssistantPageContext;
  identity?: AssistantIdentity;
  theme?: AssistantTheme | 'inherit';
  initialOpen?: boolean;
}

export interface MimoAssistantProps {
  className?: string;
  position?: 'start' | 'end';
}
