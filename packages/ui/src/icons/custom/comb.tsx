import { SVGProps } from 'react';

export function CombIcon({ size = 24, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
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
      <rect x="2" y="15" width="20" height="4" rx="1" />
      <line x1="5" y1="15" x2="5" y2="8" />
      <line x1="8" y1="15" x2="8" y2="8" />
      <line x1="11" y1="15" x2="11" y2="5" />
      <line x1="14" y1="15" x2="14" y2="8" />
      <line x1="17" y1="15" x2="17" y2="8" />
      <line x1="20" y1="15" x2="20" y2="8" />
    </svg>
  );
}
