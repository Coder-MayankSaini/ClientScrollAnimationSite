import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { artist } from "../../data/artist";
import { songs } from "../../data/songs";
import { SongCard } from "./SongCard";

export function MusicCatalog() {
  const [activeSong, setActiveSong] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => () => {
    audioRef.current?.pause();
  }, []);

  const scrollToSong = (index: number) => {
    const active = trackRef.current?.querySelector<HTMLElement>(`[data-song-index="${index}"]`);
    active?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  const selectSong = (index: number, playPreview: boolean) => {
    const song = songs[index];
    setActiveSong(index);
    setAudioError(false);
    scrollToSong(index);

    const audio = audioRef.current;
    if (!audio || !song.audioPreview) return;

    const source = new URL(song.audioPreview, window.location.href).href;
    if (audio.src !== source) {
      audio.src = song.audioPreview;
      audio.currentTime = 0;
      audio.load();
    }

    if (playPreview) {
      void audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const moveActive = (direction: number) => {
    const nextSong = (activeSong + direction + songs.length) % songs.length;
    selectSong(nextSong, false);
  };

  const handleSongSelect = (index: number) => {
    if (index === activeSong && audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      return;
    }

    selectSong(index, true);
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
        <div className="catalog-player">
          <div className="catalog-player-copy">
            <span className="eyebrow">Preview</span>
            <strong className="catalog-player-title">{selectedSong.title}</strong>
            <span className="catalog-player-status" aria-live="polite">
              {audioError ? "This preview could not be loaded." : isPlaying ? "Now playing" : "Press play to listen"}
            </span>
          </div>
          <audio
            ref={audioRef}
            controls
            preload="metadata"
            src={selectedSong.audioPreview}
            aria-label={`Preview of ${selectedSong.title}`}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            onError={() => {
              setIsPlaying(false);
              setAudioError(true);
            }}
          />
        </div>
      </div>
    </section>
  );
}
