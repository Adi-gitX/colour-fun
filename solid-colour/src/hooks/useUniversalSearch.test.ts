import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useUniversalSearch, KIND_LABELS } from './useUniversalSearch';

describe('useUniversalSearch', () => {
  it('returns grouped results for an empty query (idle/browse mode)', () => {
    const { result } = renderHook(() => useUniversalSearch(''));
    expect(result.current.total).toBeGreaterThan(0);
    for (const g of result.current.groups) {
      expect(KIND_LABELS[g.kind]).toBe(g.label);
      expect(g.items.length).toBeGreaterThan(0);
    }
  });

  it('respects limitPerCategory', () => {
    const { result } = renderHook(() => useUniversalSearch('', { limitPerCategory: 2, limit: 100 }));
    for (const g of result.current.groups) {
      expect(g.items.length).toBeLessThanOrEqual(2);
    }
  });

  it('respects total limit', () => {
    const { result } = renderHook(() => useUniversalSearch('', { limitPerCategory: 50, limit: 5 }));
    expect(result.current.total).toBeLessThanOrEqual(5);
  });

  it('finds sites by name and links to them', () => {
    const { result } = renderHook(() => useUniversalSearch('magic ui'));
    const hit = result.current.groups.flatMap((g) => g.items).find((i) => i.title === 'Magic UI');
    expect(hit?.kind).toBe('site');
    expect(hit?.url).toBe('https://magicui.design');
  });

  it('finds sites by domain', () => {
    const { result } = renderHook(() => useUniversalSearch('footer.design'));
    const sites = result.current.groups.flatMap((g) => g.items).filter((i) => i.kind === 'site');
    expect(sites.some((s) => s.title === 'Footer Design')).toBe(true);
  });

  it('returns empty groups for a nonsense query', () => {
    const { result } = renderHook(() => useUniversalSearch('zzzzzzzzzzz_no_match_xyz'));
    expect(result.current.total).toBe(0);
    expect(result.current.groups).toEqual([]);
  });
});
