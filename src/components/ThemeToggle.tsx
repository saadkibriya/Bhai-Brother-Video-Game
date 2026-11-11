import { useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

const STORAGE_KEY = 'bb-theme';

const THEMES: Record<Theme, { name: string; next: Theme }> = {
  dark: { name: 'Dark Knight', next: 'light' },
  light: { name: 'Man of Steel', next: 'dark' },
};

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() =>
    typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark'
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const current = THEMES[theme];
  const next = THEMES[current.next];

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => setTheme(current.next)}
      aria-label={`Theme: ${current.name}. Switch to ${next.name}`}
      title={`${current.name} — switch to ${next.name}`}
    >
      <span className={`theme-toggle__dot theme-toggle__dot--${theme}`} aria-hidden="true" />
      <span className="theme-toggle__label">{current.name}</span>
    </button>
  );
}
