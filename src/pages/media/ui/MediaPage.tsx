import { FileAudio, ImagePlus, Play, Trash2, Upload, X } from 'lucide-react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useEffect, useMemo, useRef, useState } from 'react';

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

type MediaGalleryCardProps = {
  media: Media;
  onDelete: (media: Media) => void;
  onOpen: (media: Media) => void;
  onPlayAudio: (media: Media) => void;
};

const MediaTileVisual = ({ media, kind }: { kind: ReturnType<typeof mediaKind>; media: Media }) => {
  if (kind === 'IMAGE') {
    return (
      <img
        alt={media.originalName}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        loading="lazy"
        src={media.downloadUrl}
      />
    );
  }

  if (kind === 'VIDEO') {
    return (
      <video
        aria-label={media.originalName}
        className="h-full w-full object-cover"
        muted
        playsInline
        preload="metadata"
        src={media.downloadUrl}
      />
    );
  }

  return (
    <div className="from-cyber-cyan/20 via-surface to-primary-neon/25 flex h-full w-full items-center justify-center bg-gradient-to-br">
      <FileAudio aria-hidden="true" className="text-cyber-cyan h-12 w-12" />
    </div>
  );
};

const MediaGalleryCard = ({ media, onDelete, onOpen, onPlayAudio }: MediaGalleryCardProps) => {
  const kind = mediaKind(media);

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border bg-elevated/70 shadow-[0_0_24px_rgba(176,38,255,0.08)] transition duration-300 hover:-translate-y-0.5 hover:border-primary-neon/70 hover:shadow-[0_0_28px_rgba(176,38,255,0.24)]">
      <button
        aria-label={`Открыть ${media.originalName}`}
        className="relative block aspect-square w-full cursor-pointer overflow-hidden text-left focus-visible:outline-2 focus-visible:outline-cyber-cyan"
        onClick={() => onOpen(media)}
        type="button"
      >
        <MediaTileVisual kind={kind} media={media} />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-3 pb-3 pt-10 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <span className="text-text block truncate text-xs font-semibold">
            {media.originalName}
          </span>
          <span className="text-text/70 mt-0.5 block text-[11px]">
            {formatDate(media.createdAt)}
          </span>
        </span>
        {kind === 'VIDEO' && (
          <span className="pointer-events-none absolute left-3 top-3 grid h-8 w-8 place-items-center rounded-full border border-white/30 bg-black/45 text-white backdrop-blur-sm">
            <Play aria-hidden="true" className="ml-0.5 h-4 w-4 fill-current" />
          </span>
        )}
      </button>
      {kind === 'AUDIO' && (
        <button
          aria-label={`Воспроизвести ${media.originalName}`}
          className="absolute bottom-2 left-2 grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-cyber-cyan/60 bg-surface/85 text-cyber-cyan backdrop-blur-sm transition hover:scale-105 hover:border-cyber-cyan focus-visible:outline-2 focus-visible:outline-cyber-cyan"
          onClick={() => onPlayAudio(media)}
          type="button"
        >
          <Play aria-hidden="true" className="ml-0.5 h-4 w-4 fill-current" />
        </button>
      )}
      <button
        aria-label={`Удалить ${media.originalName}`}
        className="absolute right-2 top-2 grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-white/20 bg-black/45 text-white/75 opacity-0 backdrop-blur-sm transition hover:border-neon-pink hover:text-neon-pink focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-cyber-cyan group-hover:opacity-100"
        onClick={() => onDelete(media)}
        type="button"
      >
        <Trash2 aria-hidden="true" className="h-4 w-4" />
      </button>
    </article>
  );
};

type MediaGalleryProps = {
  hasMore: boolean;
  isLoading: boolean;
  isFetching: boolean;
  media: Media[];
  onDelete: (media: Media) => void;
  onLoadMore: () => void;
  onOpen: (media: Media) => void;
  onPlayAudio: (media: Media) => void;
};

const MediaGalleryLoader = () => (
  <div
    aria-label="Загрузка следующих медиафайлов"
    className="grid grid-cols-2 gap-2 py-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
  >
    {Array.from({ length: 6 }, (_, index) => (
      <div className="bg-elevated/80 aspect-square animate-pulse rounded-2xl" key={index} />
    ))}
  </div>
);

const mediaGalleryEndMessage = (
  <p className="text-muted-text px-2 py-6 text-center text-xs">Все медиафайлы загружены</p>
);

const MediaGallery = ({
  hasMore,
  isLoading,
  isFetching,
  media,
  onDelete,
  onLoadMore,
  onOpen,
  onPlayAudio,
}: MediaGalleryProps) => {
  let content;
  if (isLoading) {
    content = (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 12 }, (_, index) => (
          <div
            aria-label="Загрузка"
            className="bg-elevated/80 aspect-square animate-pulse rounded-2xl"
            key={index}
          />
        ))}
      </div>
    );
  } else if (media.length > 0) {
    content = (
      <div
        className="h-full min-h-0 overflow-y-auto overscroll-contain pr-1"
        id="media-gallery-scroll"
      >
        <InfiniteScroll
          dataLength={media.length}
          endMessage={mediaGalleryEndMessage}
          hasMore={hasMore}
          loader={<MediaGalleryLoader />}
          next={onLoadMore}
          scrollThreshold="240px"
          scrollableTarget="media-gallery-scroll"
        >
          <div
            aria-label="Фотографии и медиафайлы альбома"
            className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
          >
            {media.map((item) => (
              <MediaGalleryCard
                key={item.id}
                media={item}
                onDelete={onDelete}
                onOpen={onOpen}
                onPlayAudio={onPlayAudio}
              />
            ))}
          </div>
        </InfiniteScroll>
        {isFetching && !isLoading && (
          <span className="text-muted-text block py-2 text-center text-xs" role="status">
            Загрузка…
          </span>
        )}
      </div>
    );
  } else {
    content = (
      <div className="text-muted-text grid min-h-52 place-items-center px-6 text-center text-sm">
        В альбоме пока нет медиафайлов
      </div>
    );
  }

  return <AnimatedPanel className="h-full min-h-0 p-3 sm:p-4">{content}</AnimatedPanel>;
};

export const MediaPage = () => {
  const [page, setPage] = useState(1);
  const [mediaPages, setMediaPages] = useState<Record<number, Media[]>>({});
  const [hasMore, setHasMore] = useState(true);
  const [name, setName] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selected, setSelected] = useState<Media | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Media | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
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
  const { currentData, error, isFetching, isLoading, refetch } = useListMediaQuery(query);
  const filterKey = `${name}\u0000${dateFrom}\u0000${dateTo}`;

  useEffect(() => {
    setPage(1);
    setMediaPages({});
    setHasMore(true);
  }, [filterKey]);

  useEffect(() => {
    if (!currentData) return;
    const currentPage = currentData.page ?? page;
    setMediaPages((previous) => ({ ...previous, [currentPage]: currentData.data }));
    setHasMore(currentPage < (currentData.totalPages ?? currentPage));
  }, [currentData, page]);

  const resetMediaList = () => {
    setPage(1);
    setMediaPages({});
    setHasMore(true);
  };

  const applyFilters = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetMediaList();
  };

  const clearFilters = () => {
    setName('');
    setDateFrom('');
    setDateTo('');
    resetMediaList();
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    setUploadError(null);
    try {
      const uploadedMedia = await upload(file).unwrap();
      setMediaPages((previous) => ({
        ...previous,
        1: [uploadedMedia, ...(previous[1] ?? []).filter((media) => media.id !== uploadedMedia.id)],
      }));
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
      setMediaPages((previous) =>
        Object.fromEntries(
          Object.entries(previous).map(([currentPage, items]) => [
            currentPage,
            items.filter((media) => media.id !== pendingDelete.id),
          ]),
        ),
      );
      setPendingDelete(null);
    } catch (deleteError) {
      setListError(getApiErrorMessage(deleteError, 'Не удалось удалить файл'));
    }
  };

  const media = useMemo(() => {
    const mediaIds = new Set<string>();

    return Object.keys(mediaPages)
      .sort((left, right) => Number(left) - Number(right))
      .flatMap((key) => mediaPages[Number(key)] ?? [])
      .filter((item) => {
        if (mediaIds.has(item.id)) return false;
        mediaIds.add(item.id);
        return true;
      });
  }, [mediaPages]);
  const previewMedia = selectedId ? (detailData ?? selected) : null;

  return (
    <PageLayout contentClassName="overflow-hidden [&>div]:h-full [&>div]:min-h-0">
      <AnimatedPanel className="page-header !h-auto shrink-0">
        <div className="text-primary-neon mb-2 flex items-center gap-gap text-xs font-semibold uppercase tracking-[0.2em]">
          <ImagePlus aria-hidden="true" className="h-4 w-4" />
          Мой альбом
        </div>
        <h1 className="text-text text-2xl font-semibold sm:text-3xl">Фото и видео</h1>
        <p className="text-muted-text mt-1 text-sm">
          Изображения, видео и аудио с приватным доступом.
        </p>
      </AnimatedPanel>

      <AnimatedPanel className="!h-auto shrink-0 p-5">
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

      <AnimatedPanel className="!h-auto shrink-0 p-5">
        <div className="flex w-full flex-wrap items-center justify-between gap-gap">
          <div className="min-w-0">
            <h2 className="text-text text-lg font-semibold">Добавить медиа</h2>
            <p className="text-muted-text mt-1 text-sm">
              Изображение до 10 МБ, аудио до 100 МБ или видео до 500 МБ.
            </p>
          </div>
          <div className="inline-flex shrink-0">
            <input
              accept="image/*,video/*,audio/*"
              className="sr-only"
              disabled={uploadState.isLoading}
              onChange={handleUpload}
              ref={uploadInputRef}
              type="file"
            />
            <Button
              icon={<Upload aria-hidden="true" className="h-4 w-4" />}
              isLoading={uploadState.isLoading}
              onClick={() => uploadInputRef.current?.click()}
            >
              {uploadState.isLoading ? 'Загрузка…' : 'Выбрать файл'}
            </Button>
          </div>
        </div>
        {uploadError && (
          <p className="text-neon-pink basis-full text-sm" role="alert">
            {uploadError}
          </p>
        )}
      </AnimatedPanel>

      {listError && (
        <p className="text-neon-pink shrink-0 text-sm" role="alert">
          {listError}
        </p>
      )}
      <div className="flex min-h-0 flex-1">
        <AsyncState
          error={error}
          errorMessage="Не удалось загрузить альбом"
          hasData={media.length > 0 || isFetching}
          onRetry={refetch}
        >
          <MediaGallery
            hasMore={hasMore}
            isLoading={isLoading}
            isFetching={isFetching}
            media={media}
            onDelete={setPendingDelete}
            onLoadMore={() => {
              if (!isFetching && hasMore) setPage((previous) => previous + 1);
            }}
            onOpen={openMedia}
            onPlayAudio={playAudio}
          />
        </AsyncState>
      </div>

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
