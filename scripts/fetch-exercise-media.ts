/**
 * Baixa as fotos dos exercícios do free-exercise-db (domínio público) e as converte
 * para WebP em public/media/exercises/<id>/{0,1}.webp.
 *
 * Uso: npm run fetch-media            (só o que falta)
 *      npm run fetch-media -- --force (rebaixa tudo)
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { EXERCISES } from '../src/data/exercises';

const DB_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main';
const OUT_DIR = join(process.cwd(), 'public', 'media', 'exercises');
const WIDTH = 600;
const force = process.argv.includes('--force');

interface DbExercise {
  id: string;
  name: string;
  images: string[];
}

async function main() {
  const res = await fetch(`${DB_URL}/dist/exercises.json`);
  if (!res.ok) throw new Error(`Falha ao baixar exercises.json: ${res.status}`);
  const all = (await res.json()) as DbExercise[];
  const byId = new Map(all.map((e) => [e.id, e]));

  let ok = 0;
  let skipped = 0;
  const missing: string[] = [];

  for (const ex of EXERCISES) {
    const folder = ex.media.datasetFolder;
    if (!folder) continue;
    const entry = byId.get(folder);
    if (!entry) {
      missing.push(`${ex.id} → ${folder}`);
      continue;
    }
    const dir = join(OUT_DIR, ex.id);
    mkdirSync(dir, { recursive: true });
    for (let i = 0; i < Math.min(2, entry.images.length); i++) {
      const target = join(dir, `${i}.webp`);
      if (!force && existsSync(target)) {
        skipped++;
        continue;
      }
      const url = `${DB_URL}/exercises/${entry.images[i]}`;
      const img = await fetch(url);
      if (!img.ok) {
        missing.push(`${ex.id} → ${url} (${img.status})`);
        continue;
      }
      const buf = Buffer.from(await img.arrayBuffer());
      const webp = await sharp(buf)
        .resize({ width: WIDTH, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      writeFileSync(target, webp);
      ok++;
      process.stdout.write(`✓ ${ex.id}/${i}.webp\n`);
    }
  }

  console.log(`\n${ok} imagens baixadas, ${skipped} já existiam.`);
  if (missing.length) {
    console.log('Não encontrados:');
    missing.forEach((m) => console.log('  - ' + m));
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
