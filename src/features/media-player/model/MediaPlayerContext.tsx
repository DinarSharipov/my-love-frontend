import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { PropsWithChildren } from 'react';

export type MediaTrack = {
  artist: string;
  id: string;
  sourceType: 'file' | 'url';
  src: string;
  title: string;
};

export type EqualizerValues = {
  high: number;
  low: number;
  mid: number;
};

type PlayerPosition = { x: number; y: number };

type MediaPlayerContextValue = {
  addTrack: (track: MediaTrack) => void;
  currentTime: number;
  currentTrack: MediaTrack | null;
  duration: number;
  equalizer: EqualizerValues;
  isExpanded: boolean;
  isPlaying: boolean;
  next: () => void;
  pause: () => void;
  play: (trackId?: string) => void;
  position: PlayerPosition;
  removeTrack: (trackId: string) => void;
  repeat: boolean;
  registerAudioElement: (audio: HTMLAudioElement | null) => void;
  seek: (time: number) => void;
  setEqualizer: (band: keyof EqualizerValues, value: number) => void;
  setExpanded: (expanded: boolean) => void;
  setPosition: (position: PlayerPosition) => void;
  setRepeat: (repeat: boolean) => void;
  setVisible: (visible: boolean) => void;
  tracks: MediaTrack[];
  visible: boolean;
  volume: number;
  setVolume: (volume: number) => void;
  previous: () => void;
};

const MediaPlayerContext = createContext<MediaPlayerContextValue | null>(null);

const PLAYER_STATE_KEY = 'my-love:media-player-state';
const PLAYER_TRACKS_KEY = 'my-love:media-player-tracks';
const DEFAULT_POSITION = { x: 24, y: 24 };
const DEFAULT_EQUALIZER = { high: 0, low: 0, mid: 0 };

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const getInitialTracks = () => readJson<MediaTrack[]>(PLAYER_TRACKS_KEY, []);

export const MediaPlayerProvider = ({ children }: PropsWithChildren) => {
  const savedState = readJson<{
    equalizer?: EqualizerValues;
    position?: PlayerPosition;
    repeat?: boolean;
    visible?: boolean;
    volume?: number;
  }>(PLAYER_STATE_KEY, {});
  const [tracks, setTracks] = useState<MediaTrack[]>(getInitialTracks);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [visible, setVisibleState] = useState(savedState.visible ?? true);
  const [volume, setVolumeState] = useState(savedState.volume ?? 0.8);
  const [repeat, setRepeatState] = useState(savedState.repeat ?? false);
  const [position, setPositionState] = useState<PlayerPosition>(
    savedState.position ?? DEFAULT_POSITION,
  );
  const [equalizer, setEqualizerState] = useState<EqualizerValues>(
    savedState.equalizer ?? DEFAULT_EQUALIZER,
  );
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const filtersRef = useRef<Partial<Record<keyof EqualizerValues, BiquadFilterNode>>>({});
  const pendingPlayRef = useRef(false);
  const equalizerRef = useRef(equalizer);
  const repeatRef = useRef(repeat);
  const currentTrackIdRef = useRef(currentTrackId);
  const nextRef = useRef<() => void>(() => undefined);
  const tracksRef = useRef(tracks);
  const volumeRef = useRef(volume);
  const timeUpdateFrameRef = useRef<number | null>(null);
  const audioCleanupRef = useRef<(() => void) | null>(null);
  const ensureAudioGraphRef = useRef<() => void>(() => undefined);
  const currentTrack = tracks.find((track) => track.id === currentTrackId) ?? null;
  const currentTrackRef = useRef(currentTrack);

  equalizerRef.current = equalizer;
  repeatRef.current = repeat;
  currentTrackIdRef.current = currentTrackId;
  tracksRef.current = tracks;
  volumeRef.current = volume;
  currentTrackRef.current = currentTrack;

  const updateAudioGraph = useCallback((values: EqualizerValues) => {
    (Object.keys(values) as Array<keyof EqualizerValues>).forEach((band) => {
      const filter = filtersRef.current[band];
      if (filter) filter.gain.value = values[band];
    });
  }, []);

  const registerAudioElement = useCallback((audio: HTMLAudioElement | null) => {
    audioCleanupRef.current?.();
    audioCleanupRef.current = null;
    audioRef.current = audio;
    if (!audio) return;

    const media = audio;
    media.volume = volumeRef.current;
    const onLoadedMetadata = () =>
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const onDurationChange = () =>
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const onTimeUpdate = () => {
      if (timeUpdateFrameRef.current !== null) return;
      timeUpdateFrameRef.current = window.requestAnimationFrame(() => {
        timeUpdateFrameRef.current = null;
        setCurrentTime(audio.currentTime);
      });
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      if (repeatRef.current && currentTrackIdRef.current) {
        media.currentTime = 0;
        audio.play().catch(() => setIsPlaying(false));
      } else {
        nextRef.current();
      }
    };
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audioCleanupRef.current = () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };

    if (pendingPlayRef.current && currentTrackRef.current) {
      pendingPlayRef.current = false;
      ensureAudioGraphRef.current();
      audio.play().catch(() => setIsPlaying(false));
    }
  }, []);

  const ensureAudioGraph = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || typeof window.AudioContext === 'undefined') return;

    if (!audioContextRef.current) {
      const context = new AudioContext();
      const source = context.createMediaElementSource(audio);
      const low = context.createBiquadFilter();
      const mid = context.createBiquadFilter();
      const high = context.createBiquadFilter();
      low.type = 'lowshelf';
      low.frequency.value = 320;
      mid.type = 'peaking';
      mid.frequency.value = 1000;
      mid.Q.value = 0.8;
      high.type = 'highshelf';
      high.frequency.value = 3200;
      source.connect(low).connect(mid).connect(high).connect(context.destination);
      audioContextRef.current = context;
      sourceNodeRef.current = source;
      filtersRef.current = { high, low, mid };
      updateAudioGraph(equalizerRef.current);
    }

    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(() => undefined);
    }
  }, [updateAudioGraph]);
  ensureAudioGraphRef.current = ensureAudioGraph;

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    registerAudioElement(audio);

    return () => {
      registerAudioElement(null);
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    };
  }, [registerAudioElement]);

  const play = useCallback(
    (trackId?: string) => {
      const nextTrackId = trackId ?? currentTrackId ?? tracks[0]?.id;
      if (!nextTrackId) return;
      pendingPlayRef.current = true;
      if (nextTrackId !== currentTrackId) {
        setCurrentTrackId(nextTrackId);
        return;
      }
      ensureAudioGraph();
      const promise = audioRef.current?.play();
      if (promise) promise.catch(() => setIsPlaying(false));
    },
    [currentTrackId, ensureAudioGraph, tracks],
  );

  const pause = useCallback(() => {
    pendingPlayRef.current = false;
    audioRef.current?.pause();
  }, []);

  const move = useCallback(
    (step: number) => {
      if (!tracks.length) return;
      const currentIndex = Math.max(
        0,
        tracks.findIndex((track) => track.id === currentTrackId),
      );
      const nextIndex = currentIndex + step;
      if (nextIndex < 0 || nextIndex >= tracks.length) {
        if (repeat) play(tracks[(nextIndex + tracks.length) % tracks.length].id);
        return;
      }
      play(tracks[nextIndex].id);
    },
    [currentTrackId, play, repeat, tracks],
  );

  const next = useCallback(() => move(1), [move]);
  const previous = useCallback(() => move(-1), [move]);
  nextRef.current = next;

  const seek = useCallback(
    (time: number) => {
      const nextTime = duration > 0 ? clamp(time, 0, duration) : Math.max(0, time);
      if (audioRef.current) audioRef.current.currentTime = nextTime;
      setCurrentTime(nextTime);
    },
    [duration],
  );

  const addTrack = useCallback((track: MediaTrack) => {
    setTracks((current) =>
      current.some((item) => item.id === track.id) ? current : [...current, track],
    );
  }, []);

  const removeTrack = useCallback(
    (trackId: string) => {
      const track = tracks.find((item) => item.id === trackId);
      if (track?.sourceType === 'file') URL.revokeObjectURL(track.src);
      setTracks((current) => current.filter((item) => item.id !== trackId));
      if (currentTrackId === trackId) {
        pause();
        setCurrentTrackId(null);
        setCurrentTime(0);
        setDuration(0);
      }
    },
    [currentTrackId, pause, tracks],
  );

  const setPosition = useCallback((nextPosition: PlayerPosition) => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    setPositionState({
      x: clamp(nextPosition.x, 8, Math.max(8, width - 360)),
      y: clamp(nextPosition.y, 8, Math.max(8, height - 110)),
    });
  }, []);

  const setVolume = useCallback((nextVolume: number) => {
    const safeVolume = clamp(nextVolume, 0, 1);
    setVolumeState(safeVolume);
    if (audioRef.current) audioRef.current.volume = safeVolume;
  }, []);

  const setEqualizer = useCallback(
    (band: keyof EqualizerValues, value: number) => {
      setEqualizerState((current) => {
        const nextValues = { ...current, [band]: clamp(value, -12, 12) };
        updateAudioGraph(nextValues);
        return nextValues;
      });
    },
    [updateAudioGraph],
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentTrack) {
      audio.removeAttribute('src');
      audio.load();
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    audio.src = currentTrack.src;
    audio.load();
    setCurrentTime(0);
    setDuration(0);

    if (pendingPlayRef.current) {
      pendingPlayRef.current = false;
      ensureAudioGraph();
      audio.play().catch(() => setIsPlaying(false));
    }
  }, [currentTrack, ensureAudioGraph]);

  useEffect(
    () => () => {
      audioCleanupRef.current?.();
      if (timeUpdateFrameRef.current !== null) {
        window.cancelAnimationFrame(timeUpdateFrameRef.current);
      }
      audioRef.current?.pause();
      audioContextRef.current?.close();
      tracksRef.current.forEach((track) => {
        if (track.sourceType === 'file') URL.revokeObjectURL(track.src);
      });
    },
    [],
  );

  useEffect(() => {
    if (currentTrackId && !currentTrack) setCurrentTrackId(null);
  }, [currentTrack, currentTrackId]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        PLAYER_TRACKS_KEY,
        JSON.stringify(tracks.filter((track) => track.sourceType === 'url')),
      );
      window.localStorage.setItem(
        PLAYER_STATE_KEY,
        JSON.stringify({ equalizer, position, repeat, visible, volume }),
      );
    } catch {
      // Local persistence is optional and must not block playback.
    }
  }, [equalizer, position, repeat, tracks, visible, volume]);

  useEffect(() => {
    const { mediaSession } = navigator;
    if (!mediaSession || !currentTrack) return undefined;
    mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.artist,
    });
    mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    const handlers: Array<[MediaSessionAction, MediaSessionActionHandler]> = [
      ['play', () => play()],
      ['pause', () => pause()],
      ['nexttrack', next],
      ['previoustrack', previous],
      [
        'seekbackward',
        () => {
          if (audioRef.current)
            audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
        },
      ],
      [
        'seekforward',
        () => {
          if (audioRef.current) audioRef.current.currentTime += 10;
        },
      ],
    ];
    handlers.forEach((handlerEntry) => {
      const [action, handler] = handlerEntry;
      try {
        mediaSession.setActionHandler(action, handler);
      } catch {
        // Individual actions are not supported uniformly across browsers.
      }
    });
    return () => {
      handlers.forEach((handlerEntry) => {
        const [action] = handlerEntry;
        try {
          mediaSession.setActionHandler(action, null);
        } catch {
          // Ignore unsupported Media Session actions.
        }
      });
    };
  }, [currentTrack, isPlaying, next, pause, play, previous]);

  const value = useMemo<MediaPlayerContextValue>(
    () => ({
      addTrack,
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
      removeTrack,
      registerAudioElement,
      repeat,
      seek,
      setEqualizer,
      setExpanded: setIsExpanded,
      setPosition,
      setRepeat: setRepeatState,
      setVisible: setVisibleState,
      setVolume,
      tracks,
      visible,
      volume,
    }),
    [
      addTrack,
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
      removeTrack,
      registerAudioElement,
      repeat,
      seek,
      setEqualizer,
      setPosition,
      setVolume,
      tracks,
      visible,
      volume,
    ],
  );

  return <MediaPlayerContext.Provider value={value}>{children}</MediaPlayerContext.Provider>;
};

export const useMediaPlayer = () => {
  const context = useContext(MediaPlayerContext);
  if (!context) throw new Error('useMediaPlayer must be used inside MediaPlayerProvider');
  return context;
};
