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
  { key: '--color-button', label: 'Цвет кнопок', fallback: '#b026ff' },
] as const;
export type ThemeColorKey = (typeof THEME_COLOR_TOKENS)[number]['key'];
export type ThemePreferences = Partial<Record<ThemeColorKey, string>> & {
  backgroundImage?: string;
  animatedPanelOpacity?: number;
  animatedPanelBlur?: number;
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
  const panelOpacity =
    typeof preferences.animatedPanelOpacity === 'number'
      ? Math.min(1, Math.max(0.2, preferences.animatedPanelOpacity))
      : 0.9;
  root.style.setProperty('--animated-panel-opacity', String(panelOpacity));
  const panelBlur =
    typeof preferences.animatedPanelBlur === 'number'
      ? Math.min(32, Math.max(0, preferences.animatedPanelBlur))
      : 12;
  root.style.setProperty('--animated-panel-blur', `${panelBlur}px`);
  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(preferences));
  window.dispatchEvent(new CustomEvent('my-love-theme-change'));
};
export const resetThemePreferences = () => applyThemePreferences({});
export const initializeTheme = () => applyThemePreferences(readThemePreferences());
