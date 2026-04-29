import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { ComponentCard } from '../ComponentCard';
import { DiscoverCard, type DiscoverEntry } from '../DiscoverCard';
import { SectionHeader } from './SectionHeader';
import { components } from '../../data/components';
import { libraries } from '../../data/libraries';
import { designSystems } from '../../data/designSystems';
import { inspirationSites } from '../../data/inspiration';
import { tools } from '../../data/tools';
import { useAppStore } from '../../store/appStore';
import styles from './LibraryView.module.css';

export const LibraryView = () => {
  const { bookmarks, setCurrentSection } = useAppStore();

  const bookmarkedComponents = useMemo(
    () => components.filter((c) => bookmarks.includes(c.id)),
    [bookmarks]
  );

  const bookmarkedDiscover: DiscoverEntry[] = useMemo(() => {
    const out: DiscoverEntry[] = [];
    libraries.forEach((l) => {
      if (bookmarks.includes(l.id))
        out.push({
          id: l.id,
          name: l.name,
          description: l.description,
          url: l.url,
          initials: l.initials,
          accent: l.accent,
          tags: [l.framework[0], l.styling, l.pricing],
          highlight: l.highlight,
        });
    });
    designSystems.forEach((d) => {
      if (bookmarks.includes(d.id))
        out.push({
          id: d.id,
          name: d.name,
          description: d.description,
          url: d.url,
          initials: d.initials,
          accent: d.accent,
          tags: [d.org],
        });
    });
    inspirationSites.forEach((s) => {
      if (bookmarks.includes(s.id))
        out.push({
          id: s.id,
          name: s.name,
          description: s.description,
          url: s.url,
          initials: s.initials,
          accent: s.accent,
          tags: [s.category, s.pricing],
        });
    });
    tools.forEach((t) => {
      if (bookmarks.includes(t.id))
        out.push({
          id: t.id,
          name: t.name,
          description: t.description,
          url: t.url,
          initials: t.initials,
          accent: t.accent,
          tags: [t.category, t.pricing],
        });
    });
    return out;
  }, [bookmarks]);

  const isEmpty =
    bookmarkedComponents.length === 0 && bookmarkedDiscover.length === 0;

  if (isEmpty) {
    return (
      <div className={styles.page}>
        <SectionHeader
          eyebrow="Library"
          title="Your bookmarks"
          description="Components, libraries and tools you've saved."
        />
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>○</div>
          <h3>No bookmarks yet</h3>
          <p>
            Tap the bookmark icon on any card to save it here for quick access.
          </p>
          <button
            className={styles.cta}
            onClick={() => setCurrentSection('home')}
          >
            Discover something
            <ArrowRight size={13} strokeWidth={2} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <SectionHeader
        eyebrow="Library"
        title="Your bookmarks"
        description="Components, libraries and tools you've saved."
        count={bookmarks.length}
      />

      {bookmarkedComponents.length > 0 && (
        <section className={styles.section}>
          <SectionHeader
            title="Components"
            count={bookmarkedComponents.length}
          />
          <div className={styles.cardGrid}>
            {bookmarkedComponents.map((c, i) => (
              <ComponentCard key={c.id} entry={c} index={i} />
            ))}
          </div>
        </section>
      )}

      {bookmarkedDiscover.length > 0 && (
        <section className={styles.section}>
          <SectionHeader
            title="Libraries, systems & tools"
            count={bookmarkedDiscover.length}
          />
          <div className={styles.discoverGrid}>
            {bookmarkedDiscover.map((e, i) => (
              <DiscoverCard key={e.id} entry={e} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
