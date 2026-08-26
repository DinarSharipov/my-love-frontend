import { LayoutGroup, motion } from 'motion/react';
import { FileAudio, LoaderCircle, Play, Trash2, X } from 'lucide-react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useState } from 'react';

import type { Media } from '@/entities/media';
import { AnimatedPanel, Modal } from '@/shared/ui';

type GalleryProps = {
  hasMore: boolean;
  isFetching: boolean;
  isLoading: boolean;
  media: Media[];
  onClosePreview: () => void;
  onDelete: (media: Media) => void;
  onLoadMore: () => void;
  onOpen: (media: Media) => void;
  onPlayAudio: (media: Media) => void;
  previewMedia: Media | null;
  selectedMedia: Media | null;
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

const PreviewLoader = () => (
  <div className="text-primary-neon absolute inset-0 grid place-items-center" role="status">
    <span className="bg-surface/85 inline-flex items-center gap-2 rounded-full border border-primary-neon/50 px-4 py-2 text-sm shadow-[0_0_28px_rgba(176,38,255,0.28)] backdrop-blur-sm">
      <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
      Загрузка…
    </span>
  </div>
);

const MediaPreview = ({ media }: { media: Media }) => {
  const kind = mediaKind(media);
  const [isLoading, setIsLoading] = useState(true);
  const handleLoaded = () => setIsLoading(false);

  if (kind === 'VIDEO') {
    return (
      <div aria-busy={isLoading} className="relative grid min-h-32 min-w-32 place-items-center">
        {isLoading && <PreviewLoader />}
        <video
          className={`max-h-[85vh] max-w-[90vw] rounded-2xl object-contain transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          controls
          onCanPlay={handleLoaded}
          onError={handleLoaded}
          src={media.downloadUrl}
        >
          <track kind="captions" label="Русские субтитры" srcLang="ru" src="data:text/vtt,WEBVTT" />
        </video>
      </div>
    );
  }
  if (kind === 'AUDIO') {
    return (
      <div
        aria-busy={isLoading}
        className="relative grid min-h-24 min-w-[min(420px,90vw)] place-items-center"
      >
        {isLoading && <PreviewLoader />}
        <audio
          className={`w-[min(720px,90vw)] rounded-xl transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          controls
          onCanPlay={handleLoaded}
          onError={handleLoaded}
          src={media.downloadUrl}
        >
          <track kind="captions" label="Русские субтитры" srcLang="ru" src="data:text/vtt,WEBVTT" />
        </audio>
      </div>
    );
  }
  return (
    <div aria-busy={isLoading} className="relative grid min-h-32 min-w-32 place-items-center">
      {isLoading && <PreviewLoader />}
      <img
        alt={media.originalName}
        className={`max-h-[85vh] max-w-[90vw] rounded-2xl object-contain shadow-[0_0_60px_rgba(176,38,255,0.32)] transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onError={handleLoaded}
        onLoad={handleLoaded}
        src={media.downloadUrl}
      />
    </div>
  );
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

const MediaGalleryCard = ({
  media,
  onDelete,
  onOpen,
  onPlayAudio,
}: {
  media: Media;
  onDelete: (item: Media) => void;
  onOpen: (item: Media) => void;
  onPlayAudio: (item: Media) => void;
}) => {
  const kind = mediaKind(media);
  const layoutId = `media-gallery-${media.id}`;

  return (
    <motion.article
      className="group relative overflow-hidden rounded-2xl border border-border bg-elevated/70 shadow-[0_0_24px_rgba(176,38,255,0.08)] transition-[border-color,box-shadow] duration-300 hover:border-primary-neon/70 hover:shadow-[0_0_28px_rgba(176,38,255,0.24)]"
      layoutId={layoutId}
      transition={{ type: 'spring', bounce: 0.18, duration: 0.45 }}
    >
      <motion.button
        aria-label={`Открыть ${media.originalName}`}
        className="relative block aspect-square w-full cursor-pointer overflow-hidden text-left focus-visible:outline-2 focus-visible:outline-cyber-cyan"
        onClick={() => onOpen(media)}
        transition={{ type: 'spring', bounce: 0.18, duration: 0.45 }}
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
      </motion.button>
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
    </motion.article>
  );
};

const GalleryLoader = () => (
  <div
    aria-label="Загрузка следующих медиафайлов"
    className="grid grid-cols-2 gap-2 py-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
  >
    {Array.from({ length: 6 }, (_, index) => (
      <div className="bg-elevated/80 aspect-square animate-pulse rounded-2xl" key={index} />
    ))}
  </div>
);

const galleryEndMessage = (
  <p className="text-muted-text px-2 py-6 text-center text-xs">Все медиафайлы загружены</p>
);

export const Gallery = ({
  hasMore,
  isFetching,
  isLoading,
  media,
  onClosePreview,
  onDelete,
  onLoadMore,
  onOpen,
  onPlayAudio,
  previewMedia,
  selectedMedia,
}: GalleryProps) => {
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
          endMessage={galleryEndMessage}
          hasMore={hasMore}
          loader={<GalleryLoader />}
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

  return (
    <LayoutGroup id="media-gallery-layout">
      <>
        <AnimatedPanel className="h-full min-h-0 p-3 sm:p-4">{content}</AnimatedPanel>
        <Modal
          ariaLabel="Просмотр медиафайла"
          layoutId={selectedMedia ? `media-gallery-${selectedMedia.id}` : undefined}
          onClose={onClosePreview}
          open={Boolean(previewMedia && selectedMedia)}
          variant="shared-layout"
        >
          {previewMedia && selectedMedia && (
            <div className="relative">
              <MediaPreview key={previewMedia.id} media={previewMedia} />
              <button
                aria-label="Закрыть просмотр"
                className="text-text/80 hover:text-text absolute right-2 top-2 grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-white/20 bg-black/55 backdrop-blur-sm transition hover:border-primary-neon hover:bg-black/75 focus-visible:outline-2 focus-visible:outline-cyber-cyan"
                onClick={onClosePreview}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </Modal>
      </>
    </LayoutGroup>
  );
};
