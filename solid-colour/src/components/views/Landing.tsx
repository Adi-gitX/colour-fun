import { useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Copy,
  Download,
  Image as ImageIcon,
  Layers,
  MessageSquareText,
  Palette,
  Sparkles,
  SquareTerminal,
  Code,
  RefreshCw,
} from 'lucide-react';
import libraries from '../../data/libraries.json';
import { colors } from '../../data/colors';
import { gradients } from '../../data/gradients';
import { imageUrls } from '../../data/images';
import { useAppStore } from '../../store/appStore';
import type { Section } from '../../store/appStore';
import { DotMark } from '../brand/DotMark';
import styles from './Landing.module.css';

/* ===========================================================
   The home page, section for section:
   hero · showcase bento · open-source credit · libraries marquee ·
   wallpapers trio · free plans · closing call · footer.
   AskView owns the composer, which floats over all of it.
   =========================================================== */

interface Library {
  name: string;
  homepage: string;
  indexed: number;
}
const indexedLibraries = (libraries as unknown as Library[]).filter((l) => l.indexed > 0);
const topLibraries = [...indexedLibraries].sort((a, b) => b.indexed - a.indexed);
const componentCount = indexedLibraries.reduce((n, l) => n + l.indexed, 0);

const HERO_COMMAND = 'npx shadcn@latest add "https://ui.aceternity.com/registry/3d-globe.json"';

/** Each letter is a short reel of itself that spins down into place, staggered left to right. */
function SlotLine({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <span className={styles.slotLine} aria-hidden>
      {[...text].map((ch, i) =>
        ch === ' ' ? (
          <span key={i} className={styles.slotSpace} />
        ) : (
          <span key={i} className={styles.slotChar} style={{ '--d': `${delay + i * 45}ms` } as React.CSSProperties}>
            <span className={styles.slotReel}>
              {Array.from({ length: 7 }, (_, k) => (
                <span key={k}>{ch}</span>
              ))}
            </span>
          </span>
        )
      )}
    </span>
  );
}

function useCopied(): [boolean, (text: string) => void] {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);
  return [
    copied,
    (text) => {
      void navigator.clipboard.writeText(text);
      setCopied(true);
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1500);
    },
  ];
}

export function LandingHero({ onStart }: { onStart: () => void }) {
  const [copied, copy] = useCopied();
  return (
    <section className={styles.hero}>
      <p className={styles.serif}>Garden&rsquo;s</p>
      <h1 className={styles.display}>
        <span className="visually-hidden">Describe it. Install it.</span>
        <SlotLine text="DESCRIBE IT." />
        <SlotLine text="INSTALL IT." delay={260} />
      </h1>
      <p className={styles.serif}>For shadcn/ui &amp; React</p>

      <div className={styles.heroActions}>
        <button
          type="button"
          className={styles.command}
          onClick={() => copy(HERO_COMMAND)}
          aria-label="Copy install command for 3D Globe"
        >
          <span className={styles.commandText}>
            npx shadcn add aceternity<span className={styles.commandMuted}>/3d-globe</span>
          </span>
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
        <button type="button" className={styles.quickStart} onClick={onStart}>
          Ask Garden
        </button>
      </div>
    </section>
  );
}

interface Showcase {
  title: string;
  image: string;
  /** Grid placement on the 4-column bento. */
  area: string;
}

const SHOWCASE: Showcase[] = [
  { title: '3D Globe', image: '3d-globe', area: styles.aGlobe },
  { title: '3D Marquee', image: '3d-marquee', area: styles.aMarquee },
  { title: 'Animated Testimonials', image: 'animated-testimonials', area: styles.aTestimonials },
  { title: 'Apple Cards Carousel', image: 'apple-cards-carousel', area: styles.aApple },
  { title: 'Background Beams', image: 'background-beams', area: styles.aBeams },
  { title: 'Aurora Background', image: 'aurora-background', area: styles.aAurora },
  { title: '3D Card', image: '3d-card', area: styles.aCard },
];

const STACK = ['shadcn/ui', 'Tailwind CSS', 'React', 'Motion'];

const WALLPAPERS: Array<{ section: Section; glyph: string; tone: string }> = [
  { section: 'solid-colors', glyph: 'Aa', tone: styles.toneSolid },
  { section: 'gradients', glyph: 'Aa', tone: styles.toneGradient },
  { section: 'backgrounds', glyph: 'Aa', tone: styles.toneImage },
];

function SectionHead({ title, children }: { title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className={styles.sectionHead}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {children && <p className={styles.sectionNote}>{children}</p>}
    </div>
  );
}

function DashedRule({ label }: { label?: string }) {
  return (
    <div className={`${styles.rule} ${label ? '' : styles.ruleBare}`}>
      {label && <span>{label}</span>}
    </div>
  );
}

export function LandingSections({ onAsk, onStart }: { onAsk: (text: string) => void; onStart: () => void }) {
  const theme = useAppStore((s) => s.theme);
  const setCurrentSection = useAppStore((s) => s.setCurrentSection);
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  const names = topLibraries.slice(1).map((l) => l.name);
  const featured = topLibraries[0];

  return (
    <div className={styles.sections}>
      {/* ===== Showcase bento ===== */}
      <section className={styles.section}>
        <SectionHead title={<>{componentCount.toLocaleString()}+ Outstanding components</>}>
          No extra packages — each one installs from its own library,
          <br />
          straight into your project with the shadcn CLI.
        </SectionHead>
        <div className={styles.bento}>
          {SHOWCASE.map((item) => (
            <button
              key={item.image}
              type="button"
              className={`${styles.tile} ${item.area}`}
              onClick={() => onAsk(item.title)}
            >
              <span className={styles.tileFrame}>
                <img
                  src={`${base}/showcase/${item.image}${theme === 'dark' ? '.dark' : ''}.webp`}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
                <span className={styles.tileBadge} aria-hidden>
                  <ArrowUpRight size={11} strokeWidth={2.5} />
                </span>
              </span>
              <span className={styles.tileLabel}>{item.title}</span>
            </button>
          ))}
        </div>
        <button type="button" className={styles.more} onClick={() => setCurrentSection('libraries')}>
          Explore all libraries <ArrowRight size={14} />
        </button>
      </section>

      {/* ===== Open-source credit ===== */}
      <section className={`${styles.section} ${styles.narrow}`}>
        <div className={styles.creditHead}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.dot} aria-hidden />
            Open source first
          </h2>
          <p className={styles.sectionNote}>
            Garden never re-hosts a component. Every result links back to the library that made it, keeps its licence
            and credits its author. Go and support them.
          </p>
        </div>
        <ul className={styles.linkList}>
          {topLibraries.slice(0, 3).map((l) => (
            <li key={l.name}>
              <a href={l.homepage} target="_blank" rel="noreferrer noopener">
                <span>{l.name}</span>
                <span className={styles.linkLine} aria-hidden />
                <ArrowUpRight size={15} />
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* ===== Libraries ===== */}
      <section className={`${styles.section} ${styles.narrow}`}>
        <SectionHead title="Garden searches the finest in the industry" />
        <DashedRule label="Most indexed" />
        <a className={styles.featured} href={featured.homepage} target="_blank" rel="noreferrer noopener">
          <DotMark size={26} />
          {featured.name}
        </a>
        <DashedRule label="Indexed libraries" />
        <div className={styles.marquee}>
          <div className={styles.marqueeTrack}>
            {[...names, ...names].map((name, i) => (
              <span key={i} className={styles.marqueeItem} aria-hidden={i >= names.length}>
                {name}
              </span>
            ))}
          </div>
        </div>
        <DashedRule label="Tools & stack" />
        <div className={styles.stack}>
          {STACK.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
        <DashedRule />
        <p className={styles.creditNote}>
          Garden is made possible by every library above
          <a href="https://github.com/Adi-gitX/colour-fun/issues" target="_blank" rel="noreferrer noopener">
            suggest one <ArrowRight size={13} />
          </a>
        </p>
      </section>

      {/* ===== Wallpapers ===== */}
      <section className={styles.section}>
        <div className={styles.trioIcons} aria-hidden>
          <Palette size={20} />
          <span>×</span>
          <Sparkles size={20} />
        </div>
        <SectionHead title="Rare Wallpapers" />
        <div className={styles.trio}>
          {WALLPAPERS.map((w, i) => (
            <button
              key={w.section}
              type="button"
              className={`${styles.trioCard} ${w.tone} ${i === 1 ? styles.trioCenter : ''}`}
              onClick={() => setCurrentSection(w.section)}
              aria-label={`Open ${w.section === 'solid-colors' ? 'solid colours' : w.section === 'gradients' ? 'gradients' : 'images'}`}
            >
              <span className={styles.trioGlyph}>{w.glyph}</span>
            </button>
          ))}
        </div>
        <button type="button" className={styles.more} onClick={() => setCurrentSection('solid-colors')}>
          Open wallpapers <ArrowRight size={14} />
        </button>
      </section>

      {/* ===== Plans ===== */}
      <section className={styles.section}>
        <SectionHead title={<>Just free and open, no subscription</>} />
        <div className={styles.plans}>
          <div className={styles.plan}>
            <span className={styles.planName}>Search</span>
            <span className={styles.planPrice}>$0</span>
            <ul>
              <li>
                <Layers size={15} /> {indexedLibraries.length} libraries at once
              </li>
              <li>
                <SquareTerminal size={15} /> One-line install commands
              </li>
              <li>
                <MessageSquareText size={15} /> Prompts for your coding agent
              </li>
              <li>
                <Code size={15} /> Copy-paste source code
              </li>
              <li>
                <RefreshCw size={15} /> Re-indexed continuously
              </li>
            </ul>
            <button type="button" className={styles.planBtn} onClick={onStart}>
              Start asking
            </button>
          </div>
          <div className={styles.plan}>
            <span className={styles.planName}>Wallpapers</span>
            <span className={styles.planPrice}>$0</span>
            <ul>
              <li>
                <Palette size={15} /> {colors.length} solid colours
              </li>
              <li>
                <Sparkles size={15} /> {gradients.length} gradients
              </li>
              <li>
                <ImageIcon size={15} /> {imageUrls.length} images
              </li>
              <li>
                <Download size={15} /> PNG, JPEG or WebP up to 8K
              </li>
              <li>
                <Code size={15} /> Copy the CSS
              </li>
            </ul>
            <button type="button" className={styles.planBtn} onClick={() => setCurrentSection('solid-colors')}>
              Open wallpapers
            </button>
          </div>
        </div>
      </section>

      {/* ===== Closing call ===== */}
      <section className={`${styles.section} ${styles.closing}`}>
        <span className={styles.pill}>Start here</span>
        <h2 className={styles.sectionTitle}>
          Describe the component
          <br />
          you need
        </h2>
        <button type="button" className={styles.seal} onClick={onStart} aria-label="Ask Garden">
          <svg viewBox="0 0 200 200" className={styles.sealText} aria-hidden>
            <defs>
              <path id="seal-circle" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" />
            </defs>
            <text>
              <textPath href="#seal-circle">GARDEN · COMPONENT FINDER · OPEN SOURCE · ALWAYS CREDITED ·</textPath>
            </text>
          </svg>
          <span className={styles.sealRing} aria-hidden />
          <span className={styles.sealOrb} aria-hidden />
        </button>
      </section>

      <footer className={styles.footer}>Designed and developed by Adithya Kammati</footer>
    </div>
  );
}
