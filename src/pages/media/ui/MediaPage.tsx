import { FileAudio, FileImage, FileVideo, ImagePlus, Play, Trash2, Upload, X } from 'lucide-react';
import { useState } from 'react';

import {
  useFindMediaQuery,
  useListMediaQuery,
  useMediaUploadDirectMutation,
  useRemoveMediaMutation,
  type Media,
} from '@/entities/media';
import { useMediaPlayer } from '@/features/media-player';
import { getApiErrorMessage } from '@/shared/api';
import {
  AnimatedPanel,
  AsyncState,
  Button,
  ConfirmDialog,
  DatePicker,
  Input,
  Modal,
  PageLayout,
  Table,
} from '@/shared/ui';

const PAGE_SIZE = 20;

const formatSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  );

const mediaKind = (media: Media): 'IMAGE' | 'VIDEO' | 'AUDIO' => {
  if (media.kind) return media.kind;
  if (media.mimeType.startsWith('video/')) return 'VIDEO';
  if (media.mimeType.startsWith('audio/')) return 'AUDIO';
  return 'IMAGE';
};

const MediaTypeIcon = ({ media }: { media: Media }) => {
  const kind = mediaKind(media);
  if (kind === 'VIDEO') return <FileVideo aria-label="Видео" className="text-cyber-cyan h-5 w-5" />;
  if (kind === 'AUDIO') return <FileAudio aria-label="Аудио" className="text-cyber-cyan h-5 w-5" />;
  return <FileImage aria-label="Изображение" className="text-primary-neon h-5 w-5" />;
};

const MediaPreview = ({ media }: { media: Media }) => {
  const kind = mediaKind(media);
  if (kind === 'VIDEO') {
    return (
      <video className="max-h-[75vh] max-w-full" controls src={media.downloadUrl}>
        <track kind="captions" label="Русские субтитры" srcLang="ru" src="data:text/vtt,WEBVTT" />
      </video>
    );
  }
  if (kind === 'AUDIO') {
    return (
      <audio className="w-full" controls src={media.downloadUrl}>
        <track kind="captions" label="Русские субтитры" srcLang="ru" src="data:text/vtt,WEBVTT" />
      </audio>
    );
  }
  return (
    <img
      alt={media.originalName}
      className="max-h-[75vh] max-w-full object-contain"
      src={media.downloadUrl}
    />
  );
};

export const MediaPage = () => {
  const [page, setPage] = useState(1);
  const [name, setName] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selected, setSelected] = useState<Media | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Media | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [upload, uploadState] = useMediaUploadDirectMutation();
  const [remove, removeState] = useRemoveMediaMutation();
  const { addTrack, play } = useMediaPlayer();
  const { data: detailData, isFetching: detailIsFetching } = useFindMediaQuery(
    { id: selectedId ?? '' },
    { skip: !selectedId },
  );
  const query = {
    page,
    limit: PAGE_SIZE,
    ...(name ? { name } : {}),
    ...(dateFrom ? { dateFrom } : {}),
    ...(dateTo ? { dateTo } : {}),
  };
  const { data, error, isLoading, refetch } = useListMediaQuery(query);

  const applyFilters = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
  };

  const clearFilters = () => {
    setName('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    setUploadError(null);
    try {
      await upload(file).unwrap();
      setPage(1);
    } catch (uploadRequestError) {
      setUploadError(getApiErrorMessage(uploadRequestError, 'Не удалось загрузить файл'));
    }
  };

  const openMedia = (media: Media) => {
    setSelected(media);
    setSelectedId(media.id);
  };

  const playAudio = (media: Media) => {
    addTrack({
      artist: 'Мой альбом',
      id: media.id,
      sourceType: 'url',
      src: media.downloadUrl,
      title: media.originalName,
    });
    play(media.id);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await remove({ id: pendingDelete.id }).unwrap();
      setPendingDelete(null);
      if (data?.data.length === 1 && page > 1) setPage(page - 1);
    } catch (deleteError) {
      setListError(getApiErrorMessage(deleteError, 'Не удалось удалить файл'));
    }
  };

  const media = data?.data ?? [];
  const previewMedia = selectedId ? (detailData ?? selected) : null;

  return (
    <PageLayout>
      <AnimatedPanel className="page-header">
        <div className="text-primary-neon mb-2 flex items-center gap-gap text-xs font-semibold uppercase tracking-[0.2em]">
          <ImagePlus aria-hidden="true" className="h-4 w-4" />
          Мой альбом
        </div>
        <h1 className="text-text text-2xl font-semibold sm:text-3xl">Фото и видео</h1>
        <p className="text-muted-text mt-1 text-sm">
          Изображения, видео и аудио с приватным доступом.
        </p>
      </AnimatedPanel>

      <AnimatedPanel className="p-5">
        <form
          className="grid gap-gap md:grid-cols-[minmax(0,1.5fr)_repeat(2,minmax(0,1fr))_auto] md:items-end"
          onSubmit={applyFilters}
        >
          <Input label="Имя файла" onChange={(event) => setName(event.target.value)} value={name} />
          <DatePicker
            label="С даты"
            onChange={(event) => setDateFrom(event.target.value)}
            value={dateFrom}
          />
          <DatePicker
            label="По дату"
            onChange={(event) => setDateTo(event.target.value)}
            value={dateTo}
          />
          <div className="flex gap-2 md:justify-end">
            <Button size="s" type="submit">
              Найти
            </Button>
            <Button aria-label="Очистить фильтры" onClick={clearFilters} size="s" type="button">
              <X aria-hidden="true" className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </AnimatedPanel>

      <AnimatedPanel className="flex flex-wrap items-center justify-between gap-gap p-5">
        <div>
          <h2 className="text-text text-lg font-semibold">Добавить медиа</h2>
          <p className="text-muted-text mt-1 text-sm">
            Изображение до 10 МБ, аудио до 100 МБ или видео до 500 МБ.
          </p>
        </div>
        <label className="inline-flex" htmlFor="media-upload-file">
          <input
            accept="image/*,video/*,audio/*"
            className="sr-only"
            disabled={uploadState.isLoading}
            id="media-upload-file"
            onChange={handleUpload}
            type="file"
          />
          <span className="border-[var(--color-button)] bg-surface/20 text-text inline-flex h-10 cursor-pointer items-center justify-center gap-1 rounded-xl border px-5 text-sm font-semibold shadow-[0_0_10px_color-mix(in_srgb,var(--color-button)_55%,transparent)] transition hover:scale-[1.025] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-cyber-cyan">
            <Upload aria-hidden="true" className="h-4 w-4" />
            {uploadState.isLoading ? 'Загрузка…' : 'Выбрать файл'}
          </span>
        </label>
        {uploadError && (
          <p className="text-neon-pink basis-full text-sm" role="alert">
            {uploadError}
          </p>
        )}
      </AnimatedPanel>

      {listError && (
        <p className="text-neon-pink text-sm" role="alert">
          {listError}
        </p>
      )}
      <AsyncState
        error={error}
        errorMessage="Не удалось загрузить альбом"
        hasData={media.length > 0}
        loading={<div />}
        onRetry={refetch}
      >
        <Table
          ariaLabel="Медиафайлы альбома"
          columns={[
            {
              id: 'type',
              header: 'Тип',
              render: (item) => <MediaTypeIcon media={item} />,
            },
            {
              id: 'name',
              header: 'Имя файла',
              render: (item) => (
                <div className="flex items-center gap-1">
                  {mediaKind(item) === 'AUDIO' && (
                    <button
                      aria-label={`Play ${item.originalName}`}
                      className="text-muted-text hover:text-primary-neon cursor-pointer rounded-lg p-2 transition-colors focus-visible:outline-2 focus-visible:outline-cyber-cyan"
                      onClick={() => playAudio(item)}
                      type="button"
                    >
                      <Play className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    className="text-text hover:text-primary-neon max-w-[300px] truncate text-left font-medium underline-offset-4 hover:underline"
                    onClick={() => openMedia(item)}
                    type="button"
                  >
                    {item.originalName}
                  </button>
                </div>
              ),
            },
            { id: 'size', header: 'Размер', render: (item) => formatSize(item.sizeBytes) },
            { id: 'createdAt', header: 'Добавлено', render: (item) => formatDate(item.createdAt) },
            {
              id: 'actions',
              header: '',
              className: 'w-24',
              render: (item) => (
                <button
                  aria-label={`Удалить ${item.originalName}`}
                  className="text-muted-text hover:text-neon-pink rounded-lg p-2 transition-colors focus-visible:outline-2 focus-visible:outline-cyber-cyan"
                  onClick={() => setPendingDelete(item)}
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ),
            },
          ]}
          data={media}
          emptyText="В альбоме пока нет медиафайлов"
          getRowKey={(item) => item.id}
          isLoading={isLoading}
          pagination={{
            disabled: isLoading,
            onChange: setPage,
            page: data?.page ?? page,
            totalPages: data?.totalPages ?? 1,
          }}
        />
      </AsyncState>

      <ConfirmDialog
        description="Файл будет удалён из хранилища без возможности восстановления."
        isLoading={removeState.isLoading}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        open={Boolean(pendingDelete)}
        title="Удалить медиафайл?"
      />

      {previewMedia && (
        <Modal
          ariaLabel="Просмотр медиафайла"
          contentClassName="max-w-5xl"
          onClose={() => {
            setSelected(null);
            setSelectedId(null);
          }}
          open
        >
          <div className="mb-3 flex items-center justify-between gap-gap">
            <h2 className="text-text truncate font-semibold">{previewMedia.originalName}</h2>
            <button
              aria-label="Закрыть просмотр"
              className="text-muted-text hover:text-text cursor-pointer p-2"
              onClick={() => {
                setSelected(null);
                setSelectedId(null);
              }}
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <MediaPreview media={previewMedia} />
          <p className="text-muted-text mt-3 text-xs">
            {formatDate(previewMedia.createdAt)} · {formatSize(previewMedia.sizeBytes)}
          </p>
        </Modal>
      )}
      {detailIsFetching && <span className="sr-only">Загрузка медиафайла</span>}
    </PageLayout>
  );
};
