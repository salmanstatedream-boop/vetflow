'use client';

import { useState } from 'react';
import { PawPrint } from 'lucide-react';
import { resolveClinicLogoSrc } from '@/lib/branding/clinic-logo';
import PhoenixLogo from '@/components/brand/PhoenixLogo';
import { cn } from '@/lib/utils';

type ClinicOrPlatformLogoProps = {
  clinicLogoUrl?: string | null;
  size?: number;
  className?: string;
  imgClassName?: string;
  platformWrapperClassName?: string;
  /** When no clinic logo: Phoenix mark (platform) or paw (clinic). */
  fallback?: 'phoenix' | 'paw';
};

export default function ClinicOrPlatformLogo({
  clinicLogoUrl,
  size = 32,
  className,
  imgClassName,
  platformWrapperClassName,
  fallback = 'phoenix',
}: ClinicOrPlatformLogoProps) {
  const [failed, setFailed] = useState(false);
  const logoSrc = resolveClinicLogoSrc(clinicLogoUrl);

  if (!logoSrc || failed) {
    return (
      <div
        className={cn(
          'flex items-center justify-center overflow-hidden border border-primary/20 bg-surface-container/40',
          platformWrapperClassName,
          className
        )}
        style={{ width: size, height: size }}
      >
        {fallback === 'paw' ? (
          <PawPrint
            className="text-primary"
            style={{ width: Math.round(size * 0.55), height: Math.round(size * 0.55) }}
            aria-hidden
          />
        ) : (
          <PhoenixLogo size={Math.round(size * 0.78)} />
        )}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- clinic logos are dynamic URLs from storage or external hosts
    <img
      src={logoSrc}
      alt=""
      width={size}
      height={size}
      onError={() => setFailed(true)}
      className={cn(
        'object-contain bg-white/10 border border-outline-variant/30',
        imgClassName,
        className
      )}
      style={{ width: size, height: size }}
    />
  );
}
