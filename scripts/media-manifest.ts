/**
 * Gera src/data/media-manifest.json (o que existe em public/media/exercises)
 * e docs/media-coverage.md (relatório de cobertura).
 * Roda automaticamente antes do build (prebuild) e depois de fetch-media.
 */
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { EXERCISES } from '../src/data/exercises';

const MEDIA_DIR = join(process.cwd(), 'public', 'media', 'exercises');

export interface MediaManifestEntry {
  images?: [string, string];
  video?: string;
}

const manifest: Record<string, MediaManifestEntry> = {};
const rows: string[] = [];
const counts = { dataset: 0, svg: 0, video: 0, pending: 0 };

for (const ex of EXERCISES) {
  const dir = join(MEDIA_DIR, ex.id);
  const entry: MediaManifestEntry = {};
  if (existsSync(dir)) {
    const files = readdirSync(dir);
    if (files.includes('0.webp') && files.includes('1.webp')) {
      entry.images = [`/media/exercises/${ex.id}/0.webp`, `/media/exercises/${ex.id}/1.webp`];
    }
    const video = files.find((f) => /^demo\.(mp4|webm)$/.test(f));
    if (video) entry.video = `/media/exercises/${ex.id}/${video}`;
  }
  if (entry.images || entry.video) manifest[ex.id] = entry;

  let source: string;
  if (entry.video) {
    source = 'vídeo próprio';
    counts.video++;
  } else if (entry.images) {
    source = `dataset (${ex.media.datasetFolder})`;
    counts.dataset++;
  } else if (ex.media.svgKeyframes) {
    source = `SVG (${ex.media.svgKeyframes})`;
    counts.svg++;
  } else if (ex.media.datasetFolder) {
    source = `pendente: rode \`npm run fetch-media\` (${ex.media.datasetFolder})`;
    counts.pending++;
  } else {
    source = 'pendente';
    counts.pending++;
  }
  rows.push(`| ${ex.name} | \`${ex.id}\` | ${ex.category} | ${source} |`);
}

mkdirSync(join(process.cwd(), 'src', 'data'), { recursive: true });
writeFileSync(
  join(process.cwd(), 'src', 'data', 'media-manifest.json'),
  JSON.stringify(manifest, null, 2) + '\n',
);

const md = `# Cobertura de mídia dos exercícios

Gerado por \`npm run media-report\` em ${new Date().toISOString().slice(0, 10)}.

- Fotos do dataset (free-exercise-db, domínio público): **${counts.dataset}**
- Animação SVG (boneco): **${counts.svg}**
- Vídeo próprio: **${counts.video}**
- Pendentes: **${counts.pending}**

Para usar um vídeo seu, coloque \`demo.mp4\` (ou \`demo.webm\`) em \`public/media/exercises/<id>/\` e rode \`npm run media-report\` (o build já faz isso).

| Exercício | id | Categoria | Fonte |
|---|---|---|---|
${rows.join('\n')}
`;
mkdirSync(join(process.cwd(), 'docs'), { recursive: true });
writeFileSync(join(process.cwd(), 'docs', 'media-coverage.md'), md);
console.log(
  `Manifesto: ${Object.keys(manifest).length} exercícios com mídia local. Pendentes: ${counts.pending}.`,
);
