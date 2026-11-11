import { createRoot } from 'react-dom/client';
import '@fontsource/anton/latin-400.css';
import '@fontsource-variable/instrument-sans/wght.css';
import '@fontsource/hind-siliguri/bengali-400.css';
import '@fontsource/hind-siliguri/bengali-600.css';
import './styles.css';
import App from './App';

createRoot(document.getElementById('root')!).render(<App />);

// Installable app: cache the shell, never cache API responses.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* installability is a bonus, not a requirement */
    });
  });
}
