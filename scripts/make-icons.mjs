// Gera os PNGs dos ícones a partir do SVG (roda uma vez; os PNGs ficam versionados).
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';
const svg = readFileSync('public/icons/favicon.svg');
const maskable = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#f97316"/><g transform="translate(8 8) scale(0.75)">${svg
    .toString()
    .replace(/<svg[^>]*>|<\/svg>|<rect[^>]*\/>/g, '')}</g></svg>`,
);
for (const [name, size, src] of [
  ['icon-192.png', 192, svg],
  ['icon-512.png', 512, svg],
  ['apple-touch-icon.png', 180, svg],
  ['icon-maskable-512.png', 512, maskable],
]) {
  writeFileSync(`public/icons/${name}`, await sharp(src).resize(size, size).png().toBuffer());
}
console.log('ícones gerados');
