import { FileAudio, Link2, Music2, Play, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';

import { useMediaPlayer } from '@/features/media-player';
import { AnimatedPanel, Button, HeaderPanel, Input, PageLayout, Table, Tabs } from '@/shared/ui';

const formatTrackType = (track: { sourceType: 'file' | 'url' }) =>
  track.sourceType === 'file' ? 'Локальный файл' : 'URL';

export const MediaHubPage = () => {
  const {
    addTrack,
    currentTrack,
    isPlaying,
    play,
    removeTrack,
    setExpanded,
    setPosition,
    setVisible,
    tracks,
    visible,
  } = useMediaPlayer();
  const [activeTab, setActiveTab] = useState('playlist');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [error, setError] = useState<string | null>(null);

  const addUrlTrack = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!url.trim()) {
      setError('Укажите ссылку на аудиофайл.');
      return;
    }
    addTrack({
      artist: artist.trim() || 'Без исполнителя',
      id: `url-${crypto.randomUUID()}`,
      sourceType: 'url',
      src: url.trim(),
      title: title.trim() || url.split('/').pop() || 'Новый трек',
    });
    setUrl('');
    setTitle('');
    setArtist('');
    setError(null);
  };

  const addFileTrack = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (!file.type.startsWith('audio/')) {
      setError('Можно добавлять только аудиофайлы.');
      return;
    }
    addTrack({
      artist: 'Локальный файл',
      id: `file-${crypto.randomUUID()}`,
      sourceType: 'file',
      src: URL.createObjectURL(file),
      title: file.name,
    });
    setError(null);
  };

  const playlistPanel = (
    <div className="flex flex-col gap-gap">
      <AnimatedPanel className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <Link2 aria-hidden="true" className="text-primary-neon h-5 w-5" />
          <div>
            <h2 className="text-text text-lg font-semibold">Добавить по ссылке</h2>
            <p className="text-muted-text text-sm">Работает с прямыми ссылками на audio-файлы.</p>
          </div>
        </div>
        <form
          className="grid gap-gap md:grid-cols-[1.5fr_1fr_1fr_auto] md:items-end"
          onSubmit={addUrlTrack}
        >
          <Input
            label="URL аудио"
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://.../track.mp3"
            value={url}
          />
          <Input
            label="Название"
            onChange={(event) => setTitle(event.target.value)}
            value={title}
          />
          <Input
            label="Исполнитель"
            onChange={(event) => setArtist(event.target.value)}
            value={artist}
          />
          <Button type="submit">Добавить</Button>
        </form>
        <label
          className="border-border bg-elevated/70 text-muted-text mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition hover:border-primary-neon hover:text-text has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-cyber-cyan"
          htmlFor="media-upload-audio"
        >
          <Upload aria-hidden="true" className="h-4 w-4" />
          Добавить файл из устройства
          <input
            accept="audio/*"
            className="sr-only"
            id="media-upload-audio"
            onChange={addFileTrack}
            type="file"
          />
        </label>
        {error && (
          <p className="text-neon-pink mt-3 text-sm" role="alert">
            {error}
          </p>
        )}
      </AnimatedPanel>

      <AnimatedPanel className="min-h-0 flex-1 p-0">
        <Table
          ariaLabel="Плейлист"
          columns={[
            {
              id: 'type',
              header: 'Тип',
              render: (track) => (
                <FileAudio
                  aria-label={formatTrackType(track)}
                  className="text-cyber-cyan h-5 w-5"
                />
              ),
            },
            {
              id: 'title',
              header: 'Трек',
              render: (track) => (
                <button
                  className="text-text cursor-pointer text-left font-medium hover:text-primary-neon"
                  onClick={() => play(track.id)}
                  type="button"
                >
                  <span className="block max-w-[280px] truncate">{track.title}</span>
                  <span className="text-muted-text block text-xs">{track.artist}</span>
                </button>
              ),
            },
            { id: 'source', header: 'Источник', render: formatTrackType },
            {
              id: 'actions',
              header: '',
              className: 'w-28',
              render: (track) => (
                <div className="flex items-center gap-1">
                  <button
                    aria-label={`Воспроизвести ${track.title}`}
                    className="text-muted-text cursor-pointer rounded-lg p-2 hover:text-primary-neon"
                    onClick={() => play(track.id)}
                    type="button"
                  >
                    <Play className="h-4 w-4" />
                  </button>
                  <button
                    aria-label={`Удалить ${track.title}`}
                    className="text-muted-text cursor-pointer rounded-lg p-2 hover:text-neon-pink"
                    onClick={() => removeTrack(track.id)}
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ),
            },
          ]}
          data={tracks}
          emptyText="Плейлист пуст. Добавьте аудиофайл или ссылку."
          getRowKey={(track) => track.id}
        />
      </AnimatedPanel>
    </div>
  );

  const settingsPanel = (
    <div className="grid gap-gap md:grid-cols-2">
      <AnimatedPanel className="p-5">
        <h2 className="text-text text-lg font-semibold">Видимость плеера</h2>
        <p className="text-muted-text mt-1 text-sm">
          Плеер остаётся поверх страниц и не размонтируется при навигации.
        </p>
        <label
          className="text-text mt-5 flex cursor-pointer items-center gap-3 text-sm"
          htmlFor="media-player-visible"
        >
          <input
            checked={visible}
            className="accent-primary-neon h-5 w-5"
            id="media-player-visible"
            onChange={(event) => setVisible(event.target.checked)}
            type="checkbox"
          />
          Показывать плавающий плеер
        </label>
        <Button
          className="mt-4"
          onClick={() => {
            setVisible(true);
            setExpanded(true);
          }}
          size="s"
        >
          Показать и раскрыть
        </Button>
      </AnimatedPanel>
      <AnimatedPanel className="p-5">
        <h2 className="text-text text-lg font-semibold">Положение</h2>
        <p className="text-muted-text mt-1 text-sm">
          Перетащите плеер за верхнюю панель. Положение сохраняется локально.
        </p>
        <Button className="mt-5" onClick={() => setPosition({ x: 24, y: 24 })} size="s">
          Сбросить положение
        </Button>
      </AnimatedPanel>
    </div>
  );

  return (
    <PageLayout>
      <HeaderPanel
        left={
          <>
            <div className="text-primary-neon mb-2 flex items-center gap-gap text-xs font-semibold uppercase tracking-[0.2em]">
              <Music2 aria-hidden="true" className="h-4 w-4" /> Медиа
            </div>
            <h1 className="text-text text-2xl font-semibold sm:text-3xl">Музыкальный центр</h1>
            <p className="text-muted-text mt-1 text-sm">
              Локальный плейлист и плавающий плеер. Backend подключим отдельным срезом.
            </p>
          </>
        }
      />
      <Tabs
        activeId={activeTab}
        items={[
          { component: playlistPanel, id: 'playlist', label: 'Плейлист' },
          { component: settingsPanel, id: 'settings', label: 'Настройки плеера' },
        ]}
        onChange={setActiveTab}
      />
      {currentTrack && (
        <p className="text-muted-text text-xs">
          Сейчас: <span className="text-text">{currentTrack.title}</span> ·{' '}
          {isPlaying ? 'воспроизводится' : 'на паузе'}
        </p>
      )}
    </PageLayout>
  );
};
