import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const outDir = path.join(process.cwd(), 'public', 'solution-journey');
const srcDir =
  'C:/Users/HP PC/AppData/Roaming/Cursor/User/workspaceStorage/61a4a5a50e2d8eb207927c2653ae2bfb/images';

const map = [
  { out: '01-appointment', src: 'image-22623938-4b60-4042-8ba6-a41302ea2cc0.png', minW: 2048 },
  { out: '02-checkin', src: 'image-f1f15cae-29bd-4e89-8845-c2075ede9553.png', minW: 2048 },
  { out: '03-ai-analysis', src: 'image-0ceb6895-9c4f-4af0-a591-285643e4d501.png', minW: 2048 },
  { out: '04-consultation', src: 'image-9344d788-fc49-4025-a866-173066ca694f.png', minW: 2554 },
  { out: '05-treatment', src: 'image-7a7929f6-8aeb-47db-a4f4-defe26f98c97.png', minW: 2048 },
  { out: '06-billing', src: 'image-85e25882-2f17-41db-9013-86b176971d0a.png', minW: 2048 },
  { out: '07-followup', src: 'image-e0abf92b-e6b5-4739-9484-44ad62d48a7c.png', minW: 2048 },
];

fs.mkdirSync(outDir, { recursive: true });

for (const item of map) {
  const input = path.join(srcDir, item.src);
  const meta = await sharp(input).metadata();
  const targetW = Math.max(item.minW, (meta.width ?? 1024) * 2);
  const pngOut = path.join(outDir, `${item.out}.png`);
  const webpOut = path.join(outDir, `${item.out}.webp`);

  const base = sharp(input)
    .resize({ width: targetW, kernel: sharp.kernel.lanczos3 })
    .sharpen({ sigma: 0.85, m1: 0.65, m2: 0.4 });

  await base.clone().png({ compressionLevel: 8, adaptiveFiltering: true }).toFile(pngOut);
  await base.clone().webp({ quality: 94, effort: 5, smartSubsample: true }).toFile(webpOut);

  const outMeta = await sharp(pngOut).metadata();
  const pngSize = (fs.statSync(pngOut).size / 1024).toFixed(0);
  const webpSize = (fs.statSync(webpOut).size / 1024).toFixed(0);
  console.log(
    `${item.out}: ${meta.width}x${meta.height} -> ${outMeta.width}x${outMeta.height} | png ${pngSize}KB | webp ${webpSize}KB`,
  );
}
