import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { artist } from "../../data/artist";
import { songs } from "../../data/songs";
import { SongCard } from "./SongCard";

export function MusicCatalog() {
  const [activeSong, setActiveSong] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => () => {
    audioRef.current?.pause();
    audioRef.current = null;
  }, []);

  const scrollToSong = (index: number) => {
    const active = trackRef.current?.querySelector<HTMLElement>(`[data-song-index="${index}"]`);
    active?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  const moveActive = (direction: number) => {
    const nextSong = (activeSong + direction + songs.length) % songs.length;
    setActiveSong(nextSong);
    scrollToSong(nextSong);
  };

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
              <SongCard song={song} index={index} active={index === activeSong} onSelect={() => { setActiveSong(index); scrollToSong(index); }} />
            </div>
          ))}
        </div>
        <p className="catalog-note">Previews are intentionally off until an audio preview is supplied. Streaming links open in a new tab.</p>
      </div>
    </section>
  );
}
