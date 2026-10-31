# Adaptive Assistant — Mimo

Adaptive Assistant is a framework-neutral, multi-tenant assistant plugin. Parnegarin is its first reference implementation.

## Packages

| Package | Purpose |
| --- | --- |
| `@adaptive-assistant/core` | Shared contracts, HTTP transport, theme detection, context and tool registry |
| `@adaptive-assistant/react` | React provider, Mimo character and conversational UI |
| `@adaptive-assistant/web-component` | Framework-neutral `<adaptive-ai-assistant>` custom element |

## Universal installation

Import and register the custom element, then add it anywhere in the host document:

```ts
import '@adaptive-assistant/web-component';
```

```html
<adaptive-ai-assistant
  assistant-id="my-product"
  endpoint="https://api.example.com/api/v1/assistant"
></adaptive-ai-assistant>
```

For authenticated and context-aware installations, configure the element after sign-in:

```ts
const widget = document.querySelector('adaptive-ai-assistant');

widget.configure({
  endpoint: 'https://api.example.com/api/v1/assistant',
  tokenProvider: () => sessionStorage.getItem('access_token'),
  identity: {
    id: currentUser.id,
    role: currentUser.role,
    tenantId: currentUser.tenantId,
  },
  context: {
    route: location.pathname,
    entityType: 'order',
    entityId: currentOrderId,
  },
  manifest: myBusinessManifest,
});
```

Update the page context after client-side navigation:

```ts
widget.setContext({ route: location.pathname });
```

## Theming contract

The widget automatically reads common host tokens, font, direction and light/dark appearance. A host can provide explicit semantic values:

```css
adaptive-ai-assistant {
  --aa-primary: var(--color-primary);
  --aa-bg: var(--color-background);
  --aa-surface: var(--color-surface);
  --aa-text: var(--color-text);
  --aa-muted: var(--color-text-muted);
  --aa-border: var(--color-border);
  --aa-font: var(--font-sans);
}
```

## Security boundary

- Browser identity and role values are context hints, not proof of authorization.
- The gateway must derive tenant and permissions from a verified token before any privileged tool call.
- Tools execute through existing domain services and never expose database access to the model.
- `confirm` and `restricted` actions require a server-created preview and action-specific confirmation.
- The initial Parnegarin reference implementation is read-only by design.

## Current reference scope

The reference now connects a real Responses-compatible model to curated per-business knowledge, live read-only domain tools and isolated Redis conversations. It includes verified identity, bounded tool execution, source links, cost controls and actionable error states. See [REAL_MODEL_SETUP.md](./REAL_MODEL_SETUP.md) for activation on Mac and Docker.

Privileged writes, an embeddings-based document ingestion pipeline, streaming and the management control panel remain separate phases. The current knowledge retrieval uses curated articles and keyword ranking; it does not claim to crawl or understand arbitrary documents.

## Mimo interaction states

Both adapters now share local-only, animation-frame-throttled pointer tracking. The eyes follow the physical pointer direction, regardless of text direction. Pointer positions are never added to page context or sent to the gateway. Tracking resets on pointer exit/window blur and is disabled for touch input and reduced-motion preferences.

- Hover: a small inquisitive head tilt.
- Opening: a greeting wave.
- Focusing or typing in the composer: attentive downward gaze and raised brows.
- Request pending: tilted head, hand at chin, upward gaze and animated thought dots.
- Response received: smile and a short positive reaction, then return to attentive/idle.
- Network failure: concerned expression and a retry message, then return to attentive/idle.

Fast replies are displayed immediately. Only the character pose has a 650 ms minimum thinking interval so the animation is readable; this is a visual state, not a claim about model reasoning. Concurrent submissions are blocked while a request is pending. Web Component open/close no longer re-creates the conversation DOM or erases history.

Run the local gaze regression checks from the repository root:

```bash
node --test packages/assistant-core/test/character-motion.test.cjs
```
