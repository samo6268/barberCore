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

The first release provides the installable shell, Mimo reactions, host theme inheritance, page and user context, route-specific suggestions, HTTP transport, provider abstraction and a read-only NestJS gateway. Model-backed answers, RAG, privileged tool execution and the control panel remain separate delivery phases.
