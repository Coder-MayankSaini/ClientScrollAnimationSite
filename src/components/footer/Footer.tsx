import { ArrowUp, Apple, Instagram, Mail, Music2, Youtube } from "lucide-react";
import { artist } from "../../data/artist";

const footerSocials = [
  { label: "Spotify", href: artist.social.spotify, icon: Music2 },
  { label: "YouTube", href: artist.social.youtube, icon: Youtube },
  { label: "Instagram", href: artist.social.instagram, icon: Instagram },
  { label: "Apple Music", href: artist.social.appleMusic, icon: Apple }
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-line" aria-hidden="true" />
      <div className="section-inner footer-top">
        <div><a className="wordmark wordmark--footer" href="#home"><span>Mohit</span><span>Ladhotiya</span></a><p>{artist.descriptor}</p></div>
        <p className="footer-statement">Rooted in Haryana.<br />Heard everywhere.</p>
        <a className="contact-email" href={`mailto:${artist.email}`}><Mail size={15} />{artist.email}</a>
      </div>
      <div className="section-inner footer-bottom">
        <span>© {new Date().getFullYear()} Mohit Ladhotiya</span>
        <span className="footer-credit">
          Site by <strong>Mayank Saini</strong>
          <span aria-hidden="true">·</span>
          <a href="mailto:work.mayanksaini@gmail.com">work.mayanksaini@gmail.com</a>
          <span aria-hidden="true">·</span>
          <a href="https://www.linkedin.com/in/mayanksaini-coder/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </span>
        <nav aria-label="Footer navigation">{["music", "about", "gallery", "contact"].map((item) => <a href={`#${item}`} key={item}>{item}</a>)}</nav>
        <div className="footer-socials">{footerSocials.map(({ label, href, icon: Icon }) => <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} key={label}><Icon size={15} /></a>)}</div>
        <a className="back-to-top" href="#home" aria-label="Back to top"><ArrowUp size={15} />Top</a>
      </div>
    </footer>
  );
}
