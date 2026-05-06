import { ArrowRight, Sparkles } from 'lucide-react';
import { useMemo } from 'react';
import { ComponentCard } from '../ComponentCard';
import { TrendingCard } from '../TrendingCard';
import { PlaylistCard } from '../PlaylistCard';
import { SectionHeader } from './SectionHeader';
import { components, featured, trending } from '../../data/components';
import { libraries } from '../../data/libraries';
import { designSystems } from '../../data/designSystems';
import { tools } from '../../data/tools';
import { fonts } from '../../data/fonts';
import { hooks } from '../../data/hooks';
import { inspirationSites } from '../../data/inspiration';
import { playlists, resolvePlaylist } from '../../data/playlists';
import { DiscoverCard } from '../DiscoverCard';
import { useAppStore } from '../../store/appStore';
import styles from './HomeView.module.css';

export const HomeView = () => {
  const { setCurrentSection } = useAppStore();

  const trendingTop = trending(8);
  const popularLibs = libraries.slice(0, 6);
  const featuredPlaylists = useMemo(() => playlists.slice(0, 4).map(resolvePlaylist), []);
  const featuredFour = featured.slice(0, 4);

  /* Hero stats — derived from data so they're always honest. */
  const heroStats = [
    { label: 'Components', value: components.length },
    { label: 'Libraries', value: libraries.length },
    { label: 'Design systems', value: designSystems.length },
    { label: 'Tools', value: tools.length },
    { label: 'Fonts', value: fonts.length },
    { label: 'Hooks', value: hooks.length },
    { label: 'Inspiration sites', value: inspirationSites.length },
  ];

  return (
    <div className={styles.page}>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroPanel}>
          <div className={styles.heroBadge}>
            <Sparkles size={11} strokeWidth={2} />
            Atlas v1.0 · {components.length} components indexed
          </div>
          <h1 className={styles.heroTitle}>
            Every design resource a developer or designer ever needs.
          </h1>
          <p className={styles.heroLede}>
            Component libraries, design systems, UI inspiration, palettes, gradients, fonts, hooks
            and tools — curated, searchable, fast. <kbd className={styles.kbd}>⌘K</kbd> from
            anywhere. No signup. Open the link, ship faster.
          </p>
          <div className={styles.heroActions}>
            <button className={styles.btnPrimary} onClick={() => setCurrentSection('components')}>
              Browse components
              <ArrowRight size={13} strokeWidth={2} />
            </button>
            <button className={styles.btnSecondary} onClick={() => setCurrentSection('libraries')}>
              Explore libraries
            </button>
          </div>
          <ul className={styles.heroStats}>
            {heroStats.map((stat) => (
              <li key={stat.label} className={styles.stat}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Trending — top 8 by GitHub stars ───────────────── */}
      <section className={styles.section}>
        <SectionHeader
          eyebrow="Trending"
          title="Top 8 by GitHub stars"
          description="The most-starred OSS components, kits and primitives indexed in Atlas right now."
          trailing={
            <button className={styles.viewAll} onClick={() => setCurrentSection('components')}>
              View all
              <ArrowRight size={12} strokeWidth={2} />
            </button>
          }
        />
        <div className={styles.trendingGrid}>
          {trendingTop.map((c, i) => (
            <TrendingCard key={c.id} entry={c} index={i} />
          ))}
        </div>
      </section>

      {/* ── Curated playlists ──────────────────────────────── */}
      <section className={styles.section}>
        <SectionHeader
          eyebrow="Editorial"
          title="Curated playlists"
          description="Opinionated picks stitched across categories. The one human layer no algorithm reproduces."
        />
        <div className={styles.playlistGrid}>
          {featuredPlaylists.map(({ playlist, items }, i) => (
            <PlaylistCard key={playlist.id} playlist={playlist} items={items} index={i} />
          ))}
        </div>
      </section>

      {/* ── Editor's picks (featured) ─────────────────────── */}
      <section className={styles.section}>
        <SectionHeader
          eyebrow="Editor's picks"
          title="Featured this week"
          description="Hand-picked OSS that consistently hits the bar — hover any card for details."
          trailing={
            <button className={styles.viewAll} onClick={() => setCurrentSection('components')}>
              View all
              <ArrowRight size={12} strokeWidth={2} />
            </button>
          }
        />
        <div className={styles.cardGrid}>
          {featuredFour.map((c, i) => (
            <ComponentCard key={c.id} entry={c} index={i} />
          ))}
        </div>
      </section>

      {/* ── Popular libraries ──────────────────────────────── */}
      <section className={styles.section}>
        <SectionHeader
          eyebrow="Libraries"
          title="Popular component libraries"
          description="The component libraries everyone's shipping with."
          trailing={
            <button className={styles.viewAll} onClick={() => setCurrentSection('libraries')}>
              View all
              <ArrowRight size={12} strokeWidth={2} />
            </button>
          }
        />
        <div className={styles.discoverGrid}>
          {popularLibs.map((lib, i) => (
            <DiscoverCard
              key={lib.id}
              entry={{
                id: lib.id,
                name: lib.name,
                description: lib.description,
                url: lib.url,
                initials: lib.initials,
                accent: lib.accent,
                tags: [lib.framework[0], lib.styling, lib.pricing],
                highlight: lib.highlight,
              }}
              index={i}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
