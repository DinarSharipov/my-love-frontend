import { ImagePlus, Upload } from 'lucide-react';
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
  HeaderPanel,
  PageLayout,
} from '@/shared/ui';
import { Gallery } from '@/widgets/media-gallery';

const PAGE_SIZE = 20;

export const MediaPage = () => {
  const [page, setPage] = useState(1);
  const [mediaPages, setMediaPages] = useState<Record<number, Media[]>>({});
  const [hasMore, setHasMore] = useState(true);
  const [selected, setSelected] = useState<Media | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Media | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const [upload, uploadState] = useMediaUploadDirectMutation();
  const [remove, removeState] = useRemoveMediaMutation();
  const { addTrack, play } = useMediaPlayer();
  const { data: detailData } = useFindMediaQuery({ id: selectedId ?? '' }, { skip: !selectedId });
  const { currentData, error, isFetching, isLoading, refetch } = useListMediaQuery({
    limit: PAGE_SIZE,
    page,
  });

  useEffect(() => {
    if (!currentData) return;
    const currentPage = currentData.page ?? page;
    setMediaPages((previous) => ({ ...previous, [currentPage]: currentData.data }));
    setHasMore(currentPage < (currentData.totalPages ?? currentPage));
  }, [currentData, page]);

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

  const closePreview = () => {
    setSelected(null);
    setSelectedId(null);
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
  let previewMedia: Media | null = null;
  if (selectedId) {
    previewMedia = detailData?.id === selectedId ? detailData : selected;
  }

  return (
    <PageLayout contentClassName="overflow-hidden [&>div]:h-full [&>div]:min-h-0">
      <HeaderPanel
        left={
          <>
            <div className="text-primary-neon mb-2 flex items-center gap-gap text-xs font-semibold uppercase tracking-[0.2em]">
              <ImagePlus aria-hidden="true" className="h-4 w-4" />
              Мой альбом
            </div>
            <h1 className="text-text text-2xl font-semibold sm:text-3xl">Фото и видео</h1>
            <p className="text-muted-text mt-1 text-sm">
              Изображения, видео и аудио с приватным доступом.
            </p>
          </>
        }
      />

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
          <Gallery
            hasMore={hasMore}
            isFetching={isFetching}
            isLoading={isLoading}
            media={media}
            onClosePreview={closePreview}
            onDelete={setPendingDelete}
            onLoadMore={() => {
              if (!isFetching && hasMore) setPage((previous) => previous + 1);
            }}
            onOpen={openMedia}
            onPlayAudio={playAudio}
            previewMedia={previewMedia}
            selectedMedia={selected}
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
    </PageLayout>
  );
};
