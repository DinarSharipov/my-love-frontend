import {
  ChevronDown,
  ChevronUp,
  EyeOff,
  GripHorizontal,
  ListMusic,
  Pause,
  Play,
  Repeat,
  SkipBack,
  SkipForward,
  SlidersHorizontal,
  Volume2,
  X,
} from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

import { useMediaPlayer } from '@/features/media-player/model/MediaPlayerContext';
import { Button } from '@/shared/ui/button';

const formatTime = (value: number) => {
  const seconds = Math.max(0, Math.floor(value));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
};

export const MediaPlayer = () => {
  const {
    currentTime,
    currentTrack,
    duration,
    equalizer,
    isExpanded,
    isPlaying,
    next,
    pause,
    play,
    position,
    previous,
    repeat,
    seek,
    setEqualizer,
    setExpanded,
    setPosition,
    setRepeat,
    setVisible,
    setVolume,
    visible,
    volume,
  } = useMediaPlayer();
  const [isDragging, setIsDragging] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [showEqualizer, setShowEqualizer] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const progressRef = useRef<HTMLDivElement>(null);

  const seekFromClientX = useCallback(
    (clientX: number) => {
      const element = progressRef.current;
      if (!element || duration <= 0) return;
      const bounds = element.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - bounds.left) / bounds.width));
      seek(ratio * duration);
    },
    [duration, seek],
  );

  if (!currentTrack) return null;

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    dragOffsetRef.current = { x: event.clientX - position.x, y: event.clientY - position.y };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPosition({
      x: event.clientX - dragOffsetRef.current.x,
      y: event.clientY - dragOffsetRef.current.y,
    });
  };

  const stopDragging = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsDragging(false);
  };

  const handleProgressPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsScrubbing(true);
    seekFromClientX(event.clientX);
  };

  const handleProgressPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (isScrubbing) seekFromClientX(event.clientX);
  };

  const stopScrubbing = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsScrubbing(false);
  };

  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <section
      aria-label="Медиаплеер"
      className={`${!visible ? 'hidden' : ''} media-player-shell fixed z-[100] w-[min(380px,calc(100vw-16px))] select-none rounded-3xl border border-primary-neon/50 bg-surface/95 text-text shadow-[0_0_40px_rgba(176,38,255,0.35)] backdrop-blur-2xl ${isDragging ? 'cursor-grabbing' : ''}`}
      style={{ left: position.x, top: position.y }}
    >
      <div
        className="flex cursor-grab items-center justify-between gap-2 border-b border-border/80 px-3 py-2"
        onPointerCancel={stopDragging}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
      >
        <GripHorizontal aria-hidden="true" className="text-muted-text h-4 w-4 shrink-0" />
        <p className="min-w-0 flex-1 truncate text-xs font-semibold">{currentTrack.title}</p>
        <button
          aria-label={isExpanded ? 'Свернуть плеер' : 'Развернуть плеер'}
          className="text-muted-text cursor-pointer rounded-lg p-1.5 transition hover:text-cyber-cyan"
          onClick={() => setExpanded(!isExpanded)}
          onPointerDown={(event) => event.stopPropagation()}
          type="button"
        >
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>
        <button
          aria-label="Скрыть плеер"
          className="text-muted-text cursor-pointer rounded-lg p-1.5 transition hover:text-cyber-cyan"
          onClick={() => setVisible(false)}
          onPointerDown={(event) => event.stopPropagation()}
          type="button"
        >
          <EyeOff className="h-4 w-4" />
        </button>
        <button
          aria-label="Закрыть плеер"
          className="text-muted-text cursor-pointer rounded-lg p-1.5 transition hover:text-neon-pink"
          onClick={() => {
            pause();
            setVisible(false);
          }}
          onPointerDown={(event) => event.stopPropagation()}
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {isExpanded && (
        <div className="px-3 pb-3 pt-2">
          <div className="mb-2 flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-primary-neon/45 bg-primary-neon/10 text-primary-neon">
              <ListMusic aria-hidden="true" className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{currentTrack.title}</p>
              <p className="text-muted-text truncate text-xs">{currentTrack.artist}</p>
            </div>
          </div>

          <div
            aria-label="Позиция трека"
            aria-valuemax={duration}
            aria-valuemin={0}
            aria-valuenow={currentTime}
            className="cursor-pointer touch-none py-2"
            onKeyDown={(event) => {
              if (event.key === 'ArrowLeft') seek(currentTime - 5);
              if (event.key === 'ArrowRight') seek(currentTime + 5);
            }}
            onPointerCancel={stopScrubbing}
            onPointerDown={handleProgressPointerDown}
            onPointerMove={handleProgressPointerMove}
            onPointerUp={stopScrubbing}
            ref={progressRef}
            role="slider"
            tabIndex={0}
          >
            <div className="h-2 rounded-full bg-muted-text/30">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-neon to-cyber-cyan"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="text-muted-text flex justify-between text-[10px]">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          <div className="mt-2 flex items-center justify-center gap-1">
            <Button
              aria-label="Предыдущий трек"
              className="!h-9 !w-9 !px-0"
              onClick={previous}
              size="s"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              aria-label={isPlaying ? 'Пауза' : 'Воспроизвести'}
              className="!h-10 !w-10 !px-0"
              onClick={() => (isPlaying ? pause() : play())}
              size="s"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button aria-label="Следующий трек" className="!h-9 !w-9 !px-0" onClick={next} size="s">
              <SkipForward className="h-4 w-4" />
            </Button>
            <Button
              aria-label="Повтор"
              className={`!h-9 !w-9 !px-0 ${repeat ? 'text-primary-neon' : ''}`}
              onClick={() => setRepeat(!repeat)}
              size="s"
            >
              <Repeat className="h-4 w-4" />
            </Button>
            <Button
              aria-label="Эквалайзер"
              className={`!h-9 !w-9 !px-0 ${showEqualizer ? 'text-primary-neon' : ''}`}
              onClick={() => setShowEqualizer(!showEqualizer)}
              size="s"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>

          <label
            className="text-muted-text mt-3 flex items-center gap-2 text-xs"
            htmlFor="media-player-volume"
          >
            <Volume2 className="h-4 w-4 shrink-0" />
            <input
              className="accent-cyber-cyan h-1 w-full cursor-pointer"
              id="media-player-volume"
              max="1"
              min="0"
              onChange={(event) => setVolume(Number(event.target.value))}
              step="0.01"
              type="range"
              value={volume}
            />
          </label>

          {showEqualizer && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {(['low', 'mid', 'high'] as const).map((band) => (
                <label
                  className="text-muted-text text-center text-[10px] uppercase"
                  htmlFor={`media-player-eq-${band}`}
                  key={band}
                >
                  <input
                    aria-label={`Эквалайзер ${band}`}
                    className="accent-cyber-cyan h-24 cursor-pointer [writing-mode:vertical-lr]"
                    id={`media-player-eq-${band}`}
                    max="12"
                    min="-12"
                    onChange={(event) => setEqualizer(band, Number(event.target.value))}
                    step="1"
                    type="range"
                    value={equalizer[band]}
                  />
                  <span className="mt-1 block">{band}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
