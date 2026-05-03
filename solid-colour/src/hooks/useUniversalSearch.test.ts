import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useUniversalSearch, KIND_LABELS } from './useUniversalSearch';

describe('useUniversalSearch', () => {
  it('returns grouped results for an empty query (idle/browse mode)', () => {
    const { result } = renderHook(() => useUniversalSearch(''));
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

  it('finds shadcn by name', () => {
    const { result } = renderHook(() => useUniversalSearch('shadcn'));
    const all = result.current.groups.flatMap((g) => g.items);
    const hit = all.find((i) => i.title.toLowerCase().includes('shadcn'));
    expect(hit).toBeDefined();
    expect(hit?.kind).toBe('library');
  });

  it('matches across haystack fields (description / category)', () => {
    const { result } = renderHook(() => useUniversalSearch('icons'));
    const all = result.current.groups.flatMap((g) => g.items);
    expect(all.length).toBeGreaterThan(0);
    // At least one tool result should be in the icons category.
    const tools = all.filter((i) => i.kind === 'tool');
    expect(tools.length).toBeGreaterThan(0);
  });

  it('returns empty groups for a nonsense query', () => {
    const { result } = renderHook(() => useUniversalSearch('zzzzzzzzzzz_no_match_xyz'));
    expect(result.current.total).toBe(0);
    expect(result.current.groups).toEqual([]);
  });
});
