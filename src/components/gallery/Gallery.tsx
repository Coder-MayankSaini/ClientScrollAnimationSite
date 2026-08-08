import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { gallery } from "../../data/gallery";

export function Gallery() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);
  const pointerStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (activeIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowRight") setActiveIndex((value) => value === null ? 0 : (value + 1) % gallery.length);
      if (event.key === "ArrowLeft") setActiveIndex((value) => value === null ? gallery.length - 1 : (value - 1 + gallery.length) % gallery.length);
      if (event.key === "Tab") {
        const focusable = document.querySelectorAll<HTMLElement>(".lightbox button");
        if (focusable.length && document.activeElement === focusable[focusable.length - 1] && !event.shiftKey) {
          event.preventDefault();
          focusable[0].focus();
        } else if (focusable.length && document.activeElement === focusable[0] && event.shiftKey) {
          event.preventDefault();
          focusable[focusable.length - 1].focus();
        }
      }
    };
    document.body.classList.add("lightbox-is-open");
    document.addEventListener("keydown", onKeyDown);
    closeButtonRef.current?.focus();
    return () => {
      document.body.classList.remove("lightbox-is-open");
      document.removeEventListener("keydown", onKeyDown);
      lastTriggerRef.current?.focus();
    };
  }, [activeIndex]);

  const openImage = (index: number, trigger: HTMLButtonElement) => {
    lastTriggerRef.current = trigger;
    setActiveIndex(index);
  };

  return (
    <section className="gallery-section section-band" id="gallery" data-section="gallery" aria-labelledby="gallery-title">
      <div className="section-inner">
        <div className="section-heading">
          <span className="eyebrow">Frames from the work</span>
          <h2 id="gallery-title">In the room. In the moment.</h2>
        </div>
        <div className="gallery-grid">
          {gallery.map((image, index) => (
            <figure className={`gallery-item gallery-item--${image.layout}`} key={image.id}>
              <button type="button" onClick={(event) => openImage(index, event.currentTarget)} aria-label={`Open ${image.alt}`}>
                <img src={image.src} alt={image.alt} loading="lazy" />
                <span className="gallery-expand">View frame</span>
              </button>
              <figcaption><span>0{index + 1}</span>{image.caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>

      {activeIndex !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Gallery lightbox">
          <div className="lightbox-backdrop" onClick={() => setActiveIndex(null)} />
          <div className="lightbox-panel" onPointerDown={(event) => { pointerStartRef.current = event.clientX; }} onPointerUp={(event) => {
            if (pointerStartRef.current === null) return;
            const distance = event.clientX - pointerStartRef.current;
            if (Math.abs(distance) > 45) setActiveIndex((value) => value === null ? 0 : (value + (distance < 0 ? 1 : -1) + gallery.length) % gallery.length);
            pointerStartRef.current = null;
          }}>
            <button ref={closeButtonRef} type="button" className="icon-button lightbox-close" onClick={() => setActiveIndex(null)} aria-label="Close gallery"><X size={20} /></button>
            <button type="button" className="icon-button lightbox-prev" onClick={() => setActiveIndex((value) => value === null ? 0 : (value - 1 + gallery.length) % gallery.length)} aria-label="Previous image"><ArrowLeft size={20} /></button>
            <img src={gallery[activeIndex].src} alt={gallery[activeIndex].alt} />
            <button type="button" className="icon-button lightbox-next" onClick={() => setActiveIndex((value) => value === null ? 0 : (value + 1) % gallery.length)} aria-label="Next image"><ArrowRight size={20} /></button>
            <p>{gallery[activeIndex].caption}</p>
          </div>
        </div>
      )}
    </section>
  );
}
