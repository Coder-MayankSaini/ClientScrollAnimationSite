export type SocialLinks = {
  spotify: string;
  youtube: string;
  instagram: string;
  appleMusic: string;
};

export type Song = {
  id: string;
  title: string;
  cover: string;
  releaseYear: string;
  category?: "Single" | "Album" | "Collaboration";
  audioPreview?: string;
  spotifyUrl?: string;
  youtubeUrl?: string;
  appleMusicUrl?: string;
};

export type GalleryImage = {
  id: string;
  src: string;
  alt: string;
  caption: string;
  layout: "feature" | "portrait";
};

export type FilmChapter = {
  id: string;
  title: string;
  caption: string;
  video: string;
  duration: number;
  start: number;
  end: number;
};
