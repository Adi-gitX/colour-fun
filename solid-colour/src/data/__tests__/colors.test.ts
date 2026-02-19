import { describe, it, expect } from 'vitest';
import {
    colors,
    colorCount,
    getColorsByCategory,
    searchColors,
    categoryLabels,
    categoryColors,
} from '../colors';
import type { Color, ColorCategory } from '../colors';

describe('colors data', () => {
    describe('colors array', () => {
        it('contains 238 colors', () => {
            expect(colors.length).toBe(238);
            expect(colorCount).toBe(238);
        });

        it('every color has required fields', () => {
            colors.forEach((color: Color) => {
                expect(color).toHaveProperty('id');
                expect(color).toHaveProperty('name');
                expect(color).toHaveProperty('hex');
                expect(color).toHaveProperty('category');
                expect(color.id).toBeTruthy();
                expect(color.name).toBeTruthy();
                expect(color.hex).toMatch(/^#[A-Fa-f0-9]{6}$/);
            });
        });

        it('has unique IDs', () => {
            const ids = colors.map((c) => c.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(ids.length);
        });

        it('every color belongs to a valid category', () => {
            const validCategories = Object.keys(categoryLabels);
            colors.forEach((color) => {
                expect(validCategories).toContain(color.category);
            });
        });
    });

    describe('categoryLabels', () => {
        it('has 12 categories', () => {
            expect(Object.keys(categoryLabels).length).toBe(12);
        });

        it('includes expected categories', () => {
            const expected: ColorCategory[] = [
                'reds', 'oranges', 'yellows', 'greens', 'blues',
                'purples', 'pinks', 'browns', 'grays', 'blacks',
                'pastels', 'neons',
            ];
            expected.forEach((cat) => {
                expect(categoryLabels).toHaveProperty(cat);
            });
        });
    });

    describe('categoryColors', () => {
        it('has an entry for each category', () => {
            const categories = Object.keys(categoryLabels);
            categories.forEach((cat) => {
                expect(categoryColors).toHaveProperty(cat);
            });
        });
    });

    describe('getColorsByCategory', () => {
        it('returns all colors when category is "all"', () => {
            const result = getColorsByCategory('all');
            expect(result.length).toBe(238);
        });

        it('filters by reds category', () => {
            const reds = getColorsByCategory('reds');
            expect(reds.length).toBe(22);
            reds.forEach((c) => expect(c.category).toBe('reds'));
        });

        it('filters by blues category', () => {
            const blues = getColorsByCategory('blues');
            expect(blues.length).toBe(32);
            blues.forEach((c) => expect(c.category).toBe('blues'));
        });

        it('filters by neons category', () => {
            const neons = getColorsByCategory('neons');
            expect(neons.length).toBe(14);
            neons.forEach((c) => expect(c.category).toBe('neons'));
        });
    });

    describe('searchColors', () => {
        it('returns all colors for empty query', () => {
            expect(searchColors('').length).toBe(238);
        });

        it('returns all colors for whitespace query', () => {
            expect(searchColors('   ').length).toBe(238);
        });

        it('searches by color name', () => {
            const results = searchColors('crimson');
            expect(results.length).toBeGreaterThanOrEqual(1);
            expect(results.some((c) => c.name.toLowerCase().includes('crimson'))).toBe(true);
        });

        it('searches by hex value', () => {
            const results = searchColors('#FF0000');
            expect(results.length).toBeGreaterThanOrEqual(1);
        });

        it('searches by category name', () => {
            const results = searchColors('reds');
            expect(results.length).toBe(22);
        });

        it('is case insensitive', () => {
            const upper = searchColors('BLUE');
            const lower = searchColors('blue');
            expect(upper.length).toBe(lower.length);
        });

        it('returns empty array for non-matching query', () => {
            const results = searchColors('xyznonexistent');
            expect(results.length).toBe(0);
        });
    });
});
