import { ArrowUpRight, Apple, Instagram, Music2, Youtube } from "lucide-react";
import { artist } from "../../data/artist";

const socialItems = [
  { label: "Spotify", href: artist.social.spotify, icon: Music2 },
  { label: "YouTube", href: artist.social.youtube, icon: Youtube },
  { label: "Instagram", href: artist.social.instagram, icon: Instagram },
  { label: "Apple Music", href: artist.social.appleMusic, icon: Apple }
];

export function About() {
  return (
    <section className="about-section section-band" id="about" data-section="about" aria-labelledby="about-title">
      <div className="section-inner about-layout">
        <div className="about-media">
          <img src="/pictures/about-section-image.jpg" alt="Mohit Ladhotiya in a recording studio beside a microphone" loading="lazy" />
          <span className="image-index">02 / 04</span>
        </div>
        <div className="about-copy">
          <span className="eyebrow">The artist</span>
          <h2 id="about-title">Tradition in the soul. A modern sound in every beat.</h2>
          <p className="about-lead">{artist.description}</p>
          <div className="about-points">
            <div><span>01</span><p>Haryanvi cultural influence carried through the feeling, language, and atmosphere of each song.</p></div>
            <div><span>02</span><p>Modern production that leaves room for rhythm, texture, and a distinct point of view.</p></div>
            <div><span>03</span><p>A three-part practice: singer, composer, and lyricist working from the same centre.</p></div>
          </div>
          <div className="about-footer">
            <div className="hero-stat"><strong>{artist.statistic}</strong><span>{artist.statisticLabel}</span></div>
            <div className="social-row">
              {socialItems.map(({ label, href, icon: Icon }) => <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} key={label}><Icon size={16} /></a>)}
            </div>
          </div>
          <a className="text-link text-link--large" href="#contact">Work with Mohit <ArrowUpRight size={15} /></a>
        </div>
      </div>
    </section>
  );
}
