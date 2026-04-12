import { useMemo } from 'react';
import { DiscoverCard, type DiscoverEntry } from '../DiscoverCard';
import { SectionHeader } from './SectionHeader';
import { libraries } from '../../data/libraries';
import { designSystems } from '../../data/designSystems';
import { inspirationSites } from '../../data/inspiration';
import { tools } from '../../data/tools';
import { useAppStore } from '../../store/appStore';
import styles from './DiscoverView.module.css';

type Variant = 'libraries' | 'design-systems' | 'inspiration' | 'tools';

interface Props {
  variant: Variant;
}

const meta: Record<Variant, { eyebrow: string; title: string; description: string }> = {
  libraries: {
    eyebrow: 'Discover',
    title: 'Component Libraries',
    description:
      'The best React, Vue and universal component libraries to ship with — Tailwind, unstyled, CSS-in-JS.',
  },
  'design-systems': {
    eyebrow: 'Discover',
    title: 'Design Systems',
    description:
      'Public design systems from product teams. Read their tokens, patterns and component docs.',
  },
  inspiration: {
    eyebrow: 'Discover',
    title: 'UI Inspiration',
    description:
      'Galleries of real product UI — landing pages, mobile flows, typography, brutalism.',
  },
  tools: {
    eyebrow: 'Discover',
    title: 'Tools',
    description: 'Icons, fonts, color, animation, AI — the toolbox around your component library.',
  },
};

export const DiscoverView = ({ variant }: Props) => {
  const { searchQuery } = useAppStore();

  const entries: DiscoverEntry[] = useMemo(() => {
    let list: DiscoverEntry[];
    switch (variant) {
      case 'libraries':
        list = libraries.map((l) => ({
          id: l.id,
          name: l.name,
          description: l.description,
          url: l.url,
          initials: l.initials,
          accent: l.accent,
          tags: [l.framework[0], l.styling, l.pricing],
          highlight: l.highlight,
        }));
        break;
      case 'design-systems':
        list = designSystems.map((d) => ({
          id: d.id,
          name: d.name,
          description: d.description,
          url: d.url,
          initials: d.initials,
          accent: d.accent,
          tags: [d.org],
          subline: d.org,
          highlight: d.highlight,
        }));
        break;
      case 'inspiration':
        list = inspirationSites.map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          url: s.url,
          initials: s.initials,
          accent: s.accent,
          tags: [s.category, s.pricing],
        }));
        break;
      case 'tools':
        list = tools.map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description,
          url: t.url,
          initials: t.initials,
          accent: t.accent,
          tags: [t.category, t.pricing],
        }));
        break;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [variant, searchQuery]);

  const m = meta[variant];

  return (
    <div className={styles.page}>
      <SectionHeader
        eyebrow={m.eyebrow}
        title={m.title}
        description={m.description}
        count={entries.length}
      />
      {entries.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>○</div>
          <h3>Nothing matches</h3>
          <p>Try a different search term.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {entries.map((e, i) => (
            <DiscoverCard key={e.id} entry={e} index={i} />
          ))}
        </div>
      )}
    </div>
  );
};
