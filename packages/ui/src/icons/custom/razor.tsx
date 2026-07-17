import { SVGProps } from 'react';

export function RazorIcon({ size = 24, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
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
      <rect x="3" y="8" width="18" height="8" rx="1" />
      <line x1="7" y1="8" x2="7" y2="16" />
      <line x1="3" y1="12" x2="7" y2="12" />
    </svg>
  );
}
