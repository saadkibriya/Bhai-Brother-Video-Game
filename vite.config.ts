import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type Plugin } from 'vite';

const DEFAULT_SITE = 'https://site-1aa9915efd1d466db27090dd5abebf4b.freebuff.page';
const PUBLIC_PATHS = ['/', '/games', '/pricing', '/book', '/visit'];

// Two builds share this config:
//   default        → the counter deployment (staff panel, QR page, own API)
//   public build   → static shop pages for GitHub Pages (VITE_PUBLIC_ONLY=1,
//                    VITE_SITE_BASE=/repo/, VITE_OUT_DIR=docs)
function publicSitePlugin(options: {
  siteUrl: string;
  base: string;
  outDir: string;
  publicOnly: boolean;
}): Plugin {
  const { siteUrl, base, outDir, publicOnly } = options;

  return {
    name: 'public-site-files',
    transformIndexHtml(html) {
      return html.replaceAll('%VITE_SITE_URL%', siteUrl);
    },
    closeBundle() {
      const dir = resolve(process.cwd(), outDir);
      const index = resolve(dir, 'index.html');
      if (!existsSync(index)) return;

      if (publicOnly) {
        // GitHub Pages has no rewrites: give every public route a real file so
        // deep links answer 200, then hand unknown paths the shell via 404.html.
        for (const path of PUBLIC_PATHS) {
          if (path === '/') continue;
          const folder = resolve(dir, path.slice(1));
          mkdirSync(folder, { recursive: true });
          copyFileSync(index, resolve(folder, 'index.html'));
        }
        copyFileSync(index, resolve(dir, '404.html'));
        writeFileSync(resolve(dir, '.nojekyll'), '');
        // Staff-only files: the service worker and the counter QR artwork.
        for (const name of ['sw.js', 'qr-site.svg']) {
          rmSync(resolve(dir, name), { force: true });
        }
      }

      writeFileSync(
        resolve(dir, 'robots.txt'),
        `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`
      );

      const urls = PUBLIC_PATHS.map(
        (path, index) =>
          `  <url><loc>${siteUrl}${path === '/' ? '/' : path}</loc><priority>${index === 0 ? '1.0' : '0.8'}</priority></url>`
      ).join('\n');
      writeFileSync(
        resolve(dir, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
      );

      const manifest = {
        name: 'Bhai Brother Video Game',
        short_name: 'Bhai Brother',
        description: 'PS5, PS4 and arcade gaming in Green City, Mohammadpur, Dhaka.',
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#0b0b0d',
        theme_color: '#0b0b0d',
        icons: [
          { src: `${base}icons/icon-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: `${base}icons/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
        ],
      };
      writeFileSync(resolve(dir, 'manifest.webmanifest'), `${JSON.stringify(manifest, null, 2)}\n`);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const siteUrl = (env.VITE_SITE_URL || DEFAULT_SITE).replace(/\/+$/, '');
  const rawBase = env.VITE_SITE_BASE || '/';
  const base = `/${rawBase.replace(/^\/+|\/+$/g, '')}/`.replace('//', '/');
  const outDir = env.VITE_OUT_DIR || 'dist';
  const publicOnly = env.VITE_PUBLIC_ONLY === '1';

  return {
    base,
    plugins: [
      react(),
      publicSitePlugin({ siteUrl, base: base === '//' ? '/' : base, outDir, publicOnly }),
    ],
    build: {
      target: 'es2020',
      outDir,
    },
  };
});
