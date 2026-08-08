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
  const videoRef = useRef<HTMLVideoElement>(null);
  const syncFrameRef = useRef<number>();
  const scrollFrameRef = useRef<number>();
  const seekFrameRef = useRef<number>();
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);

  const lastRequestedTimeRef = useRef(-1);
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const chapter = useMemo(() => getChapter(progress), [progress]);

  useEffect(() => {
    onProgress?.(progress);
  }, [onProgress, progress]);

  useEffect(() => {
    if (reducedMotion || !rootRef.current || !stageRef.current || !videoRef.current) return;

    const root = rootRef.current;
    const video = videoRef.current;
    let mounted = true;
    let lastPublishedProgress = -1;

    const seekVideoToLatestTarget = () => {
      seekFrameRef.current = undefined;
      if (!mounted) return;

      const progress = currentProgressRef.current;
      const safeDuration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 13.667;
      const time = Math.max(0, Math.min(Math.max(0, safeDuration - 0.05), progress * safeDuration));

      if (video.readyState < HTMLMediaElement.HAVE_METADATA) return;

      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        setLoaded(true);
      }

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
      if (scrollFrameRef.current) return;
      scrollFrameRef.current = requestAnimationFrame(() => {
        scrollFrameRef.current = undefined;
        if (!mounted) return;
        setProgress(nextProgress);
        onProgress?.(nextProgress);
      });
    };

    const updateFromScroll = () => {
      const scrollDistance = Math.max(1, root.offsetHeight - window.innerHeight);
      targetProgressRef.current = Math.max(0, Math.min(1, -root.getBoundingClientRect().top / scrollDistance));
    };

    const syncScrollPosition = () => {
      if (!mounted) return;
      
      const diff = targetProgressRef.current - currentProgressRef.current;
      if (Math.abs(diff) > 0.0001) {
        currentProgressRef.current += diff * 0.08; // The "shock absorber" (Lerp) factor
        
        if (lastPublishedProgress < 0 || Math.abs(lastPublishedProgress - currentProgressRef.current) > 0.0001) {
          lastPublishedProgress = currentProgressRef.current;
          publishProgress(currentProgressRef.current);
        }
        requestSeek();
      }

      syncFrameRef.current = requestAnimationFrame(syncScrollPosition);
    };

    const resize = () => {
      updateFromScroll();
    };
    const onLoadedMetadata = () => {
      if (!mounted) return;
      video.pause();
      lastRequestedTimeRef.current = -1;
      requestSeek();

      // Starting a muted inline video briefly warms the decoder on Safari and
      // some Android browsers. Without this, a paused video can accept
      // currentTime changes but keep displaying its poster/first decoded frame.
      void video.play().then(() => {
        video.pause();
        requestSeek();
      }).catch(() => {
        requestSeek();
      });
    };
    const onSeeked = () => {
      if (!mounted) return;
      requestSeek();
    };
    const onError = () => {
      if (mounted) setVideoError(true);
    };
    const onLoadedData = () => {
      setLoaded(true);
      requestSeek();
    };
    const onCanPlay = () => {
      setLoaded(true);
      requestSeek();
    };
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("error", onError);
    video.addEventListener("loadeddata", onLoadedData);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("seeked", onSeeked);
    window.addEventListener("scroll", updateFromScroll, { passive: true });
    window.addEventListener("resize", resize);
    requestSeek();
    updateFromScroll();
    currentProgressRef.current = targetProgressRef.current;
    publishProgress(currentProgressRef.current);
    syncFrameRef.current = requestAnimationFrame(syncScrollPosition);

    return () => {
      mounted = false;
      if (syncFrameRef.current) { cancelAnimationFrame(syncFrameRef.current); syncFrameRef.current = undefined; }
      if (scrollFrameRef.current) { cancelAnimationFrame(scrollFrameRef.current); scrollFrameRef.current = undefined; }
      if (seekFrameRef.current) { cancelAnimationFrame(seekFrameRef.current); seekFrameRef.current = undefined; }
      video.pause();
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("error", onError);
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("seeked", onSeeked);
      window.removeEventListener("scroll", updateFromScroll);
      window.removeEventListener("resize", resize);
    };
  }, [onProgress, reducedMotion]);

  if (reducedMotion) return <StaticHero />;

  return (
    <section className="film-scroll" id="home" data-section="home" ref={rootRef} aria-labelledby="hero-title">
      <div className="film-stage" ref={stageRef}>
        <img className="film-poster" src="/pictures/hero-poster.jpg" alt="" aria-hidden="true" />
        <video ref={videoRef} className={`film-video-source${loaded ? " film-video-source--ready" : ""}`} src="/videos/scroll-film/fullvideo.mp4" muted playsInline preload="auto" poster="/pictures/hero-poster.jpg" aria-hidden="true" />
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
