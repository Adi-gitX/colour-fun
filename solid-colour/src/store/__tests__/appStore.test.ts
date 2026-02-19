import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAppStore } from '../appStore';
import { act } from '@testing-library/react';

// Reset store before each test
beforeEach(() => {
    act(() => {
        useAppStore.setState({
            theme: 'dark',
            searchQuery: '',
            currentSection: 'solid-colors',
            selectedCategory: 'all',
            selectedColor: null,
            isDownloadModalOpen: false,
            isPickerOpen: false,
            customColor: '#FF0000',
            recentColors: [],
            favorites: [],
            selectedRatio: '16:9',
            selectedResolution: { width: 3840, height: 2160 },
            selectedFormat: 'png',
            useCustomSize: false,
            customWidth: 3840,
            customHeight: 2160,
            isSidebarOpen: false,
            isSettingsOpen: false,
            highQualityDownloads: true,
            reducedMotion: false,
            soundEffects: true,
            toasts: [],
        });
    });
});

describe('appStore', () => {
    describe('theme', () => {
        it('defaults to dark', () => {
            expect(useAppStore.getState().theme).toBe('dark');
        });

        it('toggles theme from dark to light', () => {
            act(() => {
                useAppStore.getState().toggleTheme();
            });
            expect(useAppStore.getState().theme).toBe('light');
        });

        it('toggles theme back to dark', () => {
            act(() => {
                useAppStore.getState().toggleTheme();
                useAppStore.getState().toggleTheme();
            });
            expect(useAppStore.getState().theme).toBe('dark');
        });
    });

    describe('search', () => {
        it('defaults to empty', () => {
            expect(useAppStore.getState().searchQuery).toBe('');
        });

        it('sets search query', () => {
            act(() => {
                useAppStore.getState().setSearchQuery('blue');
            });
            expect(useAppStore.getState().searchQuery).toBe('blue');
        });
    });

    describe('navigation', () => {
        it('defaults to solid-colors', () => {
            expect(useAppStore.getState().currentSection).toBe('solid-colors');
        });

        it('sets current section', () => {
            act(() => {
                useAppStore.getState().setCurrentSection('gradients');
            });
            expect(useAppStore.getState().currentSection).toBe('gradients');
        });
    });

    describe('category filter', () => {
        it('defaults to all', () => {
            expect(useAppStore.getState().selectedCategory).toBe('all');
        });

        it('sets category', () => {
            act(() => {
                useAppStore.getState().setSelectedCategory('reds');
            });
            expect(useAppStore.getState().selectedCategory).toBe('reds');
        });
    });

    describe('download modal', () => {
        it('opens with selected color', () => {
            const color = { id: 'red-1', name: 'Red', hex: '#FF0000', category: 'reds' as const };
            act(() => {
                useAppStore.getState().openDownloadModal(color);
            });
            const state = useAppStore.getState();
            expect(state.isDownloadModalOpen).toBe(true);
            expect(state.selectedColor).toEqual(color);
        });

        it('closes and clears selected color', () => {
            const color = { id: 'red-1', name: 'Red', hex: '#FF0000', category: 'reds' as const };
            act(() => {
                useAppStore.getState().openDownloadModal(color);
                useAppStore.getState().closeDownloadModal();
            });
            const state = useAppStore.getState();
            expect(state.isDownloadModalOpen).toBe(false);
            expect(state.selectedColor).toBeNull();
        });
    });

    describe('recent colors', () => {
        it('adds a recent color', () => {
            act(() => {
                useAppStore.getState().addRecentColor('#FF0000');
            });
            expect(useAppStore.getState().recentColors).toContain('#FF0000');
        });

        it('deduplicates recent colors', () => {
            act(() => {
                useAppStore.getState().addRecentColor('#FF0000');
                useAppStore.getState().addRecentColor('#00FF00');
                useAppStore.getState().addRecentColor('#FF0000');
            });
            const recents = useAppStore.getState().recentColors;
            expect(recents.filter((c) => c === '#FF0000').length).toBe(1);
            expect(recents[0]).toBe('#FF0000');
        });

        it('limits to 12 recent colors', () => {
            act(() => {
                for (let i = 0; i < 15; i++) {
                    useAppStore.getState().addRecentColor(`#${i.toString().padStart(6, '0')}`);
                }
            });
            expect(useAppStore.getState().recentColors.length).toBe(12);
        });
    });

    describe('favorites', () => {
        it('toggles favorite on', () => {
            act(() => {
                useAppStore.getState().toggleFavorite('#FF0000');
            });
            expect(useAppStore.getState().favorites).toContain('#FF0000');
        });

        it('toggles favorite off', () => {
            act(() => {
                useAppStore.getState().toggleFavorite('#FF0000');
                useAppStore.getState().toggleFavorite('#FF0000');
            });
            expect(useAppStore.getState().favorites).not.toContain('#FF0000');
        });

        it('clears all favorites', () => {
            act(() => {
                useAppStore.getState().toggleFavorite('#FF0000');
                useAppStore.getState().toggleFavorite('#00FF00');
                useAppStore.getState().clearFavorites();
            });
            expect(useAppStore.getState().favorites.length).toBe(0);
        });
    });

    describe('toasts', () => {
        it('shows a toast', () => {
            vi.useFakeTimers();
            act(() => {
                useAppStore.getState().showToast('Test message');
            });
            const toasts = useAppStore.getState().toasts;
            expect(toasts.length).toBe(1);
            expect(toasts[0].message).toBe('Test message');
            expect(toasts[0].type).toBe('success');
            vi.useRealTimers();
        });

        it('shows toast with custom type', () => {
            vi.useFakeTimers();
            act(() => {
                useAppStore.getState().showToast('Error!', 'error');
            });
            expect(useAppStore.getState().toasts[0].type).toBe('error');
            vi.useRealTimers();
        });

        it('removes a toast by id', () => {
            vi.useFakeTimers();
            act(() => {
                useAppStore.getState().showToast('Test');
            });
            const id = useAppStore.getState().toasts[0].id;
            act(() => {
                useAppStore.getState().removeToast(id);
            });
            expect(useAppStore.getState().toasts.length).toBe(0);
            vi.useRealTimers();
        });

        it('auto-dismisses after 3 seconds', () => {
            vi.useFakeTimers();
            act(() => {
                useAppStore.getState().showToast('Auto dismiss');
            });
            expect(useAppStore.getState().toasts.length).toBe(1);
            act(() => {
                vi.advanceTimersByTime(3000);
            });
            expect(useAppStore.getState().toasts.length).toBe(0);
            vi.useRealTimers();
        });
    });

    describe('download options', () => {
        it('sets ratio', () => {
            act(() => {
                useAppStore.getState().setSelectedRatio('1:1');
            });
            expect(useAppStore.getState().selectedRatio).toBe('1:1');
        });

        it('sets format', () => {
            act(() => {
                useAppStore.getState().setSelectedFormat('jpeg');
            });
            expect(useAppStore.getState().selectedFormat).toBe('jpeg');
        });

        it('sets resolution', () => {
            act(() => {
                useAppStore.getState().setSelectedResolution({ width: 1920, height: 1080 });
            });
            expect(useAppStore.getState().selectedResolution).toEqual({ width: 1920, height: 1080 });
        });

        it('sets custom size', () => {
            act(() => {
                useAppStore.getState().setUseCustomSize(true);
                useAppStore.getState().setCustomWidth(500);
                useAppStore.getState().setCustomHeight(300);
            });
            const state = useAppStore.getState();
            expect(state.useCustomSize).toBe(true);
            expect(state.customWidth).toBe(500);
            expect(state.customHeight).toBe(300);
        });
    });

    describe('sidebar', () => {
        it('toggles sidebar', () => {
            act(() => {
                useAppStore.getState().toggleSidebar();
            });
            expect(useAppStore.getState().isSidebarOpen).toBe(true);
        });

        it('closes sidebar', () => {
            act(() => {
                useAppStore.getState().toggleSidebar();
                useAppStore.getState().closeSidebar();
            });
            expect(useAppStore.getState().isSidebarOpen).toBe(false);
        });
    });

    describe('settings', () => {
        it('opens settings', () => {
            act(() => {
                useAppStore.getState().openSettings();
            });
            expect(useAppStore.getState().isSettingsOpen).toBe(true);
        });

        it('closes settings', () => {
            act(() => {
                useAppStore.getState().openSettings();
                useAppStore.getState().closeSettings();
            });
            expect(useAppStore.getState().isSettingsOpen).toBe(false);
        });
    });

    describe('preferences', () => {
        it('sets high quality downloads', () => {
            act(() => {
                useAppStore.getState().setHighQualityDownloads(false);
            });
            expect(useAppStore.getState().highQualityDownloads).toBe(false);
        });

        it('sets reduced motion', () => {
            act(() => {
                useAppStore.getState().setReducedMotion(true);
            });
            expect(useAppStore.getState().reducedMotion).toBe(true);
        });

        it('sets sound effects', () => {
            act(() => {
                useAppStore.getState().setSoundEffects(false);
            });
            expect(useAppStore.getState().soundEffects).toBe(false);
        });
    });
});
