import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

import backgroundMusic from '@/shared/assets/bg-music.mp3';

export const BackgroundMusic = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return undefined;
    }

    let isDisposed = false;
    audio.volume = 0.32;

    const startPlayback = (event?: PointerEvent) => {
      if (
        event?.target instanceof Element &&
        event.target.closest('[data-background-music-control]')
      ) {
        return;
      }

      audio
        .play()
        .then(() => {
          if (!isDisposed) {
            window.removeEventListener('pointerdown', startPlayback);
          }
        })
        .catch(() => undefined);
    };

    startPlayback();
    window.addEventListener('pointerdown', startPlayback, { once: true });

    return () => {
      isDisposed = true;
      window.removeEventListener('pointerdown', startPlayback);
      audio.pause();
    };
  }, []);

  const togglePlayback = async () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (!audio.paused) {
      audio.pause();
      return;
    }

    try {
      await audio.play();
    } catch {
      setIsPlaying(false);
    }
  };

  return (
    <>
      {/* Background music contains no speech, so a captions track is not applicable. */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        ref={audioRef}
        loop
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        preload="metadata"
        src={backgroundMusic}
      />

      <motion.button
        animate={{
          boxShadow: isPlaying
            ? '0 0 24px color-mix(in srgb, var(--color-primary-neon) 28%, transparent)'
            : '0 0 0 transparent',
        }}
        aria-label={isPlaying ? 'Выключить фоновую музыку' : 'Включить фоновую музыку'}
        aria-pressed={isPlaying}
        className="border-border bg-surface/85 text-text fixed bottom-5 right-5 z-50 flex h-12 items-center gap-2 rounded-full border px-4 backdrop-blur-md"
        data-background-music-control
        onClick={togglePlayback}
        transition={{ duration: 0.25 }}
        type="button"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.95 }}
      >
        <span aria-hidden="true" className="text-primary-neon text-lg">
          {isPlaying ? '❚❚' : '▶'}
        </span>
      </motion.button>
    </>
  );
};
