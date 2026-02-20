import { describe, it, expect } from 'vitest';
import {
    estimateFileSize,
    calculateDimensions,
    aspectRatios,
    defaultPreset,
} from '../imageGenerator';

describe('imageGenerator', () => {
    describe('estimateFileSize', () => {
        it('estimates PNG size in KB', () => {
            const size = estimateFileSize(1920, 1080, 'png');
            expect(size).toContain('KB');
        });

        it('estimates JPEG size', () => {
            const size = estimateFileSize(1920, 1080, 'jpeg');
            expect(size).toMatch(/KB|MB/);
        });

        it('estimates WebP size', () => {
            const size = estimateFileSize(1920, 1080, 'webp');
            expect(size).toMatch(/KB|MB/);
        });

        it('handles very small images', () => {
            const size = estimateFileSize(1, 1, 'png');
            expect(size).toMatch(/B/);
        });

        it('handles large 8K images', () => {
            const size = estimateFileSize(7680, 4320, 'png');
            expect(size).toContain('MB');
        });

        it('uses default estimation for unknown formats', () => {
            const size = estimateFileSize(1920, 1080, 'unknown');
            expect(size).toBeTruthy();
        });
    });

    describe('calculateDimensions', () => {
        it('calculates 16:9 dimensions', () => {
            const result = calculateDimensions('16:9', 1920);
            expect(result).toEqual({ width: 1920, height: 1080 });
        });

        it('calculates 1:1 dimensions', () => {
            const result = calculateDimensions('1:1', 1080);
            expect(result).toEqual({ width: 1080, height: 1080 });
        });

        it('calculates 4:3 dimensions', () => {
            const result = calculateDimensions('4:3', 1600);
            expect(result).toEqual({ width: 1600, height: 1200 });
        });

        it('calculates 9:16 portrait dimensions', () => {
            const result = calculateDimensions('9:16', 1080);
            expect(result).toEqual({ width: 1080, height: 1920 });
        });

        it('calculates 21:9 ultrawide dimensions', () => {
            const result = calculateDimensions('21:9', 2560);
            expect(result.width).toBe(2560);
            expect(result.height).toBe(Math.round((2560 * 9) / 21));
        });
    });

    describe('aspectRatios', () => {
        it('contains multiple aspect ratio options', () => {
            expect(aspectRatios.length).toBeGreaterThanOrEqual(6);
        });

        it('each ratio has required fields', () => {
            aspectRatios.forEach((ar) => {
                expect(ar).toHaveProperty('label');
                expect(ar).toHaveProperty('ratio');
                expect(ar).toHaveProperty('presets');
                expect(ar.presets.length).toBeGreaterThan(0);
            });
        });

        it('each preset has required fields', () => {
            aspectRatios.forEach((ar) => {
                ar.presets.forEach((preset) => {
                    expect(preset).toHaveProperty('label');
                    expect(preset).toHaveProperty('width');
                    expect(preset).toHaveProperty('height');
                    expect(preset).toHaveProperty('category');
                    expect(preset.width).toBeGreaterThan(0);
                    expect(preset.height).toBeGreaterThan(0);
                });
            });
        });

        it('includes 16:9 ratio', () => {
            const found = aspectRatios.find((ar) => ar.ratio === '16:9');
            expect(found).toBeDefined();
        });
    });

    describe('defaultPreset', () => {
        it('is 4K UHD', () => {
            expect(defaultPreset.label).toBe('4K UHD');
            expect(defaultPreset.width).toBe(3840);
            expect(defaultPreset.height).toBe(2160);
        });
    });
});
