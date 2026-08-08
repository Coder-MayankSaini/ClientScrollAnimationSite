import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { artist } from "../../data/artist";
import { filmChapters } from "../../data/filmChapters";
import { useReducedMotion } from "../../hooks/useReducedMotion";

type ScrollFilmProps = {
  onProgress?: (progress: number) => void;
};

function getChapter(progress: number) {
  return filmChapters.find((chapter) => progress >= chapter.start && progress <= chapter.end) ?? filmChapters[filmChapters.length - 1];
}

function getSeekTarget(progress: number, duration: number) {
  const chapter = getChapter(progress);
  const chapterIndex = filmChapters.indexOf(chapter);
  const chapterRange = chapter.end - chapter.start;
  const localProgress = Math.max(0, Math.min(1, (progress - chapter.start) / chapterRange));
  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : chapter.duration;
  const time = Math.max(0, Math.min(Math.max(0, safeDuration - 0.05), localProgress * safeDuration));
  return { chapter, chapterIndex, time };
}

function StaticHero() {
  return (
    <section className="film-scroll film-scroll--static" id="home" data-section="home" aria-labelledby="hero-title">
      <div className="film-stage film-stage--static">
        <img className="static-hero-image" src="/pictures/hero-poster.jpg" alt="Mohit Ladhotiya in a dark jacket" />
        <div className="film-vignette" aria-hidden="true" />
        <HeroCopy />
      </div>
    </section>
  );
}

function HeroCopy() {
  return (
    <div className="film-copy">
      <span className="eyebrow">Official artist website</span>
      <h1 id="hero-title"><span>Mohit</span><span>Ladhotiya</span></h1>
      <p className="hero-descriptor">{artist.descriptor}</p>
      <p className="hero-tagline">{artist.tagline}</p>
      <div className="hero-stat"><strong>{artist.statistic}</strong><span>{artist.statisticLabel}</span></div>
      <div className="hero-actions">
        <a className="button button--solid" href="#music">Listen now <ArrowUpRight size={16} aria-hidden="true" /></a>
        <a className="button button--text" href="#contact">Bookings &amp; enquiries <ArrowUpRight size={16} aria-hidden="true" /></a>
      </div>
    </div>
  );
}

export function ScrollFilm({ onProgress }: ScrollFilmProps) {
  const reducedMotion = useReducedMotion();
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrollFrameRef = useRef<number>();
  const seekFrameRef = useRef<number>();
  const targetProgressRef = useRef(0);
  const activeChapterRef = useRef(0);
  const lastRequestedTimeRef = useRef(-1);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const chapter = useMemo(() => getChapter(progress), [progress]);

  useEffect(() => {
    onProgress?.(progress);
  }, [onProgress, progress]);

  useEffect(() => {
    if (reducedMotion || !rootRef.current || !stageRef.current || !canvasRef.current || !videoRef.current) return;

    const root = rootRef.current;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    let mounted = true;

    const drawFrame = () => {
      const context = contextRef.current ?? canvas.getContext("2d");
      contextRef.current = context;
      if (!context || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || video.videoWidth === 0 || video.videoHeight === 0) return false;
      const bounds = canvas.getBoundingClientRect();
      if (bounds.width === 0 || bounds.height === 0) return false;
      const compactViewport = window.matchMedia("(max-width: 620px)").matches;
      const lowPowerDevice = window.navigator.hardwareConcurrency > 0 && window.navigator.hardwareConcurrency <= 4;
      const dpr = Math.min(window.devicePixelRatio || 1, compactViewport || lowPowerDevice ? 1 : 1.45);
      const width = Math.max(1, Math.round(bounds.width * dpr));
      const height = Math.max(1, Math.round(bounds.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      context.fillStyle = "#050403";
      context.fillRect(0, 0, width, height);
      // Desktop preserves the full frame; mobile uses a centered portrait-safe crop.
      const scale = compactViewport
        ? Math.max(width / video.videoWidth, height / video.videoHeight)
        : Math.min(width / video.videoWidth, height / video.videoHeight);
      const drawWidth = video.videoWidth * scale;
      const drawHeight = video.videoHeight * scale;
      const x = (width - drawWidth) / 2;
      const y = (height - drawHeight) / 2;
      try {
        context.drawImage(video, x, y, drawWidth, drawHeight);
      } catch {
        return false;
      }
      setLoaded(true);
      return true;
    };

    const seekVideoToLatestTarget = () => {
      seekFrameRef.current = undefined;
      if (!mounted) return;

      const { chapter, chapterIndex, time } = getSeekTarget(
        targetProgressRef.current,
        video.duration
      );

      if (activeChapterRef.current !== chapterIndex) {
        activeChapterRef.current = chapterIndex;
        lastRequestedTimeRef.current = -1;
        setVideoError(false);
        video.src = chapter.video;
        video.load();
        return;
      }

      if (video.readyState < HTMLMediaElement.HAVE_METADATA) return;

      // A new scroll target supersedes the previous one. Browsers can safely
      // replace a pending seek, which prevents fast wheel/touch scrolling from
      // waiting indefinitely for an old `seeked` event.
      if (Math.abs(lastRequestedTimeRef.current - time) < 0.025) return;
      lastRequestedTimeRef.current = time;
      try {
        video.currentTime = time;
      } catch {
        // The source may have changed between the readyState check and the
        // assignment. The next scroll frame will retry with the latest target.
        lastRequestedTimeRef.current = -1;
      }
    };

    const requestSeek = () => {
      if (seekFrameRef.current) return;
      seekFrameRef.current = requestAnimationFrame(seekVideoToLatestTarget);
    };

    const publishProgress = (nextProgress: number) => {
      targetProgressRef.current = nextProgress;
      if (scrollFrameRef.current) return;
      scrollFrameRef.current = requestAnimationFrame(() => {
        scrollFrameRef.current = undefined;
        if (!mounted) return;
        setProgress(targetProgressRef.current);
        onProgress?.(targetProgressRef.current);
      });
    };

    const updateFromScroll = () => {
      const scrollDistance = Math.max(1, root.offsetHeight - window.innerHeight);
      const nextProgress = Math.max(0, Math.min(1, -root.getBoundingClientRect().top / scrollDistance));
      publishProgress(nextProgress);
      requestSeek();
    };

    const resize = () => {
      updateFromScroll();
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) drawFrame();
    };
    const onLoadedMetadata = () => {
      if (!mounted) return;
      video.pause();
      lastRequestedTimeRef.current = -1;
      requestSeek();
    };
    const onSeeked = () => {
      if (!mounted) return;
      drawFrame();
      requestSeek();
    };
    const onError = () => {
      if (mounted) setVideoError(true);
    };
    const onLoadedData = () => {
      drawFrame();
      requestSeek();
    };
    const onCanPlay = () => {
      drawFrame();
      requestSeek();
    };
    const onTimeUpdate = () => {
      if (!video.seeking) drawFrame();
    };
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("error", onError);
    video.addEventListener("loadeddata", onLoadedData);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("timeupdate", onTimeUpdate);
    window.addEventListener("scroll", updateFromScroll, { passive: true });
    window.addEventListener("resize", resize);
    requestSeek();
    updateFromScroll();

    return () => {
      mounted = false;
      if (scrollFrameRef.current) cancelAnimationFrame(scrollFrameRef.current);
      if (seekFrameRef.current) cancelAnimationFrame(seekFrameRef.current);
      video.pause();
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("error", onError);
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("timeupdate", onTimeUpdate);
      window.removeEventListener("scroll", updateFromScroll);
      window.removeEventListener("resize", resize);
    };
  }, [onProgress, reducedMotion]);

  if (reducedMotion) return <StaticHero />;

  return (
    <section className="film-scroll" id="home" data-section="home" ref={rootRef} aria-labelledby="hero-title">
      <div className="film-stage" ref={stageRef}>
        <img className="film-poster" src="/pictures/hero-poster.jpg" alt="" aria-hidden="true" />
        <video ref={videoRef} className="film-video-source" src={filmChapters[0].video} muted playsInline preload="auto" poster="/pictures/hero-poster.jpg" aria-hidden="true" />
        <canvas ref={canvasRef} className={`film-canvas${loaded ? " film-canvas--ready" : ""}`} aria-label="Cinematic visual sequence of Mohit Ladhotiya" role="img" />
        <div className="film-vignette" aria-hidden="true" />
        <div className="film-grain" aria-hidden="true" />
        <div className="film-chapter-marker" aria-hidden="true"><span>0{filmChapters.indexOf(chapter) + 1}</span><i /></div>
        <div className="film-copy film-copy--scrub">
          <span className="eyebrow">Official artist website</span>
          <h1 id="hero-title"><span>Mohit</span><span>Ladhotiya</span></h1>
          <p className="hero-descriptor">{artist.descriptor}</p>
          <p className="hero-tagline">{artist.tagline}</p>
          <div className="hero-stat"><strong>{artist.statistic}</strong><span>{artist.statisticLabel}</span></div>
          <div className="hero-actions">
            <a className="button button--solid" href="#music">Listen now <ArrowUpRight size={16} aria-hidden="true" /></a>
            <a className="button button--text" href="#contact">Bookings &amp; enquiries <ArrowUpRight size={16} aria-hidden="true" /></a>
          </div>
        </div>
        <div className="film-caption" aria-live="polite">
          <span>{chapter.title}</span>
          <strong>{chapter.caption}</strong>
        </div>
        <div className="scroll-cue" aria-hidden="true"><span>Scroll to enter</span><ArrowDown size={15} /></div>
        {!loaded && !videoError && <div className="film-loader"><span className="loader-dot" /> Loading the film</div>}
        {videoError && <div className="film-fallback-note">The film is unavailable on this device. The portrait remains available below.</div>}
      </div>
    </section>
  );
}
