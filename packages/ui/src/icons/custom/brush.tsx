import { SVGProps } from 'react';

export function BrushIcon({ size = 24, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
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
      <path d="M3 21c3-3 4-8 8-8s6 2 5 5c-3 3-8 4-13 3z" />
      <path d="M11 13L20 4" />
      <path d="M18 2l4 4-2 2-4-4 2-2z" />
    </svg>
  );
}
