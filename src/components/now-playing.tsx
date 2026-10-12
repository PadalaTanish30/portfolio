"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Minus,
  Music2,
  Pause,
  Play,
  Video,
  Volume2,
  VolumeX,
} from "lucide-react";
import { nowPlaying } from "@/data/now-playing";
import {
  publishPlayerControls,
  setPlayer,
  unlock,
  usePlayer,
} from "@/lib/app-state";

/* -------------------------------------------------------------------------- */
/*  Minimal typings for the YouTube IFrame Player API                          */
/*                                                                            */
/*  We deliberately avoid the `@types/youtube` package: it is large, global    */
/*  and mostly irrelevant. These few interfaces cover exactly what we call.     */
/* -------------------------------------------------------------------------- */

interface YouTubePlayer {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  setVolume(volume: number): void;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  getIframe(): HTMLIFrameElement;
  destroy(): void;
}

interface YouTubePlayerOptions {
  videoId: string;
  playerVars?: Record<string, number | string>;
  events?: {
    onReady?: (event: { target: YouTubePlayer }) => void;
    onStateChange?: (event: { data: number; target: YouTubePlayer }) => void;
  };
}

interface YouTubeNamespace {
  Player: new (
    element: HTMLElement,
    options: YouTubePlayerOptions,
  ) => YouTubePlayer;
  PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
}

declare global {
  interface Window {
    YT?: YouTubeNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

/**
 * Load the IFrame API exactly once. Later callers resolve on the same promise,
 * so navigating between pages never re-requests the script.
 */
let apiPromise: Promise<YouTubeNamespace> | null = null;

function loadYouTubeApi(): Promise<YouTubeNamespace> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("YouTube API is browser-only"));
  }
  if (window.YT?.Player) return Promise.resolve(window.YT);

  if (!apiPromise) {
    apiPromise = new Promise<YouTubeNamespace>((resolve) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        resolve(window.YT as YouTubeNamespace);
      };
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    });
  }

  return apiPromise;
}

/** `YT.PlayerState.PLAYING` — a stable constant on YouTube's side. */
const PLAYING_STATE = 1;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const rest = String(total % 60).padStart(2, "0");
  return `${minutes}:${rest}`;
}

/**
 * A corner "record player": a small card that streams the site's theme song
 * from YouTube. Nothing is requested until someone presses play, so a visitor
 * who ignores it pays no bandwidth. Minimising pauses the video rather than
 * hiding a playing one — that keeps us inside YouTube's terms.
 */
export function NowPlaying() {
  const [collapsed, setCollapsed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // Shared with the command palette, so `⌘K → play` works even before the
  // visitor has ever touched this card.
  const { started, playing, muted } = usePlayer();

  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const startingRef = useRef(false);
  const tickRef = useRef<number | null>(null);

  const stopTicking = useCallback(() => {
    if (tickRef.current !== null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const startPlayer = useCallback(async () => {
    if (startingRef.current || playerRef.current) return;
    startingRef.current = true;
    setPlayer({ started: true });
    unlock("player");

    try {
      const YT = await loadYouTubeApi();
      const host = hostRef.current;
      if (!host || playerRef.current) return;

      // YouTube *replaces* the element it is handed, so we give it a child and
      // keep React ownership of the container itself.
      const mount = document.createElement("div");
      mount.style.width = "100%";
      mount.style.height = "100%";
      host.appendChild(mount);

      playerRef.current = new YT.Player(mount, {
        videoId: nowPlaying.youtubeId,
        playerVars: {
          autoplay: 1,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            const iframe = event.target.getIframe();
            iframe.style.position = "absolute";
            iframe.style.inset = "0";
            iframe.style.width = "100%";
            iframe.style.height = "100%";
            event.target.setVolume(45);
            event.target.playVideo();
          },
          onStateChange: (event) => {
            const isPlaying = event.data === YT.PlayerState.PLAYING;
            const isEnded = event.data === YT.PlayerState.ENDED;
            setPlayer({ playing: isPlaying, muted: event.target.isMuted() });
            if (isEnded) setProgress(0);

            stopTicking();
            if (isPlaying) {
              tickRef.current = window.setInterval(() => {
                const player = playerRef.current;
                if (!player) return;
                const total = player.getDuration();
                if (total > 0) {
                  setDuration(total);
                  setProgress(player.getCurrentTime() / total);
                }
              }, 500);
            }
          },
        },
      });
    } finally {
      startingRef.current = false;
    }
  }, [stopTicking]);

  const togglePlay = useCallback(() => {
    const player = playerRef.current;
    if (!player) {
      void startPlayer();
      return;
    }
    if (player.getPlayerState() === PLAYING_STATE) player.pauseVideo();
    else player.playVideo();
  }, [startPlayer]);

  const toggleMute = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    if (player.isMuted()) {
      player.unMute();
      setPlayer({ muted: false });
    } else {
      player.mute();
      setPlayer({ muted: true });
    }
  }, []);

  // Hand the palette the two imperative controls. The callbacks above are
  // stable, so this runs once and never churns the store.
  useEffect(() => {
    publishPlayerControls({ toggle: togglePlay, toggleMute });
  }, [togglePlay, toggleMute]);

  const seek = useCallback((value: number) => {
    const player = playerRef.current;
    if (!player) return;
    const total = player.getDuration();
    if (total > 0) {
      player.seekTo(total * value, true);
      setProgress(value);
    }
  }, []);

  const minimise = useCallback(() => {
    playerRef.current?.pauseVideo();
    setCollapsed(true);
  }, []);

  const expand = useCallback(() => {
    setCollapsed(false);
  }, []);

  // Tidy up the player and the progress timer on unmount.
  useEffect(() => {
    return () => {
      stopTicking();
      try {
        playerRef.current?.destroy();
      } catch {
        /* the iframe may already be gone */
      }
      playerRef.current = null;
    };
  }, [stopTicking]);

  const poster = `https://i.ytimg.com/vi/${nowPlaying.youtubeId}/hqdefault.jpg`;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 print:hidden">
      {collapsed ? (
        <button
          type="button"
          onClick={expand}
          className="group flex items-center gap-2 rounded-full border border-border bg-surface py-2 pl-2.5 pr-3.5 text-sm font-medium shadow-[var(--shadow-lift)] transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground">
            <Music2 className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <span className="max-w-[9rem] truncate">{nowPlaying.title}</span>
        </button>
      ) : null}

      <section
        aria-label="Corner music player"
        hidden={collapsed}
        className="w-[19rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-md border border-border bg-surface shadow-[var(--shadow-lift)]"
      >
        <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-muted uppercase">
            <Equalizer playing={playing} />
            Now playing
          </p>
          <button
            type="button"
            onClick={minimise}
            aria-label="Minimise the music player"
            className="grid h-6 w-6 place-items-center rounded-sm text-muted transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>

        <div className="relative aspect-video w-full overflow-hidden bg-black">
          <div ref={hostRef} className="absolute inset-0" />
          {!started ? (
            <button
              type="button"
              onClick={() => void startPlayer()}
              className="group absolute inset-0 grid place-items-center"
              aria-label={`Play ${nowPlaying.title} by ${nowPlaying.artist}`}
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-cover bg-center opacity-70 transition-opacity group-hover:opacity-85"
                style={{ backgroundImage: `url(${poster})` }}
              />
              <span className="relative grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_4px_16px_rgb(0_0_0/0.4)] transition-transform group-hover:scale-105">
                <Play className="h-5 w-5 translate-x-0.5 fill-current" />
              </span>
            </button>
          ) : null}
        </div>

        <div className="space-y-2 p-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{nowPlaying.title}</p>
            <p className="truncate text-xs text-muted">
              {nowPlaying.artist}
              {nowPlaying.album ? ` · ${nowPlaying.album}` : ""}
            </p>
          </div>

          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={progress}
            onChange={(event) => seek(Number(event.target.value))}
            disabled={!started}
            aria-label="Seek"
            className="h-1.5 w-full cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-50"
          />

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? "Pause" : "Play"}
              className="grid h-8 w-8 place-items-center rounded-sm bg-primary text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {playing ? (
                <Pause className="h-4 w-4 fill-current" aria-hidden="true" />
              ) : (
                <Play
                  className="h-4 w-4 translate-x-px fill-current"
                  aria-hidden="true"
                />
              )}
            </button>

            <button
              type="button"
              onClick={toggleMute}
              disabled={!started}
              aria-label={muted ? "Unmute" : "Mute"}
              className="grid h-8 w-8 place-items-center rounded-sm border border-border text-muted transition-colors hover:border-primary hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-40"
            >
              {muted ? (
                <VolumeX className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Volume2 className="h-4 w-4" aria-hidden="true" />
              )}
            </button>

            <span className="ml-1 text-[11px] tabular-nums text-muted">
              {formatTime(progress * duration)}
              {duration > 0 ? ` / ${formatTime(duration)}` : ""}
            </span>

            {nowPlaying.href ? (
              <a
                href={nowPlaying.href}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium text-muted transition-colors hover:text-foreground"
              >
                <Video className="h-3.5 w-3.5" aria-hidden="true" />
                YouTube
              </a>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

/** Four ink bars; they idle at rest and dance only while audio is playing. */
function Equalizer({ playing }: { playing: boolean }) {
  return (
    <span aria-hidden="true" className="flex h-3 items-end gap-0.5">
      {[0, 1, 2, 3].map((index) => (
        <span
          key={index}
          className="equalize-bar h-3 w-0.5 rounded-full bg-primary"
          style={{
            animationDelay: `${index * 0.16}s`,
            animationPlayState: playing ? "running" : "paused",
          }}
        />
      ))}
    </span>
  );
}
