'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { publishAssistantWorkflow, type AssistantWorkflowContext } from '@adaptive-assistant/core';

/** Only identifiers/flags are published. No field values, personal data or automatic form mutations. */
export function useMimoWorkflow(context: AssistantWorkflowContext) {
  const route = usePathname() || '/';
  const snapshot = JSON.stringify(context);
  useEffect(() => publishAssistantWorkflow(route, JSON.parse(snapshot)), [route, snapshot]);
}
