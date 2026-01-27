import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Color, ColorCategory } from '../data/colors';

interface AppState {
    // Theme
    theme: 'dark' | 'light';
    toggleTheme: () => void;

    // Search
    searchQuery: string;
    setSearchQuery: (query: string) => void;

    // Navigation
    currentSection: 'solid-colors' | 'gradients' | 'images' | 'ui-themes';
    setCurrentSection: (section: 'solid-colors' | 'gradients' | 'images' | 'ui-themes') => void;

    // Category filter
    selectedCategory: ColorCategory | 'all';
    setSelectedCategory: (category: ColorCategory | 'all') => void;

    // Download modal
    selectedColor: Color | null;
    isDownloadModalOpen: boolean;
    openDownloadModal: (color: Color) => void;
    closeDownloadModal: () => void;

    // Custom color picker
    isPickerOpen: boolean;
    customColor: string;
    setCustomColor: (color: string) => void;
    openPicker: () => void;
    closePicker: () => void;

    // Recent colors (persisted)
    recentColors: string[];
    addRecentColor: (color: string) => void;

    // Favorites (persisted)
    favorites: string[];
    toggleFavorite: (color: string) => void;
    clearFavorites: () => void;


    // Download options
    selectedRatio: string;
    setSelectedRatio: (ratio: string) => void;
    selectedResolution: { width: number; height: number };
    setSelectedResolution: (res: { width: number; height: number }) => void;
    selectedFormat: 'png' | 'jpeg' | 'webp';
    setSelectedFormat: (format: 'png' | 'jpeg' | 'webp') => void;
    useCustomSize: boolean;
    setUseCustomSize: (use: boolean) => void;
    customWidth: number;
    customHeight: number;
    setCustomWidth: (width: number) => void;
    setCustomHeight: (height: number) => void;

    // Sidebar (mobile)
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    closeSidebar: () => void;

    // Settings
    isSettingsOpen: boolean;
    openSettings: () => void;
    closeSettings: () => void;

    // Preferences
    highQualityDownloads: boolean;
    setHighQualityDownloads: (enabled: boolean) => void;
    reducedMotion: boolean;
    setReducedMotion: (enabled: boolean) => void;
    soundEffects: boolean;
    setSoundEffects: (enabled: boolean) => void;

    // Toasts
    toasts: Toast[];
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    removeToast: (id: string) => void;
}

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Theme
            theme: 'dark',
            toggleTheme: () => {
                const newTheme = get().theme === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', newTheme);
                set({ theme: newTheme });
            },

            // Search
            searchQuery: '',
            setSearchQuery: (query) => set({ searchQuery: query }),

            // Navigation
            currentSection: 'solid-colors',
            setCurrentSection: (section) => set({ currentSection: section }),

            // Category
            selectedCategory: 'all',
            setSelectedCategory: (category) => set({ selectedCategory: category }),

            // Download modal
            selectedColor: null,
            isDownloadModalOpen: false,
            openDownloadModal: (color) => set({ selectedColor: color, isDownloadModalOpen: true }),
            closeDownloadModal: () => set({ isDownloadModalOpen: false, selectedColor: null }),

            // Picker
            isPickerOpen: false,
            customColor: '#FF0000',
            setCustomColor: (color) => set({ customColor: color }),
            openPicker: () => set({ isPickerOpen: true }),
            closePicker: () => set({ isPickerOpen: false }),

            // Recent colors
            recentColors: [],
            addRecentColor: (color) => {
                const current = get().recentColors;
                const updated = [color, ...current.filter(c => c !== color)].slice(0, 12);
                set({ recentColors: updated });
            },

            // Favorites
            favorites: [],
            toggleFavorite: (color) => {
                const current = get().favorites;
                const isFav = current.includes(color);
                const updated = isFav
                    ? current.filter(c => c !== color)
                    : [...current, color];
                set({ favorites: updated });
            },
            clearFavorites: () => set({ favorites: [] }),


            // Download options
            selectedRatio: '16:9',
            setSelectedRatio: (ratio) => set({ selectedRatio: ratio }),
            selectedResolution: { width: 3840, height: 2160 },
            setSelectedResolution: (res) => set({ selectedResolution: res }),
            selectedFormat: 'png',
            setSelectedFormat: (format) => set({ selectedFormat: format }),
            useCustomSize: false,
            setUseCustomSize: (use) => set({ useCustomSize: use }),
            customWidth: 3840,
            customHeight: 2160,
            setCustomWidth: (width) => set({ customWidth: width }),
            setCustomHeight: (height) => set({ customHeight: height }),

            // Sidebar
            isSidebarOpen: false,
            toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
            closeSidebar: () => set({ isSidebarOpen: false }),

            // Settings
            isSettingsOpen: false,
            openSettings: () => set({ isSettingsOpen: true }),
            closeSettings: () => set({ isSettingsOpen: false }),

            // Preferences
            highQualityDownloads: true,
            setHighQualityDownloads: (enabled) => set({ highQualityDownloads: enabled }),
            reducedMotion: false,
            setReducedMotion: (enabled) => set({ reducedMotion: enabled }),
            soundEffects: true,
            setSoundEffects: (enabled) => set({ soundEffects: enabled }),

            // Toasts
            toasts: [],
            showToast: (message, type = 'success') => {
                const id = Date.now().toString();
                set((state) => ({
                    toasts: [...state.toasts, { id, message, type }]
                }));
                // Auto dismiss
                setTimeout(() => {
                    get().removeToast(id);
                }, 3000);
            },
            removeToast: (id) => set((state) => ({
                toasts: state.toasts.filter(t => t.id !== id)
            })),
        }),
        {
            name: 'colorfun-storage',
            partialize: (state) => ({
                theme: state.theme,
                recentColors: state.recentColors,
                favorites: state.favorites,
                currentSection: state.currentSection,
                selectedFormat: state.selectedFormat,
                selectedRatio: state.selectedRatio,
                highQualityDownloads: state.highQualityDownloads,
                reducedMotion: state.reducedMotion,
                soundEffects: state.soundEffects,
            }),
        }
    )
);

// Initialize theme on load
if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('colorfun-storage');
    if (stored) {
        try {
            const { state } = JSON.parse(stored);
            if (state?.theme) {
                document.documentElement.setAttribute('data-theme', state.theme);
            }
        } catch {
            // Ignore
        }
    }
}
