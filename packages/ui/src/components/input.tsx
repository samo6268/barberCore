'use client';

import { forwardRef, InputHTMLAttributes, useState } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, onFocus, onBlur, value, defaultValue, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const [hasValue, setHasValue] = useState(
      Boolean(value ?? defaultValue ?? props.placeholder === undefined ? false : false)
    );

    const inputId = id || label?.replace(/\s+/g, '-').toLowerCase();
    const isFloated = focused || hasValue;

    return (
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          value={value}
          defaultValue={defaultValue}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => {
            setFocused(false);
            setHasValue(Boolean(e.target.value));
            onBlur?.(e);
          }}
          onChange={(e) => { setHasValue(Boolean(e.target.value)); props.onChange?.(e); }}
          className={[
            'peer w-full bg-transparent pt-5 pb-2 px-0',
            'border-b-2 outline-none',
            'text-body text-[var(--color-text)]',
            'transition-colors duration-200',
            error
              ? 'border-red-500'
              : focused
              ? 'border-[var(--color-border-focus)]'
              : 'border-[var(--ui-gray-200)]',
            'placeholder-transparent',
            className,
          ].join(' ')}
          placeholder={label || ' '}
          {...props}
        />

        {label && (
          <label
            htmlFor={inputId}
            className={[
              'absolute right-0 pointer-events-none',
              'transition-all duration-200 ease-out',
              'font-medium tracking-wide uppercase',
              isFloated
                ? 'top-0 text-caption text-[var(--color-accent)]'
                : 'top-5 text-body text-[var(--color-text-muted)]',
            ].join(' ')}
          >
            {label}
          </label>
        )}

        {error && (
          <p className="mt-1 text-caption text-red-500">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1 text-caption text-[var(--color-text-subtle)]">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
