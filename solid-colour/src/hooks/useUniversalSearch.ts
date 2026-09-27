import { useMemo } from 'react';
import Fuse, { type IFuseOptions } from 'fuse.js';
import sites from '../data/sites.json';
import type { Site } from '../lib/find/types';
import { colors as colorDatabase } from '../data/colors';
import type { Section } from '../store/appStore';

export type SearchKind = 'site' | 'color';

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
const SITE_KIND: Record<Site['type'], string> = {
  components: 'Component library',
  library: 'Animation & UI library',
  inspiration: 'Inspiration',
};

function buildCorpus(): SearchItem[] {
  const items: SearchItem[] = [];

  for (const site of sites as Site[]) {
    const host = site.url.replace(/^https?:\/\/(www\.)?/, '');
    items.push({
      id: `site:${site.id}`,
      kind: 'site',
      title: site.name,
      subtitle: `${SITE_KIND[site.type]} · ${host}`,
      section: 'libraries',
      haystack: `${site.name} ${host} ${SITE_KIND[site.type]}`,
      url: site.url,
      initials: site.name.slice(0, 2).toUpperCase(),
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

const KIND_ORDER: SearchKind[] = ['site', 'color'];
const CORPUS = buildCorpus();
const FUSE = new Fuse(CORPUS, FUSE_OPTIONS);

export const KIND_LABELS: Record<SearchKind, string> = {
  site: 'Sites',
  color: 'Colors',
};

export interface SearchGroup {
  kind: SearchKind;
  label: string;
  items: SearchItem[];
}

/**
 * Universal search across Garden's sites and the colour library.
 *
 * - Empty query → returns the first N items per category, in a stable order.
 *   Used to power the palette's idle "browse" state.
 * - Non-empty query → fuzzy-ranked across the whole corpus.
 *
 * The corpus and its Fuse instance are built once at module load.
 */
export function useUniversalSearch(
  query: string,
  options?: { limitPerCategory?: number; limit?: number }
): { groups: SearchGroup[]; total: number } {
  return useMemo(() => {
    const trimmed = query.trim();
    const perCat = options?.limitPerCategory ?? 6;
    const total = options?.limit ?? 40;

    let pool: SearchItem[];
    if (trimmed === '') {
      pool = CORPUS;
    } else {
      pool = FUSE.search(trimmed, { limit: total * 3 }).map((r) => r.item);
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
  }, [query, options?.limitPerCategory, options?.limit]);
}
