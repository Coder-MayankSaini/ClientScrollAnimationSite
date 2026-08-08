import { useEffect, useState } from "react";
import { Apple, Instagram, Menu, Music2, X, Youtube } from "lucide-react";
import { artist } from "../../data/artist";

type NavbarProps = {
  filmProgress: number;
};

const links = [
  ["home", "Home"],
  ["music", "Music"],
  ["about", "About"],
  ["gallery", "Gallery"],
  ["contact", "Contact"]
] as const;

const socialLinks = [
  { label: "Spotify", href: artist.social.spotify, icon: Music2 },
  { label: "YouTube", href: artist.social.youtube, icon: Youtube },
  { label: "Instagram", href: artist.social.instagram, icon: Instagram },
  { label: "Apple Music", href: artist.social.appleMusic, icon: Apple }
];

export function Navbar({ filmProgress }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const sections = links
      .map(([id]) => ({ id, element: document.getElementById(id) }))
      .filter((section): section is { id: (typeof links)[number][0]; element: HTMLElement } => section.element instanceof HTMLElement);
    let frame = 0;

    const updateActiveSection = () => {
      frame = 0;
      const readingLine = window.innerHeight * 0.38;
      let current = sections[0]?.id ?? "home";

      for (const section of sections) {
        if (section.element.getBoundingClientRect().top <= readingLine) current = section.id;
      }

      setActiveSection((previous) => previous === current ? previous : current);
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateActiveSection);
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    window.addEventListener("hashchange", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      window.removeEventListener("hashchange", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-is-open", menuOpen);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("menu-is-open");
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`navbar ${filmProgress > 0.08 ? "navbar--scrolled" : ""}`}>
      <div className="nav-shell">
        <a className="wordmark" href="#home" onClick={closeMenu} aria-label="Mohit Ladhotiya home">
          <span>Mohit</span>
          <span>Ladhotiya</span>
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {links.map(([id, label]) => (
            <a className={activeSection === id ? "is-active" : ""} href={`#${id}`} key={id}>
              {label}
            </a>
          ))}
        </nav>

        <div className="nav-socials" aria-label="Streaming and social links">
          {socialLinks.map(({ label, href, icon: Icon }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} key={label}>
              <Icon size={16} strokeWidth={1.6} aria-hidden="true" />
            </a>
          ))}
        </div>

        <button
          type="button"
          className="icon-button menu-toggle"
          onClick={() => setMenuOpen((value) => !value)}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
        </button>
      </div>

      <div className={`mobile-menu ${menuOpen ? "mobile-menu--open" : ""}`} id="mobile-navigation" aria-hidden={!menuOpen}>
        <nav aria-label="Mobile navigation">
          {links.map(([id, label]) => (
            <a href={`#${id}`} key={id} onClick={closeMenu} tabIndex={menuOpen ? 0 : -1}>
              <span>0{id === "home" ? "1" : id === "music" ? "2" : id === "about" ? "3" : id === "gallery" ? "4" : "5"}</span>
              {label}
            </a>
          ))}
        </nav>
        <div className="mobile-socials">
          {socialLinks.map(({ label, href, icon: Icon }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} key={label} onClick={closeMenu} tabIndex={menuOpen ? 0 : -1}>
              <Icon size={18} aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}
