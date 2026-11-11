// One-off asset pipeline: screenshots/photos -> small webp + app icons + OG card.
// Run with `bun run images` after changing any source photo in src/assets/source/.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const SRC = 'src/assets/source';
const OUT = 'src/assets/images';
const PUBLIC = 'public';

const lounge = path.join(SRC, 'shop_lounge_interior_1793937075076.jpg');

const covers = {
  fc26: 'game_cover_fc26_1793937072193.jpg',
  tekken8: 'game_cover_tekken8_1793937073457.jpg',
  racing: 'game_cover_racing_1793937074177.jpg',
  spiderman: 'game_cover_spiderman_1793937074730.jpg',
};

await mkdir(OUT, { recursive: true });
await mkdir(path.join(PUBLIC, 'icons'), { recursive: true });

for (const [slug, file] of Object.entries(covers)) {
  await sharp(path.join(SRC, file))
    .resize({ width: 560, withoutEnlargement: true })
    .webp({ quality: 74, effort: 6 })
    .toFile(path.join(OUT, `${slug}.webp`));
}

await sharp(lounge)
  .resize({ width: 1200 })
  .webp({ quality: 72, effort: 6 })
  .toFile(path.join(OUT, 'lounge-1200.webp'));

await sharp(lounge)
  .resize({ width: 700 })
  .webp({ quality: 70, effort: 6 })
  .toFile(path.join(OUT, 'lounge-700.webp'));

// ---- App icon: flat poster mark, no gradients ---------------------------------
const mark = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="108" fill="#0b0b0d"/>
  <rect x="36" y="36" width="440" height="440" rx="76" fill="none" stroke="#ff5a1f" stroke-width="10"/>
  <text x="256" y="340" text-anchor="middle" font-family="DejaVu Sans, Arial Black, sans-serif"
        font-size="250" font-weight="bold" letter-spacing="-18" fill="#ff5a1f">BB</text>
</svg>`;

const markBuffer = Buffer.from(mark);
await sharp(markBuffer).resize(192, 192).png().toFile(path.join(PUBLIC, 'icons/icon-192.png'));
await sharp(markBuffer).resize(512, 512).png().toFile(path.join(PUBLIC, 'icons/icon-512.png'));
await sharp(markBuffer).resize(180, 180).png().toFile(path.join(PUBLIC, 'apple-touch-icon.png'));

// ---- Social card --------------------------------------------------------------
const ogText = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#0b0b0d" opacity="0.55"/>
  <rect x="64" y="392" width="86" height="8" fill="#ff5a1f"/>
  <text x="64" y="300" font-family="DejaVu Sans, Arial Black, sans-serif" font-size="104"
        font-weight="bold" fill="#f6f1e7" letter-spacing="-4">BHAI BROTHER</text>
  <text x="64" y="368" font-family="DejaVu Sans, Arial, sans-serif" font-size="40"
        font-weight="bold" fill="#ff5a1f" letter-spacing="8">VIDEO GAME</text>
  <text x="64" y="462" font-family="DejaVu Sans, Arial, sans-serif" font-size="30"
        fill="#f6f1e7" opacity="0.85">PS5 · PS4 · ARCADE — GREEN CITY, MOHAMMADPUR, DHAKA</text>
</svg>`;

await sharp(lounge)
  .resize(1200, 630, { fit: 'cover' })
  .composite([{ input: Buffer.from(ogText) }])
  .jpeg({ quality: 78, mozjpeg: true })
  .toFile(path.join(PUBLIC, 'og.jpg'));

console.log('optimized images + icons + og.jpg written');
