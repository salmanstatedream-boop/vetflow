import { mkdir, writeFile } from 'node:fs/promises';

const images = {
  queue: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop&auto=format&fm=webp',
  consultation: 'https://images.unsplash.com/photo-1628009368237-30f99d2a1f4d?w=800&h=600&fit=crop&auto=format&fm=webp',
  inventory: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=600&fit=crop&auto=format&fm=webp',
  billing: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop&auto=format&fm=webp',
  documents: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=600&fit=crop&auto=format&fm=webp',
  dashboards: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&auto=format&fm=webp',
  audit: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=600&fit=crop&auto=format&fm=webp',
  appointments: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=800&h=600&fit=crop&auto=format&fm=webp',
  'multi-clinic': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop&auto=format&fm=webp',
};

await mkdir('public/features', { recursive: true });

for (const [name, url] of Object.entries(images)) {
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`Failed ${name}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(`public/features/${name}.webp`, buf);
  console.log(`saved ${name}.webp (${buf.length} bytes)`);
}
