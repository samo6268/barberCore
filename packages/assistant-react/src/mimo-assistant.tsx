'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useAssistant } from './provider';
import type { MimoAssistantProps } from './types';

function MimoCharacter({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`aa-mimo ${compact ? 'aa-mimo--compact' : ''}`} aria-hidden="true">
      <div className="aa-mimo__antenna"><span /></div>
      <div className="aa-mimo__ear aa-mimo__ear--left" />
      <div className="aa-mimo__ear aa-mimo__ear--right" />
      <div className="aa-mimo__body">
        <div className="aa-mimo__brow aa-mimo__brow--left" />
        <div className="aa-mimo__brow aa-mimo__brow--right" />
        <div className="aa-mimo__eye aa-mimo__eye--left"><span /></div>
        <div className="aa-mimo__eye aa-mimo__eye--right"><span /></div>
        <div className="aa-mimo__mouth" />
        <div className="aa-mimo__cheek aa-mimo__cheek--left" />
        <div className="aa-mimo__cheek aa-mimo__cheek--right" />
      </div>
      <div className="aa-mimo__hand aa-mimo__hand--left" />
      <div className="aa-mimo__hand aa-mimo__hand--right" />
      <div className="aa-mimo__thinking"><i /><i /><i /></div>
      <div className="aa-mimo__success">✓</div>
    </div>
  );
}

function SendIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 4 17 8-17 8 3-8-3-8Zm3.8 7h7.6L7 7.1 8.5 11h-.7Zm.7 2L7 16.9l8.4-3.9H8.5Z" fill="currentColor" /></svg>;
}

export function MimoAssistant({ className = '', position = 'start' }: MimoAssistantProps) {
  const { open, setOpen, messages, suggestions, reaction, send, manifest, style } = useAssistant();
  const [input, setInput] = useState('');
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const value = input;
    setInput('');
    void send(value);
  };

  return (
    <aside
      className={`aa-root aa-root--${position} aa-reaction--${reaction} ${open ? 'aa-root--open' : ''} ${className}`}
      style={style}
      dir={manifest.direction}
      aria-label={manifest.name}
    >
      {open && (
        <section className="aa-panel" role="dialog" aria-label={manifest.name} aria-modal="false">
          <header className="aa-header">
            <div className="aa-header__character"><MimoCharacter compact /></div>
            <div className="aa-header__copy">
              <strong>{manifest.characterName}</strong>
              <span><i className="aa-status" /> دستیار هوشمند شما</span>
            </div>
            <button className="aa-icon-button" type="button" onClick={() => setOpen(false)} aria-label="بستن دستیار">×</button>
          </header>

          <div className="aa-log" ref={logRef} aria-live="polite">
            <div className="aa-welcome">
              <strong>{manifest.greeting}</strong>
              {manifest.description && <p>{manifest.description}</p>}
            </div>
            {!messages.length && (
              <div className="aa-suggestions">
                {suggestions.map((suggestion) => (
                  <button key={suggestion.id} type="button" onClick={() => void send(suggestion.prompt)}>
                    <span>{suggestion.icon || '✦'}</span>{suggestion.label}
                  </button>
                ))}
              </div>
            )}
            {messages.map((message) => (
              <div key={message.id} className={`aa-message aa-message--${message.role}`}>
                {message.content}
                {message.action && (
                  <div className="aa-action-card">
                    <b>{message.action.title}</b>
                    {message.action.description && <p>{message.action.description}</p>}
                    <button type="button">بررسی و تأیید</button>
                  </div>
                )}
              </div>
            ))}
            {reaction === 'thinking' && <div className="aa-typing"><i /><i /><i /></div>}
          </div>

          <form className="aa-composer" onSubmit={submit}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={manifest.inputPlaceholder}
              aria-label={manifest.inputPlaceholder}
            />
            <button type="submit" disabled={!input.trim() || reaction === 'thinking'} aria-label="ارسال پیام"><SendIcon /></button>
          </form>
          {manifest.disclosure && <small className="aa-disclosure">{manifest.disclosure}</small>}
        </section>
      )}

      <button
        className="aa-launcher"
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={open ? 'بستن دستیار هوشمند' : `باز کردن ${manifest.characterName}`}
      >
        <MimoCharacter />
        {!open && <span className="aa-launcher__hint">کمکی از من برمیاد؟</span>}
      </button>
    </aside>
  );
}
