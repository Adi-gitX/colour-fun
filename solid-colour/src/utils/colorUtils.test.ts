import { describe, it, expect } from 'vitest';
import { hexToRgb, rgbToHex } from './colorUtils';

describe('colorUtils', () => {
  describe('hexToRgb', () => {
    it('parses a 6-digit hex with leading hash', () => {
      expect(hexToRgb('#ff8800')).toEqual({ r: 255, g: 136, b: 0 });
    });

    it('parses a 6-digit hex without leading hash', () => {
      expect(hexToRgb('00ff00')).toEqual({ r: 0, g: 255, b: 0 });
    });

    it('returns null for an invalid hex', () => {
      expect(hexToRgb('not-a-color')).toBeNull();
    });
  });

  describe('rgbToHex', () => {
    it('formats rgb as uppercase hex', () => {
      expect(rgbToHex(255, 136, 0)).toBe('#FF8800');
    });

    it('clamps out-of-range channels', () => {
      expect(rgbToHex(-10, 300, 128)).toBe('#00FF80');
    });

    it('round-trips with hexToRgb', () => {
      const hex = '#1A2B3C';
      const rgb = hexToRgb(hex);
      expect(rgb).not.toBeNull();
      expect(rgbToHex(rgb!.r, rgb!.g, rgb!.b)).toBe(hex);
    });
  });
});
