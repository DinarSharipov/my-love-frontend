import { Image, RotateCcw, Upload } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

import {
  applyThemePreferences,
  readThemePreferences,
  resetThemePreferences,
  THEME_COLOR_TOKENS,
  type ThemeColorKey,
} from '@/shared/lib/theme';
import { AnimatedPanel, Button } from '@/shared/ui';

export const ThemeSettingsPanel = () => {
  const [preferences, setPreferences] = useState(readThemePreferences);
  const [imageError, setImageError] = useState<string>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colors = useMemo(
    () =>
      Object.fromEntries(
        THEME_COLOR_TOKENS.map(({ fallback, key }) => [key, preferences[key] ?? fallback]),
      ),
    [preferences],
  ) as Record<ThemeColorKey, string>;
  const panelOpacity =
    typeof preferences.animatedPanelOpacity === 'number' ? preferences.animatedPanelOpacity : 0.9;
  const panelBlur =
    typeof preferences.animatedPanelBlur === 'number' ? preferences.animatedPanelBlur : 12;

  const updateColor = (key: ThemeColorKey, value: string) => {
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    applyThemePreferences(next);
  };

  const reset = () => {
    resetThemePreferences();
    setPreferences({});
    setImageError(undefined);
  };

  const selectImage = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      setImageError('Выберите изображение до 5 МБ.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const next = { ...preferences, backgroundImage: String(reader.result) };
      setPreferences(next);
      applyThemePreferences(next);
      setImageError(undefined);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full space-y-3 p-1 sm:p-2">
      <AnimatedPanel className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-gap">
          <div>
            <h2 className="text-text flex items-center gap-gap text-lg font-semibold">
              <Image className="text-cyber-cyan size-5" /> Темизация
            </h2>
            <p className="text-muted-text mt-1 text-sm">
              Настройте акценты интерфейса. Изменения сохраняются только на этом устройстве.
            </p>
          </div>
          <Button
            className="opacity-80"
            icon={<RotateCcw className="size-4" />}
            onClick={reset}
            size="s"
          >
            Сбросить
          </Button>
        </div>
        <div className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-gap">
          {THEME_COLOR_TOKENS.map(({ key, label }) => (
            <label
              className="border-border bg-elevated/35 flex items-center gap-gap rounded-xl border p-3"
              htmlFor={`theme-${key}`}
              key={key}
            >
              <input
                aria-label={label}
                className="size-10 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                id={`theme-${key}`}
                onChange={(event) => updateColor(key, event.target.value)}
                type="color"
                value={colors[key]}
              />
              <span className="min-w-0">
                <span className="text-text block truncate text-sm font-medium">{label}</span>
                <span className="text-muted-text text-xs uppercase">{colors[key]}</span>
              </span>
            </label>
          ))}
        </div>
        <label className="border-border bg-elevated/35 mt-3 block rounded-xl border p-3">
          <span className="text-text block text-sm font-medium">Прозрачность AnimatedPanel</span>
          <span className="text-muted-text mt-1 block text-xs">
            Панели: {Math.round(panelOpacity * 100)}%
          </span>
          <input
            aria-label="Прозрачность AnimatedPanel"
            className="accent-primary-neon mt-3 w-full cursor-pointer"
            max="1"
            min="0"
            onChange={(event) => {
              const next = { ...preferences, animatedPanelOpacity: Number(event.target.value) };
              setPreferences(next);
              applyThemePreferences(next);
            }}
            step="0.05"
            type="range"
            value={panelOpacity}
          />
        </label>
        <label className="border-border bg-elevated/35 mt-3 block rounded-xl border p-3">
          <span className="text-text block text-sm font-medium">Размытие AnimatedPanel</span>
          <span className="text-muted-text mt-1 block text-xs">Blur: {panelBlur} px</span>
          <input
            aria-label="Размытие AnimatedPanel"
            className="accent-primary-neon mt-3 w-full cursor-pointer"
            max="32"
            min="0"
            onChange={(event) => {
              const next = { ...preferences, animatedPanelBlur: Number(event.target.value) };
              setPreferences(next);
              applyThemePreferences(next);
            }}
            step="1"
            type="range"
            value={panelBlur}
          />
        </label>
      </AnimatedPanel>
      <AnimatedPanel className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-gap">
          <div>
            <h2 className="text-text text-lg font-semibold">Фон</h2>
            <p className="text-muted-text mt-1 text-sm">
              Выберите изображение для фоновой сцены. Оно хранится локально.
            </p>
          </div>
          <Button
            icon={<Upload className="size-4" />}
            onClick={() => fileInputRef.current?.click()}
            size="s"
          >
            Выбрать изображение
          </Button>
        </div>
        <input
          accept="image/*"
          className="hidden"
          onChange={(event) => selectImage(event.target.files?.[0])}
          ref={fileInputRef}
          type="file"
        />
        {imageError && (
          <p className="text-neon-pink mt-3 text-sm" role="alert">
            {imageError}
          </p>
        )}
        {preferences.backgroundImage && (
          <Button
            className="mt-3 opacity-80"
            onClick={() => {
              const next = { ...preferences };
              delete next.backgroundImage;
              setPreferences(next);
              applyThemePreferences(next);
            }}
            size="s"
          >
            Убрать изображение
          </Button>
        )}
      </AnimatedPanel>
    </div>
  );
};
