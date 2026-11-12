// The public build (GitHub Pages) ships only the shop pages: no staff panel,
// no counter QR page. The counter deployment keeps them.
export const PUBLIC_ONLY = import.meta.env.VITE_PUBLIC_ONLY === '1';

// Where the counter API lives when the page is served from another origin.
export const API_BASE = (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '');

// Router base, from Vite's base path ("/" or "/repo-name/").
export const ROUTER_BASE = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';
