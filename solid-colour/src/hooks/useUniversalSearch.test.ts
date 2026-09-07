import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

vi.mock('../lib/ask', () => ({
  loadIndex: async () => ({
    generatedAt: '',
    components: [
      { slug: 'shadcn-button', title: 'Button', category: 'button', library: 'shadcn/ui', tags: ['form'], sourceUrl: 'https://ui.shadcn.com/docs/components/button' },
      { slug: 'magicui-shiny-button', title: 'Shiny Button', category: 'button', library: 'Magic UI', tags: ['animated'], sourceUrl: 'https://magicui.design' },
      { slug: 'aceternity-aurora', title: 'Aurora Background', category: 'background', library: 'Aceternity UI', tags: ['hero'], sourceUrl: 'https://ui.aceternity.com' },
    ],
  }),
}));

import { useUniversalSearch, KIND_LABELS } from './useUniversalSearch';

const componentsLoaded = async (result: { current: { groups: Array<{ kind: string }> } }) =>
  waitFor(() => expect(result.current.groups.some((g) => g.kind === 'component')).toBe(true));

describe('useUniversalSearch', () => {
  it('returns grouped results for an empty query (idle/browse mode)', async () => {
    const { result } = renderHook(() => useUniversalSearch(''));
    await componentsLoaded(result);
    expect(result.current.total).toBeGreaterThan(0);
    // Every group should have a label that matches our public label map.
    for (const g of result.current.groups) {
      expect(KIND_LABELS[g.kind]).toBe(g.label);
      expect(g.items.length).toBeGreaterThan(0);
    }
  });

  it('respects limitPerCategory', () => {
    const { result } = renderHook(() =>
      useUniversalSearch('', { limitPerCategory: 2, limit: 100 })
    );
    for (const g of result.current.groups) {
      expect(g.items.length).toBeLessThanOrEqual(2);
    }
  });

  it('respects total limit', () => {
    const { result } = renderHook(() => useUniversalSearch('', { limitPerCategory: 50, limit: 5 }));
    expect(result.current.total).toBeLessThanOrEqual(5);
  });

  it('finds components by their library name', async () => {
    const { result } = renderHook(() => useUniversalSearch('shadcn'));
    await componentsLoaded(result);
    const all = result.current.groups.flatMap((g) => g.items);
    const hit = all.find((i) => i.subtitle.toLowerCase().includes('shadcn'));
    expect(hit).toBeDefined();
    expect(hit?.kind).toBe('component');
  });

  it('matches across haystack fields (category / library)', async () => {
    const { result } = renderHook(() => useUniversalSearch('button'));
    await componentsLoaded(result);
    const all = result.current.groups.flatMap((g) => g.items);
    expect(all.length).toBeGreaterThan(0);
    // Components are indexed by title, category, library and tags.
    const components = all.filter((i) => i.kind === 'component');
    expect(components.length).toBeGreaterThan(0);
  });

  it('returns empty groups for a nonsense query', () => {
    const { result } = renderHook(() => useUniversalSearch('zzzzzzzzzzz_no_match_xyz'));
    expect(result.current.total).toBe(0);
    expect(result.current.groups).toEqual([]);
  });
});
