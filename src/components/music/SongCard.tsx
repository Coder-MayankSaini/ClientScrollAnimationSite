import { Apple, ExternalLink, Music2, Pause, Play, Youtube } from "lucide-react";
import type { Song } from "../../types";

type SongCardProps = {
  song: Song;
  index: number;
  active: boolean;
  playing: boolean;
  onSelect: () => void;
};

export function SongCard({ song, index, active, playing, onSelect }: SongCardProps) {
  return (
    <article className={`song-card ${active ? "song-card--active" : ""}`}>
      <button type="button" className="song-art-button" onClick={onSelect} aria-label={`${playing ? "Pause" : "Play"} ${song.title} preview`} aria-pressed={playing}>
        <span className="song-number">0{index + 1}</span>
        <img src={song.cover} alt={`${song.title} cover artwork`} loading={index > 2 ? "lazy" : "eager"} />
        <span className="song-art-overlay">{playing ? <Pause size={19} fill="currentColor" aria-hidden="true" /> : <Play size={19} fill="currentColor" aria-hidden="true" />}</span>
      </button>
      <div className="song-card-content">
        <div>
          <span className="eyebrow">{song.releaseYear}</span>
          <h3>{song.title}</h3>
        </div>
        <div className="song-links">
          {song.spotifyUrl && <a href={song.spotifyUrl} target="_blank" rel="noopener noreferrer" aria-label={`Listen to ${song.title} on Spotify`} title="Spotify"><Music2 size={15} /></a>}
          {song.youtubeUrl && <a href={song.youtubeUrl} target="_blank" rel="noopener noreferrer" aria-label={`Watch ${song.title} on YouTube`} title="YouTube"><Youtube size={15} /></a>}
          {song.appleMusicUrl && <a href={song.appleMusicUrl} target="_blank" rel="noopener noreferrer" aria-label={`Listen to ${song.title} on Apple Music`} title="Apple Music"><Apple size={15} /></a>}
          <a className="text-link" href={song.spotifyUrl ?? song.youtubeUrl} target="_blank" rel="noopener noreferrer">Listen <ExternalLink size={13} /></a>
        </div>
      </div>
    </article>
  );
}
