import Image from 'next/image';
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
    <Image
      src={LOGO_SRC}
      alt={LOGO_ALT}
      width={size}
      height={size}
      priority={priority}
      className={cn('shrink-0 object-contain', className)}
    />
  );
}
