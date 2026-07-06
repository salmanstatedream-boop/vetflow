import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { PRODUCT_NAME } from '@/lib/brand';

export const alt = `${PRODUCT_NAME} — Clinic Operating System`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  const logoData = await readFile(join(process.cwd(), 'public/phoenix-logo.png'));
  const logoSrc = `data:image/png;base64,${logoData.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 64,
          background: 'linear-gradient(135deg, #03040a 0%, #0b1020 50%, #101a33 100%)',
          color: '#f8fafc',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            marginBottom: 32,
          }}
        >
          <img src={logoSrc} width={72} height={72} alt="" style={{ objectFit: 'contain' }} />
          <span style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.02em' }}>{PRODUCT_NAME}</span>
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            maxWidth: 900,
          }}
        >
          Your whole clinic, one live workspace
        </div>
        <div style={{ fontSize: 24, marginTop: 24, color: 'rgba(148, 163, 184, 0.9)', maxWidth: 800 }}>
          Secure multi-tenant platform for veterinary clinics — appointments, consult, billing, and inventory.
        </div>
      </div>
    ),
    { ...size }
  );
}
