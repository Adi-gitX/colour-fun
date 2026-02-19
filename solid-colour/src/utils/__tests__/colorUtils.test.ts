import { describe, it, expect } from 'vitest';
import {
    hexToRgb,
    rgbToHex,
    rgbToHsl,
    hslToRgb,
    getContrastColor,
    isValidHex,
    normalizeHex,
    adjustBrightness,
} from '../colorUtils';

describe('colorUtils', () => {
    describe('hexToRgb', () => {
        it('converts valid hex with # prefix', () => {
            expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
        });

        it('converts valid hex without # prefix', () => {
            expect(hexToRgb('00FF00')).toEqual({ r: 0, g: 255, b: 0 });
        });

        it('converts black', () => {
            expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
        });

        it('converts white', () => {
            expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
        });

        it('returns null for invalid hex', () => {
            expect(hexToRgb('invalid')).toBeNull();
        });

        it('returns null for empty string', () => {
            expect(hexToRgb('')).toBeNull();
        });

        it('is case insensitive', () => {
            expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
        });
    });

    describe('rgbToHex', () => {
        it('converts standard RGB to hex', () => {
            expect(rgbToHex(255, 0, 0)).toBe('#FF0000');
        });

        it('converts black', () => {
            expect(rgbToHex(0, 0, 0)).toBe('#000000');
        });

        it('converts white', () => {
            expect(rgbToHex(255, 255, 255)).toBe('#FFFFFF');
        });

        it('clamps values above 255', () => {
            expect(rgbToHex(300, 0, 0)).toBe('#FF0000');
        });

        it('clamps values below 0', () => {
            expect(rgbToHex(-10, 0, 0)).toBe('#000000');
        });

        it('pads single-digit hex values', () => {
            expect(rgbToHex(0, 0, 15)).toBe('#00000F');
        });
    });

    describe('rgbToHsl', () => {
        it('converts red to HSL', () => {
            const hsl = rgbToHsl(255, 0, 0);
            expect(hsl).toEqual({ h: 0, s: 100, l: 50 });
        });

        it('converts green to HSL', () => {
            const hsl = rgbToHsl(0, 255, 0);
            expect(hsl).toEqual({ h: 120, s: 100, l: 50 });
        });

        it('converts blue to HSL', () => {
            const hsl = rgbToHsl(0, 0, 255);
            expect(hsl).toEqual({ h: 240, s: 100, l: 50 });
        });

        it('converts white to HSL', () => {
            const hsl = rgbToHsl(255, 255, 255);
            expect(hsl).toEqual({ h: 0, s: 0, l: 100 });
        });

        it('converts black to HSL', () => {
            const hsl = rgbToHsl(0, 0, 0);
            expect(hsl).toEqual({ h: 0, s: 0, l: 0 });
        });

        it('converts gray to HSL', () => {
            const hsl = rgbToHsl(128, 128, 128);
            expect(hsl.s).toBe(0);
        });
    });

    describe('hslToRgb', () => {
        it('converts red HSL to RGB', () => {
            const rgb = hslToRgb(0, 100, 50);
            expect(rgb).toEqual({ r: 255, g: 0, b: 0 });
        });

        it('converts green HSL to RGB', () => {
            const rgb = hslToRgb(120, 100, 50);
            expect(rgb).toEqual({ r: 0, g: 255, b: 0 });
        });

        it('converts achromatic (gray)', () => {
            const rgb = hslToRgb(0, 0, 50);
            expect(rgb).toEqual({ r: 128, g: 128, b: 128 });
        });

        it('roundtrips with rgbToHsl for primary colors', () => {
            const hsl = rgbToHsl(255, 0, 0);
            const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
            expect(rgb).toEqual({ r: 255, g: 0, b: 0 });
        });
    });

    describe('getContrastColor', () => {
        it('returns white for dark backgrounds', () => {
            expect(getContrastColor('#000000')).toBe('#FFFFFF');
        });

        it('returns black for light backgrounds', () => {
            expect(getContrastColor('#FFFFFF')).toBe('#000000');
        });

        it('returns white for dark blue', () => {
            expect(getContrastColor('#000080')).toBe('#FFFFFF');
        });

        it('returns black for yellow', () => {
            expect(getContrastColor('#FFFF00')).toBe('#000000');
        });

        it('returns black for invalid hex', () => {
            expect(getContrastColor('invalid')).toBe('#000000');
        });
    });

    describe('isValidHex', () => {
        it('validates 6-char hex with #', () => {
            expect(isValidHex('#FF0000')).toBe(true);
        });

        it('validates 6-char hex without #', () => {
            expect(isValidHex('FF0000')).toBe(true);
        });

        it('validates 3-char hex', () => {
            expect(isValidHex('#F00')).toBe(true);
        });

        it('rejects invalid hex', () => {
            expect(isValidHex('#ZZZZZZ')).toBe(false);
        });

        it('rejects empty string', () => {
            expect(isValidHex('')).toBe(false);
        });

        it('rejects too-long hex', () => {
            expect(isValidHex('#FF00001')).toBe(false);
        });
    });

    describe('normalizeHex', () => {
        it('adds # prefix', () => {
            expect(normalizeHex('FF0000')).toBe('#FF0000');
        });

        it('keeps existing # prefix', () => {
            expect(normalizeHex('#FF0000')).toBe('#FF0000');
        });

        it('expands 3-char shorthand', () => {
            expect(normalizeHex('#F00')).toBe('#FF0000');
        });

        it('uppercases lowercase hex', () => {
            expect(normalizeHex('#ff0000')).toBe('#FF0000');
        });
    });

    describe('adjustBrightness', () => {
        it('lightens a color', () => {
            const lighter = adjustBrightness('#808080', 20);
            const rgb = hexToRgb(lighter);
            expect(rgb!.r).toBeGreaterThan(128);
        });

        it('darkens a color', () => {
            const darker = adjustBrightness('#808080', -20);
            const rgb = hexToRgb(darker);
            expect(rgb!.r).toBeLessThan(128);
        });

        it('clamps to white', () => {
            const result = adjustBrightness('#FFFFFF', 50);
            expect(result).toBe('#FFFFFF');
        });

        it('clamps to black', () => {
            const result = adjustBrightness('#000000', -50);
            expect(result).toBe('#000000');
        });

        it('returns original for invalid hex', () => {
            expect(adjustBrightness('invalid', 10)).toBe('invalid');
        });
    });
});
