# Mohit Ladhotiya cinematic site

Production-ready React/Vite artist website for Mohit Ladhotiya. The opening section uses the supplied Google Flow clips as scroll-controlled video frames, with a static portrait fallback for reduced motion and devices that cannot seek video.

## Local development

Requirements: Node.js 18 or newer.

```text
npm install
npm run dev
```

The production build is created with:

```text
npm run build
npm run preview
```

## Assets

The original assets remain in `Pictures/`. Optimized web assets are generated into `public/pictures/` by:

```text
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/optimize-images.ps1
```

To replace an image, update the source file in `Pictures/`, rerun the optimizer, and keep the public filename mapped in `src/lib/assets.ts` and the relevant data file.

The supplied videos are served from `public/videos/scroll-film/` using these filenames:

```text
01-intro-emergence.mp4
02-haryana-roots.mp4
03-songwriter-studio.mp4
04-music-energy.mp4
05-live-performance.mp4
06-final-portrait.mp4
```

To replace a clip, keep the same filename and restart the dev server. The scroll timeline uses the durations and chapter ranges in `src/data/filmChapters.ts`.

The opening scroll film uses the generated `fullvideo-web.mp4` and `fullvideo-mobile.mp4` variants. Audio cards use 30-second, 128 kbps files in `public/music/previews/` instead of downloading the full songs. After replacing the source film or songs, regenerate those assets with:

```text
npm run optimize:media
```

## Songs and gallery

Song metadata is centralized in `src/data/songs.ts`. Add a song object with its optimized cover path and streaming URLs. Audio previews can be added through `audioPreview`; the interface is prepared to keep one preview active at a time, but no preview autoplays.

Gallery metadata is centralized in `src/data/gallery.ts`. Add the optimized image path, meaningful alt text, caption, and layout type.

## Contact email and social links

Artist identity, email, statistic, and social links are centralized in `src/data/artist.ts`. The contact form prepares a Gmail compose URL, mailto fallback, and copyable message. It never reports that a message was sent.

## Firebase

Firebase is optional. Copy `.env.example` to `.env.local` only when Firebase is needed and provide the `VITE_FIREBASE_*` values. Missing values do not affect rendering because local data remains the default and `src/lib/firebase.ts` returns `null` when configuration is incomplete.

## Netlify

The repository includes `netlify.toml` and `public/_redirects`. Deploy with:

```text
npm install
npm run build
```

Netlify should use the build command `npm run build` and publish directory `dist`. Static images and videos are configured for immutable caching. If a media filename changes, update the data manifest or use a versioned filename so browsers receive the replacement.

## Frame sequence option

The current implementation uses deterministic video seeking on the canvas so deployment does not depend on FFmpeg. If an image sequence is introduced later, place desktop frames in `public/frames/desktop/`, mobile frames in `public/frames/mobile/`, and replace the seek layer in `src/components/scroll-film/ScrollFilm.tsx` with a manifest-driven canvas renderer. Keep the chapter ranges in `src/data/filmChapters.ts` unchanged unless the edit durations change.
