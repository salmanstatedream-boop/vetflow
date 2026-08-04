import { LOGO_ALT, LOGO_MARK_SRC, LOGO_SRC } from '@/lib/brand';
import { cn } from '@/lib/utils';

type PhoenixLogoProps = {
  className?: string;
  size?: number;
  priority?: boolean;
  /** `mark` = cropped transparent asset for tight UI chrome. */
  variant?: 'full' | 'mark';
};

export default function PhoenixLogo({
  className,
  size = 32,
  priority = false,
  variant = 'full',
}: PhoenixLogoProps) {
  const src = variant === 'mark' ? LOGO_MARK_SRC : LOGO_SRC;
  // Render at 2× intrinsic pixels so downscale stays sharp on retina displays.
  const intrinsic = Math.round(size * 2);

  return (
    // eslint-disable-next-line @next/next/no-img-element -- static brand mark; plain img avoids optimizer issues in small chrome slots
    <img
      src={src}
      alt={LOGO_ALT}
      width={intrinsic}
      height={intrinsic}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      style={{ width: size, height: size }}
      className={cn('shrink-0 object-contain select-none', className)}
    />
  );
}
