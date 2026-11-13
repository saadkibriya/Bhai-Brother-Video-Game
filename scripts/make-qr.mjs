import QRCode from 'qrcode';
import { writeFile } from 'node:fs/promises';

const DEFAULT_URL = 'https://is.gd/bhaibrothergame';
const url = process.argv[2] || process.env.SITE_URL || DEFAULT_URL;

const svg = await QRCode.toString(url, {
  type: 'svg',
  errorCorrectionLevel: 'M',
  margin: 2,
  color: { dark: '#0b0b0d', light: '#ffffff' },
});

await writeFile('public/qr-site.svg', svg);
console.log(`QR for ${url} → public/qr-site.svg (${svg.length} bytes)`);
