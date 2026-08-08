import { useState } from "react";
import { Navbar } from "./components/navigation/Navbar";
import { ScrollFilm } from "./components/scroll-film/ScrollFilm";
import { MusicCatalog } from "./components/music/MusicCatalog";
import { About } from "./components/about/About";
import { Gallery } from "./components/gallery/Gallery";
import { ContactForm } from "./components/contact/ContactForm";
import { Footer } from "./components/footer/Footer";

export function App() {
  const [filmProgress, setFilmProgress] = useState(0);

  return (
    <div className="site-shell">
      <Navbar filmProgress={filmProgress} />
      <main id="main-content">
        <ScrollFilm onProgress={setFilmProgress} />
        <MusicCatalog />
        <section className="manifesto-section" aria-labelledby="manifesto-title">
          <div className="section-inner manifesto-layout">
            <span className="eyebrow">The manifesto</span>
            <h2 id="manifesto-title">A new generation of Haryanvi sound.</h2>
            <p>
              Mohit brings the cultural character of Haryana into a modern musical language, shaping songs with the clarity of a lyricist and the instinct of a composer.
            </p>
            <div className="bronze-rule" aria-hidden="true" />
          </div>
        </section>
        <About />
        <Gallery />
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
