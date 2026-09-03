import { SVGProps } from 'react';

type ParnegarinMarkProps = SVGProps<SVGSVGElement> & {
  size?: number;
  title?: string;
};

/**
 * Compact, production-safe interpretation of Parnegarin's "ecosystem loop".
 * The two ribbons represent the customer and beauty professional meeting around
 * a trusted centre. Flat colours keep the mark legible at navigation sizes.
 */
export function ParnegarinMark({ size = 32, title, ...props }: ParnegarinMarkProps) {
  const accessibleProps = title
    ? { role: 'img' as const, 'aria-label': title }
    : { 'aria-hidden': true as const };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...accessibleProps}
      {...props}
    >
      <path
        d="M29.6 4.2C20 5.9 12.2 12.7 9.5 21.5c-3.1 10.2 3 20.7 13.3 22.7 6.5 1.3 13.4-1.3 17.1-6.8-4.7 2.2-10.4 2.1-14.8-.6-6.9-4.3-8.8-13.6-4.2-20.3 2.3-3.4 5.8-5.6 9.7-6.5 1.7-.4 2.2-2.7.8-3.7l-1.8-2.1Z"
        fill="#30393D"
      />
      <path
        d="M18.4 43.8C28 42.1 35.8 35.3 38.5 26.5c3.1-10.2-3-20.7-13.3-22.7-6.5-1.3-13.4 1.3-17.1 6.8 4.7-2.2 10.4-2.1 14.8.6 6.9 4.3 8.8 13.6 4.2 20.3-2.3 3.4-5.8 5.6-9.7 6.5-1.7.4-2.2 2.7-.8 3.7l1.8 2.1Z"
        fill="#C9A567"
      />
      <circle cx="24" cy="24" r="2.4" fill="#FBFAF7" />
      <circle cx="24" cy="24" r="1.25" fill="#C9A567" />
    </svg>
  );
}
