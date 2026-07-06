import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default async function Icon() {
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
          background: '#03040a',
        }}
      >
        <img src={logoSrc} width={30} height={30} alt="" />
      </div>
    ),
    { ...size }
  );
}
