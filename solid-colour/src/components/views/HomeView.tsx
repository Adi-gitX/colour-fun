import { ArrowRight, Sparkles } from 'lucide-react';
import { ComponentCard } from '../ComponentCard';
import { TrendingCard } from '../TrendingCard';
import { SectionHeader } from './SectionHeader';
import { featured, trending } from '../../data/components';
import { libraries } from '../../data/libraries';
import { DiscoverCard } from '../DiscoverCard';
import { useAppStore } from '../../store/appStore';
import styles from './HomeView.module.css';

export const HomeView = () => {
  const { setCurrentSection } = useAppStore();
  const popularLibs = libraries.slice(0, 6);
  const trendingTop = trending(8);

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroPanel}>
          <div className={styles.heroBadge}>
            <Sparkles size={11} strokeWidth={2} />
            Featured this week
          </div>
          <h1 className={styles.heroTitle}>
            The fastest way to find a component, a system, or a spark.
          </h1>
          <p className={styles.heroLede}>
            Atlas curates the best component libraries, design systems, UI inspiration, palettes and
            tools in one place. Bookmark what you like and ship faster.
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
        </div>
      </section>

      {/* Featured grid */}
      <section className={styles.section}>
        <SectionHeader
          eyebrow="Components"
          title="Featured this week"
          description="Hand-picked component recipes — copy, fork, ship."
          trailing={
            <button className={styles.viewAll} onClick={() => setCurrentSection('components')}>
              View all
              <ArrowRight size={12} strokeWidth={2} />
            </button>
          }
        />
        <div className={styles.cardGrid}>
          {featured.map((c, i) => (
            <ComponentCard key={c.id} entry={c} index={i} />
          ))}
        </div>
      </section>

      {/* Popular libraries */}
      <section className={styles.section}>
        <SectionHeader
          eyebrow="Libraries"
          title="Popular component libraries"
          description="The component libraries everyone’s shipping with."
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

      {/* Trending — top 8 by GitHub stars */}
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
    </div>
  );
};
