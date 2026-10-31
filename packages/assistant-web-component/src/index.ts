import {
  HttpAssistantTransport,
  attachCharacterGaze,
  AssistantTransportError,
  safeAssistantUrl,
  type AssistantMessage,
  detectHostTheme,
  resolveSuggestions,
  type AssistantIdentity,
  type AssistantManifest,
  type AssistantPageContext,
  type AssistantReaction,
  type AssistantTransport,
} from '@adaptive-assistant/core';

export interface AdaptiveAssistantConfig {
  manifest: AssistantManifest;
  endpoint?: string;
  transport?: AssistantTransport;
  identity?: AssistantIdentity;
  context?: AssistantPageContext;
  tokenProvider?: () => string | null | Promise<string | null>;
}

const baseStyles = `
  :host { --aa-primary:#a86345; --aa-bg:#1d1715; --aa-surface:#261d19; --aa-text:#f7eee6; --aa-muted:#a99487; --aa-border:#4a3a31; --aa-font:system-ui,sans-serif; position:fixed; inset-inline-start:max(18px,env(safe-area-inset-left)); inset-block-end:max(18px,env(safe-area-inset-bottom)); z-index:2147483000; font-family:var(--aa-font); color:var(--aa-text); }
  * { box-sizing:border-box } button,input { font:inherit } button { cursor:pointer }
  .launcher { width:76px;height:76px;border:1px solid color-mix(in srgb,var(--aa-primary),white 25%);border-radius:28px;background:linear-gradient(145deg,color-mix(in srgb,var(--aa-surface),white 8%),var(--aa-surface));box-shadow:0 18px 50px #0006,0 0 0 5px color-mix(in srgb,var(--aa-primary),transparent 82%);display:grid;place-items:center;color:inherit;transition:.25s ease }
  .launcher:hover { transform:translateY(-4px) scale(1.03) }.open .launcher { opacity:0;pointer-events:none;transform:scale(.7) }
  .mimo { position:relative;width:62px;height:58px;animation:breathe 3.2s ease-in-out infinite }.body{position:absolute;inset:8px 4px 2px;overflow:hidden;border:1px solid #ffffff9c;border-radius:50% 50% 46% 46%;background:radial-gradient(circle at 38% 24%,#fff 0 7%,#f6eadd 29%,color-mix(in srgb,var(--aa-primary),#d8b69d 58%) 100%);box-shadow:inset -7px -10px 16px #49231638,inset 5px 6px 12px #ffffffb3,0 8px 14px #0004}.antenna{position:absolute;z-index:2;top:0;left:50%;width:3px;height:13px;transform:translateX(-50%);background:var(--aa-primary);border-radius:3px}.antenna:before{content:'';position:absolute;top:-2px;left:-3px;width:9px;height:9px;border-radius:50%;background:var(--aa-primary);box-shadow:0 0 12px var(--aa-primary)}.eye{position:absolute;top:17px;width:15px;height:18px;border:2px solid #3a241d;border-radius:50%;background:#2b1b18;animation:blink 5s infinite}.eye:before{content:'';position:absolute;top:2px;left:3px;width:6px;height:7px;border-radius:50%;background:#fff}.e1{left:11px}.e2{right:11px}.mouth{position:absolute;top:38px;left:50%;width:10px;height:6px;transform:translateX(-50%);border-bottom:2px solid #5e3029;border-radius:0 0 50% 50%}.hand{position:absolute;z-index:2;bottom:0;width:19px;height:12px;border-radius:50%;background:color-mix(in srgb,var(--aa-primary),#f1dfcf 55%);box-shadow:0 4px 8px #0003}.h1{left:0}.h2{right:0}.thinking{display:none;position:absolute;top:-5px;right:-8px}.thinking i{display:inline-block;width:5px;height:5px;margin:2px;border-radius:50%;background:var(--aa-primary);animation:dot .7s infinite alternate}.thinking i:nth-child(2){animation-delay:.15s}.thinking i:nth-child(3){animation-delay:.3s}.reaction-thinking .thinking{display:block}.reaction-greeting .h2{animation:wave .6s 3}.reaction-success .mimo{animation:celebrate .55s ease}
  .panel { position:absolute;bottom:0;left:0;width:min(390px,calc(100vw - 28px));height:min(650px,calc(100vh - 36px));display:none;grid-template-rows:auto 1fr auto;overflow:hidden;border:1px solid var(--aa-border);border-radius:22px;background:var(--aa-bg);box-shadow:0 30px 90px #0007;direction:var(--aa-direction,rtl);animation:panel .35s ease both }.open .panel{display:grid}.header{display:flex;align-items:center;gap:10px;min-height:75px;padding:10px 13px;border-bottom:1px solid var(--aa-border);background:linear-gradient(135deg,color-mix(in srgb,var(--aa-primary),transparent 86%),transparent)}.mini{width:51px;height:47px;transform:scale(.8)}.title{display:grid;gap:2px}.title strong{font-size:15px}.title span{font-size:11px;color:var(--aa-muted)}.close{margin-inline-start:auto;border:0;background:transparent;color:var(--aa-muted);font-size:24px}.log{overflow:auto;padding:16px}.welcome{padding:14px;border:1px solid color-mix(in srgb,var(--aa-primary),transparent 65%);border-radius:16px;background:color-mix(in srgb,var(--aa-primary),transparent 90%);font-size:13px;line-height:1.8}.suggestions{display:grid;gap:8px;margin-top:12px}.suggestions button{min-height:46px;padding:9px 12px;border:1px solid var(--aa-border);border-radius:13px;background:var(--aa-surface);color:var(--aa-text);text-align:start}.message{width:fit-content;max-width:88%;margin-top:10px;padding:10px 12px;border-radius:15px;font-size:13px;line-height:1.75;white-space:pre-wrap}.user{margin-inline-start:auto;background:var(--aa-primary);color:white}.assistant{border:1px solid var(--aa-border);background:var(--aa-surface)}.composer{display:grid;grid-template-columns:1fr 42px;gap:8px;padding:10px 12px;border-top:1px solid var(--aa-border);background:var(--aa-surface)}.composer input{height:42px;min-width:0;padding:0 12px;border:1px solid var(--aa-border);border-radius:12px;background:var(--aa-bg);color:var(--aa-text);outline:0}.composer button{border:0;border-radius:12px;background:var(--aa-primary);color:white}
  @keyframes panel{from{opacity:0;transform:translateY(14px) scale(.96)}to{opacity:1;transform:none}}@keyframes breathe{50%{transform:translateY(-2px) scale(1.015)}}@keyframes blink{0%,46%,50%,100%{transform:scaleY(1)}48%{transform:scaleY(.08)}}@keyframes wave{50%{transform:translateY(-11px) rotate(-35deg)}}@keyframes dot{to{transform:translateY(-5px);opacity:.3}}@keyframes celebrate{35%{transform:translateY(-7px) rotate(-5deg)}70%{transform:translateY(-2px) rotate(5deg)}}
  @media(max-width:640px){:host{inset-inline:10px;inset-block-end:max(10px,env(safe-area-inset-bottom))}.panel{position:fixed;inset:auto 0 0;width:100%;height:min(84dvh,720px);border-radius:24px 24px 0 0}}
  @media(prefers-reduced-motion:reduce){*,*:before,*:after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}

  .new-chat + .close { margin-inline-start:0 }
  .sources { display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;font-size:11px }
  .sources a,.sources span { color:var(--aa-text);padding:4px 7px;border:1px solid var(--aa-border);border-radius:8px }
  .eye:before { transform:translate(var(--mimo-gaze-x,0px),var(--mimo-gaze-y,0px));transition:transform .14s ease-out }
  .body,.hand { transition:rotate .35s ease,transform .3s ease }
  .launcher:hover .body { rotate:-5deg }
  .reaction-listening .body { rotate:-5deg }
  .reaction-listening .eye:before { transform:translate(0,2px) }
  .reaction-thinking .body { animation:ponder 2.3s ease-in-out infinite }
  .reaction-thinking .h2 { transform:translate(-10px,-11px) rotate(-35deg) }
  .reaction-thinking .eye:before { animation:thought-gaze 2.3s ease-in-out infinite }
  .reaction-thinking .mouth { width:6px;height:4px;border:1.5px solid #5e3029;border-radius:50% }
  .reaction-success .mouth { width:14px;height:8px;background:#5e3029 }
  .reaction-error .body { rotate:6deg }
  .reaction-error .mouth { border:0;border-top:2px solid #5e3029;border-radius:50% 50% 0 0 }
  button:disabled { opacity:.5;cursor:wait }
  @keyframes ponder { 0%,100% { rotate:-7deg;translate:0 0 } 50% { rotate:-3deg;translate:0 -2px } }
  @keyframes thought-gaze { 0%,100% { transform:translate(-2px,-2px) } 50% { transform:translate(2px,-2px) } }
  @media(prefers-reduced-motion:reduce){.eye:before{transform:none!important}}
`;

const mimo = (mini = false) =>
  `<div class="mimo ${mini ? 'mini' : ''}" aria-hidden="true"><div class="antenna"></div><div class="body"><div class="eye e1"></div><div class="eye e2"></div><div class="mouth"></div></div><div class="hand h1"></div><div class="hand h2"></div><div class="thinking"><i></i><i></i><i></i></div></div>`;

export class AdaptiveAssistantElement extends HTMLElement {
  private config?: AdaptiveAssistantConfig;
  private transport?: AssistantTransport;
  private openState = false;
  private reaction: AssistantReaction = 'idle';
  private conversationId?: string;
  private root: ShadowRoot;
  private cleanupGaze?: () => void;
  private reactionTimer?: ReturnType<typeof setTimeout>;
  private completionTimer?: ReturnType<typeof setTimeout>;
  private busy = false;
  private focused = false;
  private messages: Array<Pick<AssistantMessage, 'role' | 'content' | 'citations'>> = [];
  private generation = 0;

  constructor() {
    super();
    this.root = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if (!this.config) {
      const assistantId = this.getAttribute('assistant-id') || 'default';
      const endpoint = this.getAttribute('endpoint') || '/api/v1/assistant';
      this.configure({ endpoint, manifest: defaultManifest(assistantId) });
    }
    this.render();
    this.cleanupGaze?.();
    this.cleanupGaze = attachCharacterGaze(this.root, '.mimo');
  }

  disconnectedCallback() {
    this.cleanupGaze?.();
    clearTimeout(this.reactionTimer);
    clearTimeout(this.completionTimer);
  }

  configure(config: AdaptiveAssistantConfig) {
    if (
      this.config &&
      (this.config.manifest.assistantId !== config.manifest.assistantId ||
        this.config.identity?.id !== config.identity?.id ||
        this.config.identity?.role !== config.identity?.role)
    ) {
      this.generation++;
      this.messages = [];
      this.conversationId = undefined;
      this.busy = false;
      this.reaction = 'idle';
      clearTimeout(this.completionTimer);
    }
    this.config = config;
    this.transport =
      config.transport ??
      new HttpAssistantTransport(config.endpoint || '/api/v1/assistant', config.tokenProvider);
    if (this.isConnected) this.render();
  }

  setContext(context: AssistantPageContext) {
    if (this.config) this.config.context = context;
  }
  open() {
    this.openState = true;
    if (!this.root.querySelector('.shell')) this.render();
    this.updateShell();
    if (!this.busy) this.setReaction('greeting');
    this.emit('open');
  }
  close() {
    this.openState = false;
    this.focused = false;
    this.updateShell();
    this.emit('close');
  }

  resetConversation() {
    if (this.busy) return;
    this.messages = [];
    this.conversationId = undefined;
    this.transport?.resetConversation?.();
    clearTimeout(this.completionTimer);
    this.reaction = 'greeting';
    this.render();
    this.setReaction('greeting');
  }

  private sourceHtml(citations?: AssistantMessage['citations']) {
    if (!citations?.length) return '';
    return `<div class="sources">${citations
      .map((source) => {
        const url = safeAssistantUrl(source.url);
        return url
          ? `<a href="${escapeHtml(url)}">${escapeHtml(source.title)}</a>`
          : `<span>${escapeHtml(source.title)}</span>`;
      })
      .join('')}</div>`;
  }

  private updateShell() {
    this.root
      .querySelector('.shell')
      ?.setAttribute('class', `shell ${this.openState ? 'open' : ''} reaction-${this.reaction}`);
    this.root.querySelector('.launcher')?.setAttribute('aria-expanded', String(this.openState));
    const status = this.root.querySelector('.status');
    if (status)
      status.textContent = this.busy
        ? 'در حال آماده‌کردن پاسخ…'
        : this.reaction === 'listening'
          ? 'حواسم به شماست'
          : this.reaction === 'success'
            ? 'پاسخ آماده است'
            : this.reaction === 'error'
              ? 'دوباره تلاش کنیم؟'
              : 'دستیار هوشمند شما';
    this.root
      .querySelectorAll<HTMLButtonElement>('.composer button, [data-prompt], .new-chat')
      .forEach((button) => {
        button.disabled = this.busy;
      });
  }

  private setReaction(next: AssistantReaction) {
    clearTimeout(this.reactionTimer);
    this.reaction = next;
    this.updateShell();
    if (next !== 'thinking' && next !== 'idle' && next !== 'listening') {
      this.reactionTimer = setTimeout(
        () => {
          this.reaction = this.focused ? 'listening' : 'idle';
          this.updateShell();
        },
        next === 'error' ? 2500 : 1800,
      );
    }
  }

  private emit(name: string, detail?: unknown) {
    this.dispatchEvent(
      new CustomEvent(`assistant:${name}`, { detail, bubbles: true, composed: true }),
    );
  }

  private applyTheme() {
    const theme = { ...detectHostTheme(this), ...this.config?.manifest.theme };
    const values: Record<string, string | undefined> = {
      '--aa-primary': theme.primary,
      '--aa-bg': theme.background,
      '--aa-surface': theme.surface,
      '--aa-text': theme.text,
      '--aa-muted': theme.muted,
      '--aa-border': theme.border,
      '--aa-font': theme.fontFamily,
      '--aa-direction': theme.direction,
    };
    Object.entries(values).forEach(([key, value]) => value && this.style.setProperty(key, value));
  }

  private render() {
    if (!this.config) return;
    this.applyTheme();
    const manifest = this.config.manifest;
    const context = this.config.context ?? { route: location.pathname };
    const suggestions = resolveSuggestions(manifest, context, this.config.identity?.role).slice(
      0,
      4,
    );
    clearTimeout(this.reactionTimer);
    this.root.innerHTML = `<style>${baseStyles}</style><div class="shell ${this.openState ? 'open' : ''} reaction-${this.reaction}"><section class="panel" role="dialog" aria-label="${escapeHtml(manifest.name)}"><header class="header">${mimo(true)}<div class="title"><strong>${escapeHtml(manifest.characterName)}</strong><span class="status" role="status">دستیار هوشمند شما</span></div><button class="close new-chat" aria-label="گفتگوی تازه" title="گفتگوی تازه">↻</button><button class="close" aria-label="بستن">×</button></header><div class="log"><div class="welcome"><strong>${escapeHtml(manifest.greeting)}</strong>${manifest.description ? `<br>${escapeHtml(manifest.description)}` : ''}</div><div class="suggestions">${suggestions.map((item) => `<button data-prompt="${encodeURIComponent(item.prompt)}">${escapeHtml(item.icon || '✦')} &nbsp; ${escapeHtml(item.label)}</button>`).join('')}</div></div><form class="composer"><input maxlength="4000" aria-label="${escapeHtml(manifest.inputPlaceholder)}" placeholder="${escapeHtml(manifest.inputPlaceholder)}"><button aria-label="ارسال">←</button></form></section><button class="launcher" aria-label="باز کردن ${escapeHtml(manifest.characterName)}" aria-expanded="${this.openState}">${mimo()}</button></div>`;
    const log = this.root.querySelector('.log');
    this.messages.forEach((message) =>
      log?.insertAdjacentHTML(
        'beforeend',
        `<div class="message ${message.role}">${escapeHtml(message.content)}${this.sourceHtml(message.citations)}</div>`,
      ),
    );
    this.updateShell();
    const input = this.root.querySelector('input');
    const listen = (active: boolean) => {
      this.focused = active;
      if (!this.busy) this.setReaction(active ? 'listening' : 'idle');
    };
    input?.addEventListener('focus', () => listen(true));
    input?.addEventListener('input', () => listen(true));
    input?.addEventListener('blur', () => listen(false));
    this.root.querySelector('.shell')?.addEventListener('keydown', (event) => {
      if ((event as KeyboardEvent).key === 'Escape') this.close();
    });
    this.root.querySelector('.launcher')?.addEventListener('click', () => this.open());
    this.root.querySelector('.new-chat')?.addEventListener('click', () => this.resetConversation());
    this.root.querySelector('.close:not(.new-chat)')?.addEventListener('click', () => this.close());
    this.root
      .querySelectorAll<HTMLButtonElement>('[data-prompt]')
      .forEach((button) =>
        button.addEventListener(
          'click',
          () => void this.send(decodeURIComponent(button.dataset.prompt || '')),
        ),
      );
    this.root.querySelector('form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = this.root.querySelector('input');
      if (!this.busy && input?.value.trim()) {
        const value = input.value;
        input.value = '';
        void this.send(value);
      }
    });
  }

  private async send(message: string) {
    if (!this.config || !this.transport || this.busy || !message.trim()) return;
    this.busy = true;
    clearTimeout(this.completionTimer);
    const started = Date.now();
    const generation = this.generation;
    const addMessage = (
      role: 'user' | 'assistant',
      content: string,
      citations?: AssistantMessage['citations'],
    ) => {
      if (generation !== this.generation) return;
      this.messages.push({ role, content, citations });
      const log = this.root.querySelector('.log');
      log?.insertAdjacentHTML(
        'beforeend',
        `<div class="message ${role}">${escapeHtml(content)}${this.sourceHtml(citations)}</div>`,
      );
      log?.scrollTo({
        top: log.scrollHeight,
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
    };
    addMessage('user', message);
    this.setReaction('thinking');
    let result: AssistantReaction = 'success';
    try {
      const response = await this.transport.chat({
        assistantId: this.config.manifest.assistantId,
        conversationId: this.conversationId,
        message,
        identity: this.config.identity,
        context: this.config.context ?? { route: location.pathname },
      });
      if (generation !== this.generation) return;
      this.conversationId = response.conversationId;
      addMessage('assistant', response.message.content, response.message.citations);
      this.emit('message', response);
    } catch (error) {
      addMessage(
        'assistant',
        error instanceof AssistantTransportError
          ? error.message
          : 'ارتباط با سرویس برقرار نشد. لطفاً دوباره تلاش کنید.',
      );
      result = 'error';
    } finally {
      if (generation !== this.generation) return;
      this.busy = false;
      if (this.isConnected) {
        this.updateShell();
        // Keep the thinking pose readable, without delaying the answer itself.
        this.completionTimer = setTimeout(
          () => {
            if (this.isConnected && !this.busy) this.setReaction(result);
          },
          Math.max(0, 650 - (Date.now() - started)),
        );
      }
    }
  }
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char] || char,
  );
}

export function defaultManifest(assistantId = 'default'): AssistantManifest {
  return {
    assistantId,
    businessId: assistantId,
    name: 'دستیار هوشمند',
    characterName: 'میمو',
    locale: 'fa-IR',
    direction: 'rtl',
    greeting: 'سلام! چطور می‌توانم کمکتان کنم؟',
    inputPlaceholder: 'پیامتان را بنویسید…',
    disclosure:
      'پاسخ‌ها توسط هوش مصنوعی تولید می‌شوند؛ پیام و داده لازم به ارائه‌دهنده مدل ارسال می‌شود.',
    suggestions: [
      {
        id: 'page-help',
        label: 'راهنمای این صفحه',
        prompt: 'در این صفحه چه کارهایی می‌توانم انجام بدهم؟',
      },
    ],
  };
}

if (typeof window !== 'undefined' && !customElements.get('adaptive-ai-assistant'))
  customElements.define('adaptive-ai-assistant', AdaptiveAssistantElement);

declare global {
  interface HTMLElementTagNameMap {
    'adaptive-ai-assistant': AdaptiveAssistantElement;
  }
}
