import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ComponentCategory } from '../data/components';
import type { Color, ColorCategory } from '../data/colors';

export type Section =
  // New Stax sections
  | 'home'
  | 'components'
  | 'blocks'
  | 'templates'
  | 'hooks'
  | 'community'
  | 'libraries'
  | 'design-systems'
  | 'inspiration'
  | 'tools'
  | 'library'
  | 'following'
  // Studio (restored color/gradient/image features)
  | 'solid-colors'
  | 'gradients'
  | 'backgrounds';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppState {
  /* ===== Theme ===== */
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  /* ===== Search ===== */
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  /* ===== Navigation ===== */
  currentSection: Section;
  setCurrentSection: (section: Section) => void;

  /* ===== Component category filter (Browse / Community) ===== */
  selectedCategory: ComponentCategory | 'all';
  setSelectedCategory: (cat: ComponentCategory | 'all') => void;

  /* ===== Color category filter (Studio / Solid Colors) ===== */
  colorCategory: ColorCategory | 'all';
  setColorCategory: (cat: ColorCategory | 'all') => void;

  /* ===== Bookmarks (component-library + discover items) ===== */
  bookmarks: string[];
  toggleBookmark: (id: string) => void;
  clearBookmarks: () => void;

  /* ===== Studio: color favorites (hex strings) ===== */
  favorites: string[];
  toggleFavorite: (color: string) => void;
  clearFavorites: () => void;

  /* ===== Studio: download modal ===== */
  selectedColor: Color | null;
  isDownloadModalOpen: boolean;
  openDownloadModal: (color: Color) => void;
  closeDownloadModal: () => void;

  /* ===== Studio: custom color picker ===== */
  isPickerOpen: boolean;
  customColor: string;
  setCustomColor: (color: string) => void;
  openPicker: () => void;
  closePicker: () => void;
  recentColors: string[];
  addRecentColor: (color: string) => void;

  /* ===== Studio: download options ===== */
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
  setCustomWidth: (w: number) => void;
  setCustomHeight: (h: number) => void;

  /* ===== Sidebar (mobile) ===== */
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;

  /* ===== Settings ===== */
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;

  /* ===== Preferences ===== */
  reducedMotion: boolean;
  setReducedMotion: (enabled: boolean) => void;
  highQualityDownloads: boolean;
  setHighQualityDownloads: (enabled: boolean) => void;

  /* ===== Toasts ===== */
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        set({ theme: newTheme });
      },

      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),

      currentSection: 'home',
      setCurrentSection: (section) =>
        set({
          currentSection: section,
          searchQuery: '',
          selectedCategory: 'all',
          colorCategory: 'all',
        }),

      selectedCategory: 'all',
      setSelectedCategory: (cat) => set({ selectedCategory: cat }),

      colorCategory: 'all',
      setColorCategory: (cat) => set({ colorCategory: cat }),

      bookmarks: [],
      toggleBookmark: (id) => {
        const cur = get().bookmarks;
        const has = cur.includes(id);
        set({ bookmarks: has ? cur.filter((b) => b !== id) : [...cur, id] });
      },
      clearBookmarks: () => set({ bookmarks: [] }),

      favorites: [],
      toggleFavorite: (color) => {
        const cur = get().favorites;
        const has = cur.includes(color);
        set({ favorites: has ? cur.filter((c) => c !== color) : [...cur, color] });
      },
      clearFavorites: () => set({ favorites: [] }),

      selectedColor: null,
      isDownloadModalOpen: false,
      openDownloadModal: (color) =>
        set({ selectedColor: color, isDownloadModalOpen: true }),
      closeDownloadModal: () =>
        set({ isDownloadModalOpen: false, selectedColor: null }),

      isPickerOpen: false,
      customColor: '#FF0000',
      setCustomColor: (color) => set({ customColor: color }),
      openPicker: () => set({ isPickerOpen: true }),
      closePicker: () => set({ isPickerOpen: false }),

      recentColors: [],
      addRecentColor: (color) => {
        const cur = get().recentColors;
        const updated = [color, ...cur.filter((c) => c !== color)].slice(0, 12);
        set({ recentColors: updated });
      },

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
      setCustomWidth: (w) => set({ customWidth: w }),
      setCustomHeight: (h) => set({ customHeight: h }),

      isSidebarOpen: false,
      toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
      closeSidebar: () => set({ isSidebarOpen: false }),

      isSettingsOpen: false,
      openSettings: () => set({ isSettingsOpen: true }),
      closeSettings: () => set({ isSettingsOpen: false }),

      reducedMotion: false,
      setReducedMotion: (enabled) => set({ reducedMotion: enabled }),
      highQualityDownloads: true,
      setHighQualityDownloads: (enabled) =>
        set({ highQualityDownloads: enabled }),

      toasts: [],
      showToast: (message, type = 'success') => {
        const id = Date.now().toString();
        set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
        setTimeout(() => get().removeToast(id), 3000);
      },
      removeToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    }),
    {
      name: 'stax-storage',
      partialize: (state) => ({
        theme: state.theme,
        bookmarks: state.bookmarks,
        favorites: state.favorites,
        recentColors: state.recentColors,
        currentSection: state.currentSection,
        selectedFormat: state.selectedFormat,
        selectedRatio: state.selectedRatio,
        reducedMotion: state.reducedMotion,
        highQualityDownloads: state.highQualityDownloads,
      }),
    }
  )
);

if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('stax-storage');
  let initialTheme: 'light' | 'dark' = 'dark';
  if (stored) {
    try {
      const { state } = JSON.parse(stored);
      if (state?.theme === 'dark' || state?.theme === 'light') {
        initialTheme = state.theme;
      }
    } catch {
      // Ignore
    }
  }
  document.documentElement.setAttribute('data-theme', initialTheme);
}
