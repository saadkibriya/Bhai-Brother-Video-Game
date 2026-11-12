// The public build (GitHub Pages) ships only the shop pages: no staff panel,
// no counter QR page. The counter deployment keeps them.
const env = import.meta.env;

export const PUBLIC_ONLY = env?.VITE_PUBLIC_ONLY === '1';

// Where the counter API lives when the page is served from another origin.
export const API_BASE = (env?.VITE_API_BASE ?? '').replace(/\/$/, '');

// Router base, from Vite's base path ("/" or "/repo-name/").
export const ROUTER_BASE = (env?.BASE_URL ?? '/').replace(/\/$/, '') || '/';
