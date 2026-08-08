import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ExternalLink, Pause, Play, SkipBack, SkipForward, X } from "lucide-react";
import { artist } from "../../data/artist";
import { songs } from "../../data/songs";
import { SongCard } from "./SongCard";

const PREVIEW_DURATION = 30;

const formatTime = (seconds: number) => {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = String(Math.floor(safeSeconds % 60)).padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
};

export function MusicCatalog() {
  const [activeSong, setActiveSong] = useState(0);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => () => {
    const audio = audioRef.current;
    audio?.pause();
    audio?.removeAttribute("src");
    audio?.load();
  }, []);

  const scrollToSong = (index: number) => {
    const active = trackRef.current?.querySelector<HTMLElement>(`[data-song-index="${index}"]`);
    active?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  const resetAudio = () => {
    const audio = audioRef.current;
    audio?.pause();
    audio?.removeAttribute("src");
    audio?.load();
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  const selectSong = (index: number, playPreview: boolean) => {
    const song = songs[index];
    setActiveSong(index);
    setPlayerOpen(true);
    setAudioError(false);
    setCurrentTime(0);
    setDuration(0);
    scrollToSong(index);

    const audio = audioRef.current;
    if (!audio || !song.audioPreview) return;

    audio.pause();

    if (!playPreview) {
      audio.removeAttribute("src");
      audio.load();
      setIsPlaying(false);
      return;
    }

    const sourceUrl = new URL(song.audioPreview, window.location.href);
    sourceUrl.hash = `t=0,${PREVIEW_DURATION}`;
    const source = sourceUrl.href;
    if (audio.src !== source) {
      audio.src = `${song.audioPreview}#t=0,${PREVIEW_DURATION}`;
      audio.currentTime = 0;
      audio.load();
    }

    if (audio.currentTime >= PREVIEW_DURATION) audio.currentTime = 0;
    void audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  };

  const moveActive = (direction: number) => {
    const nextSong = (activeSong + direction + songs.length) % songs.length;
    selectSong(nextSong, false);
  };

  const handleSongSelect = (index: number) => {
    if (index === activeSong && audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    selectSong(index, true);
  };

  const seekPreview = (event: ChangeEvent<HTMLInputElement>) => {
    const nextTime = Math.min(Number(event.currentTarget.value), PREVIEW_DURATION);
    if (audioRef.current) audioRef.current.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const closePlayer = () => {
    resetAudio();
    setAudioError(false);
    setPlayerOpen(false);
  };

  const selectedSong = songs[activeSong];

  return (
    <section className="music-section section-band" id="music" data-section="music" aria-labelledby="music-title">
      <div className="section-inner">
        <div className="section-heading section-heading--split">
          <div>
            <span className="eyebrow">Selected releases</span>
            <h2 id="music-title">The sound in motion.</h2>
          </div>
          <div className="section-heading-side">
            <p>From contemporary Haryanvi energy to intimate compositions, explore the catalogue and choose where to listen.</p>
            <a className="button button--outline" href={artist.social.spotify} target="_blank" rel="noopener noreferrer">Open artist profile <ExternalLink size={15} /></a>
          </div>
        </div>

        <div className="catalog-controls">
          <span>{String(activeSong + 1).padStart(2, "0")} / {String(songs.length).padStart(2, "0")}</span>
          <div>
            <button type="button" className="icon-button" onClick={() => moveActive(-1)} aria-label="Previous song"><ArrowLeft size={17} /></button>
            <button type="button" className="icon-button" onClick={() => moveActive(1)} aria-label="Next song"><ArrowRight size={17} /></button>
          </div>
        </div>

        <div
          className="song-track"
          ref={trackRef}
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") moveActive(-1);
            if (event.key === "ArrowRight") moveActive(1);
          }}
          aria-label="Song catalogue"
        >
          {songs.map((song, index) => (
            <div data-song-index={index} key={song.id}>
              <SongCard
                song={song}
                index={index}
                active={index === activeSong}
                playing={index === activeSong && isPlaying}
                onSelect={() => handleSongSelect(index)}
              />
            </div>
          ))}
        </div>
        <audio
          ref={audioRef}
          className="music-player-audio"
          preload="none"
          tabIndex={-1}
          aria-hidden="true"
          onLoadedMetadata={(event) => setDuration(Math.min(event.currentTarget.duration, PREVIEW_DURATION))}
          onTimeUpdate={(event) => {
            const nextTime = Math.min(event.currentTarget.currentTime, PREVIEW_DURATION);
            setCurrentTime(nextTime);
            if (nextTime >= PREVIEW_DURATION) {
              event.currentTarget.pause();
              event.currentTarget.currentTime = PREVIEW_DURATION;
              setIsPlaying(false);
            }
          }}
          onPlay={(event) => {
            if (event.currentTarget.currentTime >= PREVIEW_DURATION) event.currentTarget.currentTime = 0;
            setAudioError(false);
            setIsPlaying(true);
          }}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onError={() => {
            if (!audioRef.current?.src) return;
            setIsPlaying(false);
            setAudioError(true);
          }}
        />
        {playerOpen && (
          <aside className="music-player" aria-label="Music preview player">
            <div className="music-player-inner">
              <img className="music-player-art" src={selectedSong.cover} alt="" />
              <div className="music-player-track">
                <div className="music-player-meta">
                  <span className="eyebrow">Preview</span>
                  <strong className="music-player-title">{selectedSong.title}</strong>
                  <span className="music-player-status" aria-live="polite">
                    {audioError ? "Unavailable" : isPlaying ? "Now playing" : "Ready to play"}
                  </span>
                </div>
                <div className="music-player-progress">
                  <span>{formatTime(currentTime)}</span>
                  <input
                    type="range"
                    min="0"
                    max={duration || PREVIEW_DURATION}
                    step="0.1"
                    value={Math.min(currentTime, duration || PREVIEW_DURATION)}
                    disabled={!duration}
                    onChange={seekPreview}
                    aria-label={`Seek ${selectedSong.title} preview`}
                  />
                  <span>{formatTime(duration || PREVIEW_DURATION)}</span>
                </div>
              </div>
              <div className="music-player-actions">
                <button type="button" className="music-player-skip" onClick={() => moveActive(-1)} aria-label="Previous preview"><SkipBack size={15} /></button>
                <button type="button" className="music-player-toggle" onClick={() => handleSongSelect(activeSong)} aria-label={isPlaying ? "Pause preview" : "Play preview"}>
                  {isPlaying ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}
                </button>
                <button type="button" className="music-player-skip" onClick={() => moveActive(1)} aria-label="Next preview"><SkipForward size={15} /></button>
                <button type="button" className="music-player-close" onClick={closePlayer} aria-label="Close music player"><X size={16} /></button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </section>
  );
}
