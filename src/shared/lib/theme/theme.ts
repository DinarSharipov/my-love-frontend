export const THEME_STORAGE_KEY = 'my-love-theme';
export const THEME_COLOR_TOKENS = [
  { key: '--color-background', label: 'Атрибут-1', fallback: '#05050a' },
  { key: '--color-surface', label: 'Атрибут-2', fallback: '#0b0b14' },
  { key: '--color-elevated', label: 'Атрибут-3', fallback: '#12121e' },
  { key: '--color-border', label: 'Атрибут-4', fallback: '#27233a' },
  { key: '--color-primary-neon', label: 'Атрибут-5', fallback: '#b026ff' },
  { key: '--color-electric-purple', label: 'Атрибут-6', fallback: '#7c3aed' },
  { key: '--color-neon-pink', label: 'Атрибут-7', fallback: '#ff2bd6' },
  { key: '--color-cyber-cyan', label: 'Атрибут-8', fallback: '#00f5ff' },
  { key: '--color-electric-blue', label: 'Атрибут-9', fallback: '#2979ff' },
  { key: '--color-acid-green', label: 'Атрибут-10', fallback: '#39ff88' },
  { key: '--color-text', label: 'Атрибут-11', fallback: '#f4f2ff' },
  { key: '--color-muted-text', label: 'Атрибут-12', fallback: '#8e8aa3' },
] as const;
export type ThemeColorKey = (typeof THEME_COLOR_TOKENS)[number]['key'];
export type ThemePreferences = Partial<Record<ThemeColorKey, string>> & {
  backgroundImage?: string;
};

export const readThemePreferences = (): ThemePreferences => {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(THEME_STORAGE_KEY) ?? '{}');
    return value && typeof value === 'object' ? (value as ThemePreferences) : {};
  } catch {
    return {};
  }
};

export const applyThemePreferences = (preferences: ThemePreferences) => {
  const root = document.documentElement;
  THEME_COLOR_TOKENS.forEach(({ fallback, key }) =>
    root.style.setProperty(key, preferences[key] ?? fallback),
  );
  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(preferences));
  window.dispatchEvent(new CustomEvent('my-love-theme-change'));
};
export const resetThemePreferences = () => applyThemePreferences({});
export const initializeTheme = () => applyThemePreferences(readThemePreferences());
