import { useMemo } from 'react';
import Fuse, { type IFuseOptions } from 'fuse.js';
import { components } from '../data/components';
import { libraries } from '../data/libraries';
import { designSystems } from '../data/designSystems';
import { inspirationSites } from '../data/inspiration';
import { tools } from '../data/tools';
import { colors as colorDatabase } from '../data/colors';
import type { Section } from '../store/appStore';

export type SearchKind =
  | 'component'
  | 'library'
  | 'design-system'
  | 'inspiration'
  | 'tool'
  | 'color';

export interface SearchItem {
  id: string;
  kind: SearchKind;
  title: string;
  subtitle: string;
  /** Section to navigate to when the item is selected. */
  section: Section;
  /** Free-form text the index will fuzzy-match against. */
  haystack: string;
  /** Optional external URL — opens in a new tab when present. */
  url?: string;
  /** Color hex — only set on `kind: 'color'`. */
  hex?: string;
  /** Two-letter initials for a square avatar in the result row. */
  initials?: string;
  /** Background color for the avatar. */
  accent?: string;
}

/**
 * Flatten every data source into a single, searchable, normalized list.
 * This is what the command palette ranks against.
 */
function buildCorpus(): SearchItem[] {
  const items: SearchItem[] = [];

  for (const c of components) {
    items.push({
      id: `component:${c.id}`,
      kind: 'component',
      title: c.name,
      subtitle: `${c.category} · by ${c.author}`,
      section: 'components',
      haystack: `${c.name} ${c.category} ${c.author}`,
      initials: c.authorInitials,
    });
  }

  for (const lib of libraries) {
    items.push({
      id: `library:${lib.id}`,
      kind: 'library',
      title: lib.name,
      subtitle: lib.description,
      section: 'libraries',
      haystack: `${lib.name} ${lib.description} ${lib.framework.join(' ')} ${lib.styling} ${lib.pricing}`,
      url: lib.url,
      initials: lib.initials,
      accent: lib.accent,
    });
  }

  for (const ds of designSystems) {
    items.push({
      id: `design-system:${ds.id}`,
      kind: 'design-system',
      title: ds.name,
      subtitle: `${ds.org} · ${ds.description}`,
      section: 'design-systems',
      haystack: `${ds.name} ${ds.org} ${ds.description}`,
      url: ds.url,
      initials: ds.initials,
      accent: ds.accent,
    });
  }

  for (const site of inspirationSites) {
    items.push({
      id: `inspiration:${site.id}`,
      kind: 'inspiration',
      title: site.name,
      subtitle: `${site.category} · ${site.description}`,
      section: 'inspiration',
      haystack: `${site.name} ${site.category} ${site.description}`,
      url: site.url,
      initials: site.initials,
      accent: site.accent,
    });
  }

  for (const t of tools) {
    items.push({
      id: `tool:${t.id}`,
      kind: 'tool',
      title: t.name,
      subtitle: `${t.category} · ${t.description}`,
      section: 'tools',
      haystack: `${t.name} ${t.category} ${t.description}`,
      url: t.url,
      initials: t.initials,
      accent: t.accent,
    });
  }

  for (const color of colorDatabase) {
    items.push({
      id: `color:${color.id}`,
      kind: 'color',
      title: color.name,
      subtitle: `${color.hex.toUpperCase()} · ${color.category}`,
      section: 'solid-colors',
      haystack: `${color.name} ${color.hex} ${color.category}`,
      hex: color.hex,
    });
  }

  return items;
}

const FUSE_OPTIONS: IFuseOptions<SearchItem> = {
  keys: [
    { name: 'title', weight: 3 },
    { name: 'haystack', weight: 1 },
  ],
  threshold: 0.4,
  ignoreLocation: true,
  minMatchCharLength: 1,
  shouldSort: true,
};

const KIND_ORDER: SearchKind[] = [
  'library',
  'design-system',
  'component',
  'inspiration',
  'tool',
  'color',
];

export const KIND_LABELS: Record<SearchKind, string> = {
  library: 'Component libraries',
  'design-system': 'Design systems',
  component: 'Components',
  inspiration: 'UI inspiration',
  tool: 'Tools',
  color: 'Colors',
};

export interface SearchGroup {
  kind: SearchKind;
  label: string;
  items: SearchItem[];
}

/**
 * Universal search across every indexed data source.
 *
 * - Empty query → returns the first N items per category, in a stable order.
 *   Used to power the palette's idle "browse" state.
 * - Non-empty query → fuzzy-ranked across the whole corpus.
 *
 * The Fuse instance is built once via `useMemo`, so re-renders are cheap.
 */
export function useUniversalSearch(
  query: string,
  options?: { limitPerCategory?: number; limit?: number }
): { groups: SearchGroup[]; total: number } {
  const corpus = useMemo(() => buildCorpus(), []);
  const fuse = useMemo(() => new Fuse(corpus, FUSE_OPTIONS), [corpus]);

  return useMemo(() => {
    const trimmed = query.trim();
    const perCat = options?.limitPerCategory ?? 6;
    const total = options?.limit ?? 40;

    let pool: SearchItem[];
    if (trimmed === '') {
      pool = corpus;
    } else {
      pool = fuse.search(trimmed, { limit: total * 3 }).map((r) => r.item);
    }

    const byKind: Map<SearchKind, SearchItem[]> = new Map();
    for (const item of pool) {
      const list = byKind.get(item.kind) ?? [];
      if (list.length < perCat) list.push(item);
      byKind.set(item.kind, list);
    }

    const groups: SearchGroup[] = [];
    let count = 0;
    for (const kind of KIND_ORDER) {
      const items = byKind.get(kind);
      if (!items || items.length === 0) continue;
      const trimmedItems = items.slice(0, Math.max(0, total - count));
      if (trimmedItems.length === 0) continue;
      groups.push({ kind, label: KIND_LABELS[kind], items: trimmedItems });
      count += trimmedItems.length;
      if (count >= total) break;
    }

    return { groups, total: count };
  }, [corpus, fuse, query, options?.limitPerCategory, options?.limit]);
}
