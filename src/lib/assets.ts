export const assetManifest = {
  hero: "/pictures/hero.png",
  about: "/pictures/about-section-image.jpg",
  gallery: [
    "/pictures/gallery/gallery-image-1.jpg",
    "/pictures/gallery/gallery-image-2.jpg"
  ],
  thumbnails: Array.from({ length: 6 }, (_, index) => `/pictures/thumbnail/song-cover-${index + 1}.jpg`),
  film: [
    "/videos/scroll-film/01-intro-emergence.mp4",
    "/videos/scroll-film/02-haryana-roots.mp4",
    "/videos/scroll-film/03-songwriter-studio.mp4",
    "/videos/scroll-film/04-music-energy.mp4",
    "/videos/scroll-film/05-live-performance.mp4",
    "/videos/scroll-film/06-final-portrait.mp4"
  ]
} as const;
