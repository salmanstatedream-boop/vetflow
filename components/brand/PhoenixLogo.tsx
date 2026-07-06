import { LOGO_ALT, LOGO_SRC } from '@/lib/brand';
import { cn } from '@/lib/utils';

type PhoenixLogoProps = {
  className?: string;
  size?: number;
  priority?: boolean;
};

export default function PhoenixLogo({
  className,
  size = 32,
  priority = false,
}: PhoenixLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static brand mark; plain img avoids optimizer issues in small chrome slots
    <img
      src={LOGO_SRC}
      alt={LOGO_ALT}
      width={size}
      height={size}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className={cn('shrink-0 object-contain', className)}
    />
  );
}
