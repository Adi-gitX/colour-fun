import { useEffect, useMemo, useState } from 'react';
import Fuse, { type IFuseOptions } from 'fuse.js';
import { loadIndex } from '../lib/ask';
import type { IndexedComponent } from '../lib/ask';
import { colors as colorDatabase } from '../data/colors';
import type { Section } from '../store/appStore';

export type SearchKind = 'component' | 'color';

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
function buildCorpus(components: IndexedComponent[]): SearchItem[] {
  const items: SearchItem[] = [];

  for (const c of components) {
    items.push({
      id: `component:${c.slug}`,
      kind: 'component',
      title: c.title,
      subtitle: `${c.category} · ${c.library}`,
      section: 'home',
      haystack: `${c.title} ${c.category} ${c.library} ${(c.tags ?? []).join(' ')}`,
      url: c.sourceUrl,
      initials: c.library.slice(0, 2).toUpperCase(),
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

const KIND_ORDER: SearchKind[] = ['component', 'color'];

const NO_COMPONENTS: IndexedComponent[] = [];
let loadedComponents: IndexedComponent[] | null = null;

/** The component index arrives over the network once; colours are searchable immediately. */
function useComponents(): IndexedComponent[] {
  const [components, setComponents] = useState<IndexedComponent[] | null>(loadedComponents);
  useEffect(() => {
    if (loadedComponents) return;
    let live = true;
    loadIndex()
      .then((index) => {
        loadedComponents = index.components;
        if (live) setComponents(index.components);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);
  return components ?? NO_COMPONENTS;
}

export const KIND_LABELS: Record<SearchKind, string> = {
  component: 'Components',
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
  const components = useComponents();
  const corpus = useMemo(() => buildCorpus(components), [components]);
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
