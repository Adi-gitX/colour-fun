import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import type { Section } from '../store/appStore';
import styles from './ShortcutsOverlay.module.css';

interface Shortcut {
  keys: string[];
  label: string;
}

interface Group {
  heading: string;
  shortcuts: Shortcut[];
}

const SHORTCUT_GROUPS: Group[] = [
  {
    heading: 'General',
    shortcuts: [
      { keys: ['⌘', 'K'], label: 'Open command palette' },
      { keys: ['?'], label: 'Show this cheat sheet' },
      { keys: ['T'], label: 'Toggle theme' },
      { keys: ['Esc'], label: 'Close any open overlay' },
    ],
  },
  {
    heading: 'Navigate',
    shortcuts: [
      { keys: ['G', 'H'], label: 'Home' },
      { keys: ['G', 'C'], label: 'Components' },
      { keys: ['G', 'L'], label: 'Component libraries' },
      { keys: ['G', 'D'], label: 'Design systems' },
      { keys: ['G', 'I'], label: 'UI inspiration' },
      { keys: ['G', 'T'], label: 'Tools' },
      { keys: ['G', 'B'], label: 'My bookmarks' },
    ],
  },
  {
    heading: 'Inside the palette',
    shortcuts: [
      { keys: ['↑', '↓'], label: 'Navigate results' },
      { keys: ['↩'], label: 'Open the highlighted result' },
      { keys: ['Esc'], label: 'Close the palette' },
    ],
  },
];

const NAV_KEYS: Record<string, Section> = {
  h: 'home',
  c: 'components',
  l: 'libraries',
  d: 'design-systems',
  i: 'inspiration',
  t: 'tools',
  b: 'library',
};

/**
 * Listens for app-wide keyboard shortcuts and renders the cheat-sheet
 * overlay when `?` is pressed. Mounted once at the app root.
 */
export const ShortcutsOverlay = () => {
  const isOpen = useAppStore((s) => s.isShortcutsOpen);
  const open = useAppStore((s) => s.openShortcuts);
  const close = useAppStore((s) => s.closeShortcuts);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const setSection = useAppStore((s) => s.setCurrentSection);
  const isPaletteOpen = useAppStore((s) => s.isPaletteOpen);
  const isSettingsOpen = useAppStore((s) => s.isSettingsOpen);
  const isDownloadModalOpen = useAppStore((s) => s.isDownloadModalOpen);

  useEffect(() => {
    let pending: ReturnType<typeof setTimeout> | null = null;
    let pendingPrefix: 'g' | null = null;

    const isTypingTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
    };

    const handler = (e: KeyboardEvent) => {
      // Never intercept when the user is typing into an input.
      if (isTypingTarget(e.target)) return;
      // Ignore when modifier keys are involved (those belong to ⌘K etc.).
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      // Don't fight overlays that own their own focus.
      if (isPaletteOpen || isSettingsOpen || isDownloadModalOpen) return;

      const key = e.key.toLowerCase();

      // `?` shows the cheat sheet (works as Shift+/ too).
      if (e.key === '?' || (e.shiftKey && key === '/')) {
        e.preventDefault();
        if (isOpen) close();
        else open();
        return;
      }

      // Esc closes the cheat sheet.
      if (key === 'escape' && isOpen) {
        e.preventDefault();
        close();
        return;
      }

      // While the cheat sheet is open, don't handle the other shortcuts.
      if (isOpen) return;

      // Toggle theme.
      if (key === 't' && !pendingPrefix) {
        e.preventDefault();
        toggleTheme();
        return;
      }

      // Two-key `g <x>` navigation.
      if (pendingPrefix === 'g') {
        if (NAV_KEYS[key]) {
          e.preventDefault();
          setSection(NAV_KEYS[key]);
        }
        pendingPrefix = null;
        if (pending) {
          clearTimeout(pending);
          pending = null;
        }
        return;
      }

      if (key === 'g') {
        pendingPrefix = 'g';
        if (pending) clearTimeout(pending);
        pending = setTimeout(() => {
          pendingPrefix = null;
          pending = null;
        }, 700);
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      if (pending) clearTimeout(pending);
    };
  }, [
    isOpen,
    isPaletteOpen,
    isSettingsOpen,
    isDownloadModalOpen,
    open,
    close,
    toggleTheme,
    setSection,
  ]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      role="presentation"
    >
      <div className={styles.panel} role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
        <header className={styles.head}>
          <h2 className={styles.title}>Keyboard shortcuts</h2>
          <button className={styles.closeBtn} onClick={close} aria-label="Close shortcuts">
            ×
          </button>
        </header>

        <div className={styles.groups}>
          {SHORTCUT_GROUPS.map((g) => (
            <section key={g.heading} className={styles.group}>
              <h3 className={styles.groupHead}>{g.heading}</h3>
              <ul className={styles.list}>
                {g.shortcuts.map((s) => (
                  <li key={s.label} className={styles.row}>
                    <span className={styles.label}>{s.label}</span>
                    <span className={styles.keys}>
                      {s.keys.map((k, i) => (
                        <span key={`${k}-${i}`}>
                          <kbd className={styles.kbd}>{k}</kbd>
                          {i < s.keys.length - 1 && <span className={styles.kbdSep}>then</span>}
                        </span>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <footer className={styles.footer}>
          Press <kbd className={styles.kbd}>?</kbd> any time to open this cheat sheet.
        </footer>
      </div>
    </div>
  );
};
