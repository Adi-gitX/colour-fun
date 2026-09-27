import {
  ArrowRight,
  ArrowUpRight,
  Download,
  Globe,
  Image as ImageIcon,
  Layers,
  MessageSquareQuote,
  Palette,
  Plug,
  ScanEye,
  Sparkles,
  Code,
} from 'lucide-react';
import sitesJson from '../../data/sites.json';
import type { Site } from '../../lib/find/types';
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

const sites = sitesJson as Site[];
const HERO_ASK = 'footer designs';

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

export function LandingHero({ onStart, onAsk }: { onStart: () => void; onAsk: (text: string) => void }) {
  return (
    <section className={styles.hero}>
      <p className={styles.serif}>Garden, for people who build with AI</p>
      <h1 className={styles.display}>
        <span className="visually-hidden">Stunning, not slop.</span>
        <SlotLine text="STUNNING," />
        <SlotLine text="NOT SLOP." delay={260} />
      </h1>
      <p className={styles.serif}>Find the design worth using, checked live</p>

      <div className={styles.heroActions}>
        <button type="button" className={styles.command} onClick={() => onAsk(HERO_ASK)} aria-label={`Ask Garden for ${HERO_ASK}`}>
          <span className={styles.commandText}>
            garden ask <span className={styles.commandMuted}>&quot;{HERO_ASK}&quot;</span>
          </span>
          <ArrowRight size={14} />
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
  { title: 'An interactive 3D globe', image: '3d-globe', area: styles.aGlobe },
  { title: 'A tilted screenshot marquee', image: '3d-marquee', area: styles.aMarquee },
  { title: 'Testimonials that feel human', image: 'animated-testimonials', area: styles.aTestimonials },
  { title: 'A card carousel like Apple’s', image: 'apple-cards-carousel', area: styles.aApple },
  { title: 'Animated background beams', image: 'background-beams', area: styles.aBeams },
  { title: 'Soft aurora backgrounds', image: 'aurora-background', area: styles.aAurora },
  { title: 'Cards that tilt in 3D on hover', image: '3d-card', area: styles.aCard },
];

const BUILT_FOR = ['Claude Code', 'Cursor', 'Windsurf', 'v0'];

const SLOP = [
  { n: '01', title: 'Every site looks the same', body: 'The same purple gradient, the same centred hero, the same three-card bento. Generated, not designed.' },
  { n: '02', title: 'Nobody chose the parts', body: 'Components land in the codebase because a model reached for them, not because anyone compared them to the best.' },
  { n: '03', title: 'Taste is buried', body: 'The libraries and galleries that set the bar are scattered across a hundred sites, lists and threads.' },
];

/** A real answer from the live pipeline (28 Sep 2026), shown as the demo. */
const DEMO = {
  query: 'footer designs',
  picks: [
    { name: 'Footer Design', path: 'footer.design', why: 'A gallery of real-world footers, filtered by style, typography and grid.' },
    { name: 'Aceternity UI', path: 'ui.aceternity.com/categories/footer', why: 'Animated footers in React, Tailwind and Motion. Free, copy-paste.' },
    { name: 'Flowbite', path: 'flowbite.com/blocks/marketing/footer', why: 'Clean Tailwind footer blocks: sitemaps, newsletters, legal bars.' },
    { name: '21st.dev', path: '21st.dev/community/components/s/footer', why: 'Community footers for shadcn/ui, each with a live preview.' },
  ],
};

const STEPS = [
  { n: '01', title: 'Search', body: 'Live web search for reviews, roundups and threads, plus a search inside every site on the list.' },
  { n: '02', title: 'Judge', body: `A model weighs ${'{count}'} hand-picked sites against that evidence. Every pick needs a reason and a place to look.` },
  { n: '03', title: 'Verify', body: 'Each pick is opened live and its own links are followed to the exact section. Dead links never reach you.' },
];

const ROADMAP = [
  { when: 'Now', title: 'The right sites', body: 'Ask for any piece of a site and get the few places worth your time, checked live.' },
  { when: 'Next', title: 'The exact component', body: 'Go one level deeper: the specific block on that site, with its install command.' },
  { when: 'Then', title: 'Garden as an MCP server', body: 'Your editor asks Garden before it writes UI: Claude Code, Cursor and Windsurf pull taste in directly.' },
  { when: 'Later', title: 'A taste check', body: 'Point Garden at your site and see where it falls short of the best in its category.' },
];

const WALLPAPERS: Array<{ section: Section; glyph: string; label: string; tone: string }> = [
  { section: 'gradients', glyph: 'Aa', label: 'gradients', tone: styles.toneGradient },
  { section: 'backgrounds', glyph: 'Aa', label: 'images', tone: styles.toneImage },
  { section: 'solid-colors', glyph: 'Aa', label: 'solid colours', tone: styles.toneSolid },
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
  const names = sites.map((s) => s.name);

  return (
    <div className={styles.sections}>
      {/* ===== The problem ===== */}
      <section className={styles.section}>
        <span className={styles.pill}>The problem</span>
        <h2 className={`${styles.sectionTitle} ${styles.statement}`}>
          AI made building a site free.
          <br />
          <span className={styles.muted}>It also made every site look the same.</span>
        </h2>
        <div className={styles.problems}>
          {SLOP.map((p) => (
            <div key={p.n} className={styles.problem}>
              <span className={styles.problemN}>{p.n}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== The fix: a real answer ===== */}
      <section className={styles.section}>
        <span className={styles.pill}>The fix</span>
        <SectionHead title="Garden sends you to the source">
          Ask for any piece of a site. Get the few places on the web that do it best, with the reason and the exact page.
        </SectionHead>
        <div className={styles.demo}>
          <div className={styles.demoBar}>
            <span className={styles.demoDots} aria-hidden>
              <i />
              <i />
              <i />
            </span>
            <span className={styles.demoQuery}>garden ask &quot;{DEMO.query}&quot;</span>
            <span className={styles.demoMeta}>23 sources · 4 sites opened live</span>
          </div>
          <ol className={styles.demoList}>
            {DEMO.picks.map((p, i) => (
              <li key={p.name}>
                <span className={styles.demoRank}>{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <strong>{p.name}</strong>
                  <span className={styles.demoPath}>{p.path}</span>
                  <p>{p.why}</p>
                </div>
                <ArrowUpRight size={16} className={styles.demoArrow} aria-hidden />
              </li>
            ))}
          </ol>
        </div>
        <button type="button" className={styles.more} onClick={() => onAsk(DEMO.query)}>
          Run it live <ArrowRight size={14} />
        </button>
      </section>

      {/* ===== How it works ===== */}
      <section className={styles.section}>
        <span className={styles.pill}>How it works</span>
        <SectionHead title="Search, judge, verify" />
        <div className={styles.steps}>
          {STEPS.map((st) => (
            <div key={st.n} className={styles.step}>
              <span className={styles.stepN}>{st.n}</span>
              <h3>{st.title}</h3>
              <p>{st.body.replace('{count}', String(sites.length))}</p>
            </div>
          ))}
        </div>
        <dl className={styles.numbers}>
          <div>
            <dt>Hand-picked sites</dt>
            <dd>{sites.length}</dd>
          </div>
          <div>
            <dt>Picks on the exact section</dt>
            <dd>73%</dd>
          </div>
          <div>
            <dt>Median answer</dt>
            <dd>12s</dd>
          </div>
          <div>
            <dt>Dead links shown</dt>
            <dd>0</dd>
          </div>
        </dl>
        <p className={styles.numbersNote}>Measured on eight real requests against the live web, 28 Sep 2026.</p>
      </section>

      {/* ===== Showcase bento ===== */}
      <section className={styles.section}>
        <SectionHead title="Ask for anything worth building">
          Tap one to run it live: Garden searches the web, weighs real reviews against {sites.length} hand-picked
          sites, and opens every link before you see it.
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
          See all {sites.length} sites <ArrowRight size={14} />
        </button>
      </section>

      {/* ===== The list ===== */}
      <section className={`${styles.section} ${styles.narrow}`}>
        <span className={styles.pill}>Why now</span>
        <SectionHead title="Code is solved. Taste is the bottleneck.">
          Everyone ships with an AI editor now. What they reach for decides whether the result looks designed or generated.
        </SectionHead>
        <DashedRule label="Always considered" />
        <button type="button" className={styles.featured} onClick={() => setCurrentSection('libraries')}>
          <DotMark size={26} />
          {sites.length} hand-picked sites
        </button>
        <DashedRule label="In the list" />
        <div className={styles.marquee}>
          <div className={styles.marqueeTrack}>
            {[...names, ...names].map((name, i) => (
              <span key={i} className={styles.marqueeItem} aria-hidden={i >= names.length}>
                {name}
              </span>
            ))}
          </div>
        </div>
        <DashedRule label="Built for" />
        <div className={styles.stack}>
          {BUILT_FOR.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
        <DashedRule />
        <p className={styles.creditNote}>
          Know a site with real taste?
          <a href="https://github.com/Adi-gitX/colour-fun/issues" target="_blank" rel="noreferrer noopener">
            suggest it <ArrowRight size={13} />
          </a>
        </p>
      </section>

      {/* ===== Roadmap ===== */}
      <section className={`${styles.section} ${styles.narrow}`}>
        <span className={styles.pill}>Roadmap</span>
        <SectionHead title="From the right site to the right pixel" />
        <ol className={styles.roadmap}>
          {ROADMAP.map((r, i) => (
            <li key={r.when} className={i === 0 ? styles.roadNow : undefined}>
              <span className={styles.roadWhen}>{r.when}</span>
              <div>
                <h3>{r.title}</h3>
                <p>{r.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ===== Wallpapers ===== */}
      <section className={styles.section}>
        <div className={styles.trioIcons} aria-hidden>
          <Palette size={20} />
          <span>×</span>
          <Sparkles size={20} />
        </div>
        <SectionHead title="Also in the Garden: wallpapers">
          Images, gradients and flat colours, exported at up to 8K.
        </SectionHead>
        <div className={styles.trio}>
          {WALLPAPERS.map((w, i) => (
            <button
              key={w.section}
              type="button"
              className={`${styles.trioCard} ${w.tone} ${i === 1 ? styles.trioCenter : ''}`}
              onClick={() => setCurrentSection(w.section)}
              aria-label={`Open ${w.label}`}
            >
              <span className={styles.trioGlyph}>{w.glyph}</span>
            </button>
          ))}
        </div>
        <button type="button" className={styles.more} onClick={() => setCurrentSection('backgrounds')}>
          Open wallpapers <ArrowRight size={14} />
        </button>
      </section>

      {/* ===== Plans ===== */}
      <section className={styles.section}>
        <span className={styles.pill}>Pricing</span>
        <SectionHead title="Free while it grows, no subscription" />
        <div className={styles.plans}>
          <div className={styles.plan}>
            <span className={styles.planName}>Ask</span>
            <span className={styles.planPrice}>$0</span>
            <ul>
              <li>
                <Globe size={15} /> Live web search, every time
              </li>
              <li>
                <MessageSquareQuote size={15} /> Weighed against real reviews
              </li>
              <li>
                <Layers size={15} /> {sites.length} hand-picked sites first
              </li>
              <li>
                <ScanEye size={15} /> Every link opened before you see it
              </li>
              <li>
                <Plug size={15} /> MCP server for your editor, soon
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
                <ImageIcon size={15} /> {imageUrls.length} images
              </li>
              <li>
                <Sparkles size={15} /> {gradients.length} gradients
              </li>
              <li>
                <Palette size={15} /> {colors.length} solid colours
              </li>
              <li>
                <Download size={15} /> PNG, JPEG or WebP up to 8K
              </li>
              <li>
                <Code size={15} /> Copy the CSS
              </li>
            </ul>
            <button type="button" className={styles.planBtn} onClick={() => setCurrentSection('backgrounds')}>
              Open wallpapers
            </button>
          </div>
        </div>
      </section>

      {/* ===== Closing call ===== */}
      <section className={`${styles.section} ${styles.closing}`}>
        <span className={styles.pill}>Start here</span>
        <h2 className={styles.sectionTitle}>
          Make your site
          <br />
          worth looking at
        </h2>
        <button type="button" className={styles.seal} onClick={onStart} aria-label="Ask Garden">
          <svg viewBox="0 0 200 200" className={styles.sealText} aria-hidden>
            <defs>
              <path id="seal-circle" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" />
            </defs>
            <text>
              <textPath href="#seal-circle">GARDEN · NO AI SLOP · EVER · MADE WITH TASTE ·</textPath>
            </text>
          </svg>
          <span className={styles.sealRing} aria-hidden />
          <span className={styles.sealOrb} aria-hidden />
        </button>
        <button type="button" className={styles.quickStart} onClick={onStart}>
          Ask Garden
        </button>
      </section>

      <footer className={styles.footer}>Designed and developed by Adithya Kammati</footer>
    </div>
  );
}
