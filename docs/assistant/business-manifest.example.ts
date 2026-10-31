import type { AssistantManifest } from '@adaptive-assistant/core';

export const exampleManifest: AssistantManifest = {
  assistantId: 'example-product',
  businessId: 'example-tenant',
  name: 'Example Assistant',
  characterName: 'Mimo',
  locale: 'en-US',
  direction: 'ltr',
  greeting: 'Hi, I am Mimo. How can I help?',
  inputPlaceholder: 'Ask Mimo…',
  disclosure: 'Mimo is an AI assistant. Important actions require your approval.',
  vocabulary: {
    customer: 'client',
    order: 'request',
  },
  suggestions: [
    {
      id: 'page-help',
      label: 'Help with this page',
      prompt: 'What can I do on this page?',
    },
  ],
};
