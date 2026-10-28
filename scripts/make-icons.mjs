// Gera os ícones PNG do PWA a partir de um SVG desenhado aqui.
// Uso: npm run icons
import { Resvg } from '@resvg/resvg-js';
import { writeFileSync, mkdirSync } from 'node:fs';

const icon = (pad) => {
  // Desenho de acorde (Em): 6 cordas em pé, trastes, duas bolinhas na casa 2.
  const s = 512;
  const inner = s - pad * 2;
  const x0 = pad + inner * 0.2;
  const x1 = pad + inner * 0.8;
  const y0 = pad + inner * 0.2;
  const y1 = pad + inner * 0.85;
  const gx = (x1 - x0) / 5;
  const fy = (y1 - y0) / 3;
  const xs = [0, 1, 2, 3, 4, 5].map((i) => x0 + gx * i);
  const ys = [0, 1, 2, 3].map((i) => y0 + fy * i);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <rect width="${s}" height="${s}" fill="#2a211c"/>
  <rect x="${x0 - 4}" y="${y0 - 14}" width="${x1 - x0 + 8}" height="18" rx="4" fill="#f3eee8"/>
  ${ys.slice(1).map((y) => `<rect x="${x0}" y="${y - 3}" width="${x1 - x0}" height="6" fill="#bcae9f"/>`).join('')}
  ${xs.map((x, i) => `<rect x="${x - (5 - i * 0.6)}" y="${y0}" width="${10 - i * 1.2}" height="${y1 - y0}" fill="#f3eee8"/>`).join('')}
  <circle cx="${xs[1]}" cy="${y0 + fy * 1.5}" r="${gx * 0.42}" fill="#e0643a"/>
  <circle cx="${xs[2]}" cy="${y0 + fy * 1.5}" r="${gx * 0.42}" fill="#e0643a"/>
</svg>`;
};

mkdirSync('public/icons', { recursive: true });
const out = [
  ['icon-192.png', 192, 40],
  ['icon-512.png', 512, 40],
  ['icon-maskable-512.png', 512, 96],
  ['apple-touch-icon.png', 180, 40],
];
for (const [name, size, pad] of out) {
  const png = new Resvg(icon(pad), { fitTo: { mode: 'width', value: size } }).render().asPng();
  writeFileSync(`public/icons/${name}`, png);
}
writeFileSync('public/icons/icon.svg', icon(40));
console.log('Ícones gerados em public/icons/');
