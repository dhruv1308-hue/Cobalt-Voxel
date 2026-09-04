/**
 * Mineral Signal reminder: this page is a split-stage editorial surface—deep navy structure,
 * cream paper sections, cobalt signal accents, blueprint rules, and tactile motion. Avoid
 * centered card stacks; preserve the offset rhythm and material contrast.
 */
import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { ArrowDownRight, ArrowUpRight, Menu, MoveUpRight, X } from "lucide-react";
import { Link } from "wouter";
import VoxelSphere from "../../../components/originkit/ui/voxel-sphere";
import BrandMark from "../components/BrandMark";
import DrawCvGate from "../components/DrawCvGate";

const HERO_IMAGE = "/manus-storage/hero-signal-blue_2acfce20.png";

export default function Home() {
  // The useAuth hook provides authentication state.
  // To implement login/logout, call logout(), or start login from an event
  // handler: onClick={() => startLogin()} (imported from "@/const"). Never call
  // startLogin() during render (no href={startLogin()}) — it mints a one-time
  // nonce cookie and must run only at the moment of navigation.
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [cvAccepted, setCvAccepted] = useState(false);
  const [scrollDepth, setScrollDepth] = useState(0);

  useEffect(() => {
    document.body.style.overflow = cvAccepted ? "" : "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [cvAccepted]);

  useEffect(() => {
    let frame = 0;
    const updateDepth = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const normalized = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      setScrollDepth(normalized);

      document.querySelectorAll<HTMLElement>("[data-depth]").forEach((element) => {
        const rect = element.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const progress = Math.max(-1, Math.min(1, (window.innerHeight / 2 - center) / (window.innerHeight / 2 + rect.height / 2)));
        // Deep stage fly-through: elements sink ~190px into the screen at the
        // viewport edges and travel +110px toward the viewer at center, with
        // matching tilt, so scrolling reads as moving through a 3D space.
        const centerPull = Math.max(0, 1 - Math.abs(progress));
        element.style.setProperty("--stage-x", `${progress * 34}px`);
        element.style.setProperty("--stage-y", `${progress * -96}px`);
        element.style.setProperty("--stage-z", `${-190 + centerPull * 300}px`);
        element.style.setProperty("--stage-rotate-x", `${progress * 12}deg`);
        element.style.setProperty("--stage-rotate-y", `${progress * -16}deg`);
        element.style.setProperty("--stage-rotate", `${progress * -6}deg`);
        element.style.setProperty("--stage-scale", `${0.9 + centerPull * 0.18}`);
      });
    };
    const onScroll = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateDepth);
    };
    updateDepth();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);
  const depthStyle = { "--scroll-depth": scrollDepth } as React.CSSProperties;

  return (
    <>
      {!cvAccepted && <DrawCvGate onUnlock={() => setCvAccepted(true)} />}
      <main className={`site-shell ${cvAccepted ? "site-shell--open" : "site-shell--locked"}`} style={depthStyle}>
      <section className="hero-section" id="top">
        <div className="hero-backdrop" style={{ backgroundImage: `url(${HERO_IMAGE})` }} aria-hidden="true" />
        <div className="hero-wash" aria-hidden="true" />
        <header className="site-header site-header--hero">
          <BrandMark light />
          <nav className={`site-nav ${menuOpen ? "site-nav--open" : ""}`} aria-label="Primary navigation">
            <a href="#method" onClick={closeMenu}>Method <span>02</span></a>
            <a href="#signal" onClick={closeMenu}>Signal <span>03</span></a>
            <a href="#notes" onClick={closeMenu}>Notes <span>04</span></a>
            <Link href="/sign-in" onClick={closeMenu} className="nav-access">Enter workspace <MoveUpRight size={14} strokeWidth={1.6} /></Link>
          </nav>
          <button className="menu-toggle" type="button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
            {menuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
          </button>
        </header>

        <div className="hero-grid shell-width">
          <div className="hero-copy reveal" style={{ "--delay": "100ms" } as React.CSSProperties}>
            <p className="eyebrow eyebrow--light"><span className="eyebrow-dot" /> Creative systems / 2026</p>
            <h1>Shape<br /><em>the signal.</em></h1>
            <p className="hero-dek">Cobalt Voxel is a material interface for turning loose ideas into systems that hold their shape.</p>
            <div className="hero-actions">
              <Link href="/sign-in" className="button button--cobalt">Enter the workspace <ArrowUpRight size={16} strokeWidth={1.5} /></Link>
              <a href="#method" className="text-link text-link--light">Explore the method <ArrowDownRight size={16} strokeWidth={1.5} /></a>
            </div>
          </div>

          <div className="hero-object stage-depth reveal" data-depth="hero" style={{ "--delay": "220ms" } as React.CSSProperties}>
            <div className="hero-object__frame" aria-hidden="true">
              <span className="frame-corner frame-corner--tl" />
              <span className="frame-corner frame-corner--tr" />
              <span className="frame-corner frame-corner--br" />
              <span className="frame-corner frame-corner--bl" />
              <span className="frame-label frame-label--top">live / 00.184°</span>
              <span className="frame-label frame-label--side">drag to orbit</span>
            </div>
            <div className="hero-object__sphere">
              <VoxelSphere
                color="#2457D6"
                tip="#B8D9EA"
                sheen="#F7F4EC"
                shape="sphere"
                count={17}
                cube={10}
                breath={9}
                wave={18}
                gap={5}
                gloss={14}
                speed={3}
                direction="right"
                dragSensitivity={8}
                sizePercent={75}
              />
            </div>
            <div className="hero-object__caption"><span>01</span><span>cobalt / mineral core</span></div>
          </div>
        </div>

        <div className="hero-footer shell-width">
          <span>Scroll to inspect the surface</span>
          <span className="hero-footer__line" />
          <span>01 — 05</span>
        </div>
      </section>

      <section className="manifesto-section section-paper" id="method">
        <div className="shell-width manifesto-grid">
          <div className="section-marker"><span>02</span><span className="section-marker__line" /></div>
          <div className="manifesto-copy reveal">
            <p className="eyebrow">The method / a short brief</p>
            <h2>Make the<br /><em>invisible tangible.</em></h2>
            <p className="body-large">Good tools do more than organize a thought. They give it a surface, a temperature, a little gravity. We build for that moment when an idea stops hovering and starts to become a thing.</p>
            <a href="#signal" className="text-link">Read the field notes <ArrowDownRight size={16} strokeWidth={1.5} /></a>
          </div>
          <div className="manifesto-visual stage-depth reveal" data-depth="manifesto" style={{ "--delay": "100ms" } as React.CSSProperties} role="img" aria-label="Open cobalt voxel ring study"><VoxelSphere shape="ring" color="#F7F4EC" tip="#B8D9EA" sheen="#2457D6" count={9} cube={15} breath={10} wave={0} gap={11} gloss={9} speed={3} direction="left" dragSensitivity={5} sizePercent={72} /><span>02 / open ring study</span></div>
          <div className="manifesto-aside reveal" style={{ "--delay": "160ms" } as React.CSSProperties}>
            <div className="rule-note"><span className="rule-note__number">A.</span><p>Hold the shape<br />before adding the shine.</p></div>
            <div className="rule-note"><span className="rule-note__number">B.</span><p>Let each interaction<br />leave a trace.</p></div>
            <div className="rule-note"><span className="rule-note__number">C.</span><p>Build a system<br />that feels like yours.</p></div>
          </div>
        </div>
      </section>

      <section className="signal-section section-sky" id="signal">
        <div className="shell-width signal-grid">
          <div className="signal-visual signal-visual--orbit stage-depth reveal" data-depth="signal">
            <div className="signal-visual__grid" aria-hidden="true" />
            <div className="signal-visual__sphere"><VoxelSphere shape="helix" color="#07162E" tip="#2457D6" sheen="#F7F4EC" count={10} cube={16} breath={12} wave={2} gap={14} gloss={5} speed={5} direction="left" dragSensitivity={7} sizePercent={68} /></div>
            <span className="image-stamp">archive / 03</span>
            <span className="signal-visual__axis">axis / 03.6</span>
          </div>
          <div className="signal-copy reveal" style={{ "--delay": "120ms" } as React.CSSProperties}>
            <p className="eyebrow">Signal / active material</p>
            <h2>Less interface.<br /><em>More presence.</em></h2>
            <p>Every screen is a place you arrive. The workspace keeps the noise low and the signal close, so your thinking can take up the room it needs.</p>
            <div className="stat-line"><span>01</span><strong>Surface</strong><span>Make a thought visible.</span></div>
            <div className="stat-line"><span>02</span><strong>Tempo</strong><span>Move at the speed of clarity.</span></div>
            <div className="stat-line"><span>03</span><strong>Trace</strong><span>Keep the useful residue.</span></div>
            <Link href="/sign-in" className="button button--navy">Open the workspace <ArrowUpRight size={16} strokeWidth={1.5} /></Link>
          </div>
        </div>
      </section>

      <section className="field-section section-paper">
        <div className="shell-width field-grid">
          <div className="field-copy reveal">
            <p className="eyebrow">Field study / 04</p>
            <h2>Tools with<br /><em>a point of view.</em></h2>
            <p>Direction is not a constraint here. It is the material. Cobalt Voxel gives your work a small set of strong surfaces, then gets out of the way.</p>
            <div className="field-pills" aria-label="Product qualities">
              <span>Spatial</span><span>Focused</span><span>Inspectable</span>
            </div>
          </div>
          <div className="field-visual field-visual--blocks stage-depth reveal" data-depth="field" style={{ "--delay": "160ms" } as React.CSSProperties}>
            <div className="field-visual__ruler" aria-hidden="true"><span>0</span><i /><span>18</span><i /><span>36</span><i /><span>54</span></div>
            <div className="field-visual__blocks" aria-hidden="true"><span /><span /><span /><span /><span /><span /></div>
            <div className="field-visual__core"><VoxelSphere shape="grid" color="#2457D6" tip="#B8D9EA" sheen="#F7F4EC" count={8} cube={18} breath={16} wave={19} gap={12} gloss={4} speed={7} direction="right" dragSensitivity={6} sizePercent={66} /></div>
            <div className="field-visual__caption"><span>cobalt voxel / metric field</span><span>42.11° N</span></div>
          </div>
        </div>
      </section>

      <section className="notes-section section-navy" id="notes">
        <div className="shell-width notes-grid">
          <div className="notes-heading reveal">
            <p className="eyebrow eyebrow--light">Notes / closing signal</p>
            <h2>A quieter way<br /><em>to move forward.</em></h2>
          </div>
          <div className="notes-image notes-image--core stage-depth reveal" data-depth="notes" style={{ "--delay": "140ms" } as React.CSSProperties}>
            <div className="notes-image__sphere"><VoxelSphere shape="pyramid" color="#2457D9" tip="#B8D9EA" sheen="#F7F4EC" count={11} cube={8} breath={3} wave={0} gap={13} gloss={18} speed={2} direction="right" dragSensitivity={4} sizePercent={62} /></div>
            <span>05 / core detail</span>
          </div>
          <div className="notes-cta reveal" style={{ "--delay": "220ms" } as React.CSSProperties}>
            <p>Start with the thing that is still becoming. We’ll give it somewhere to land.</p>
            <Link href="/sign-in" className="button button--cream">Enter the workspace <ArrowUpRight size={16} strokeWidth={1.5} /></Link>
          </div>
        </div>
        <footer className="site-footer shell-width">
          <BrandMark light />
          <span>© 2026 Cobalt Voxel / Material interface studio</span>
          <span className="site-footer__links">
            <Link href="/terms">Terms & conditions</Link>
            <a href="#top">Back to top <ArrowUpRight size={14} strokeWidth={1.5} /></a>
          </span>
        </footer>
      </section>
      </main>
    </>
  );
}
