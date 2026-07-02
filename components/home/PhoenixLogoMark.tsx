import { cn } from '@/lib/utils';

type PhoenixLogoMarkProps = {
  className?: string;
  size?: number;
};

export default function PhoenixLogoMark({ className, size = 32 }: PhoenixLogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
      aria-hidden
    >
      <rect width="32" height="32" rx="8" fill="url(#phx-logo-grad)" />
      <path
        d="M16 7L22 14L16 25L10 14L16 7Z"
        stroke="white"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="14" r="2.5" fill="#22D3EE" />
      <defs>
        <linearGradient id="phx-logo-grad" x1="0" y1="0" x2="32" y2="32">
          <stop stopColor="#0B1020" />
          <stop offset="1" stopColor="#1E293B" />
        </linearGradient>
      </defs>
    </svg>
  );
}
