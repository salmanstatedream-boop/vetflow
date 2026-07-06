import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default async function AppleIcon() {
  const logoData = await readFile(join(process.cwd(), 'public/phoenix-logo.png'));
  const logoSrc = `data:image/png;base64,${logoData.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #03040a 0%, #0b1020 50%, #101a33 100%)',
          borderRadius: 36,
        }}
      >
        <img src={logoSrc} width={140} height={140} alt="" style={{ objectFit: 'contain' }} />
      </div>
    ),
    { ...size }
  );
}
