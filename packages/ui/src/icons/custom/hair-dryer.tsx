import { SVGProps } from 'react';

export function HairDryerIcon({ size = 24, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      strokeWidth="1.5"
      stroke="currentColor"
      {...props}
    >
      <path d="M3 7c0-2.2 1.8-4 4-4h7c2.2 0 4 1.8 4 4v4c0 2.2-1.8 4-4 4h-1l-2 4H9l-2-4H7C4.8 15 3 13.2 3 11V7z" />
      <line x1="17" y1="7" x2="21" y2="5" />
      <line x1="17" y1="11" x2="21" y2="13" />
      <line x1="17" y1="9" x2="22" y2="9" />
    </svg>
  );
}
