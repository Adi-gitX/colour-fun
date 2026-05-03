import { useEffect, useRef, useCallback } from 'react';
import { Command } from 'cmdk';
import { Search, X, Sun, Moon, Home, Sparkles, Compass, Box, Wrench, Keyboard } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import type { Section } from '../store/appStore';
import { useUniversalSearch, type SearchItem } from '../hooks/useUniversalSearch';
import styles from './CommandPalette.module.css';

const NAV_SHORTCUTS: Array<{
  section: Section;
  label: string;
  icon: typeof Home;
}> = [
  { section: 'home', label: 'Go to Home', icon: Home },
  { section: 'components', label: 'Browse Components', icon: Box },
  { section: 'libraries', label: 'Discover Component Libraries', icon: Compass },
  { section: 'design-systems', label: 'Discover Design Systems', icon: Sparkles },
  { section: 'inspiration', label: 'UI Inspiration', icon: Sparkles },
  { section: 'tools', label: 'Tools (directory)', icon: Sparkles },
  { section: 'tool-contrast', label: 'Toolbox · Contrast Checker', icon: Wrench },
  { section: 'tool-palette', label: 'Toolbox · Palette Generator', icon: Wrench },
  { section: 'tool-typescale', label: 'Toolbox · Type Scale', icon: Wrench },
  { section: 'tool-shadow', label: 'Toolbox · Shadow Generator', icon: Wrench },
  { section: 'solid-colors', label: 'Studio · Solid Colors', icon: Sparkles },
  { section: 'gradients', label: 'Studio · Gradients', icon: Sparkles },
  { section: 'library', label: 'My Library (bookmarks)', icon: Box },
];

export const CommandPalette = () => {
  const isOpen = useAppStore((s) => s.isPaletteOpen);
  const query = useAppStore((s) => s.paletteQuery);
  const openPalette = useAppStore((s) => s.openPalette);
  const closePalette = useAppStore((s) => s.closePalette);
  const setQuery = useAppStore((s) => s.setPaletteQuery);
  const setSection = useAppStore((s) => s.setCurrentSection);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const theme = useAppStore((s) => s.theme);
  const openShortcuts = useAppStore((s) => s.openShortcuts);
  const recent = useAppStore((s) => s.recentSearches);
  const addRecent = useAppStore((s) => s.addRecentSearch);
  const clearRecent = useAppStore((s) => s.clearRecentSearches);
  const showToast = useAppStore((s) => s.showToast);

  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  /* Global ⌘K / Ctrl+K listener — registered once at the app level. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          closePalette();
        } else {
          openPalette();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, openPalette, closePalette]);

  /* Autofocus the input every time the palette opens. */
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  const { groups, total } = useUniversalSearch(query, {
    limitPerCategory: 5,
    limit: 30,
  });

  const handleNavigate = useCallback(
    (section: Section) => {
      setSection(section);
      closePalette();
    },
    [setSection, closePalette]
  );

  const handleResult = useCallback(
    (item: SearchItem) => {
      if (query.trim()) addRecent(query.trim());
      if (item.url) {
        window.open(item.url, '_blank', 'noopener,noreferrer');
        showToast(`Opened ${item.title}`, 'info');
      } else {
        setSection(item.section);
      }
      closePalette();
    },
    [query, addRecent, setSection, closePalette, showToast]
  );

  const onOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) closePalette();
  };

  if (!isOpen) return null;

  return (
    <div ref={overlayRef} className={styles.overlay} onClick={onOverlayClick} role="presentation">
      <Command className={styles.panel} label="Command palette" shouldFilter={false} loop>
        <div className={styles.searchRow}>
          <Search size={16} className={styles.searchIcon} aria-hidden />
          <Command.Input
            ref={inputRef}
            value={query}
            onValueChange={setQuery}
            placeholder="Search libraries, systems, components, colors, tools…"
            className={styles.input}
          />
          <span className={styles.kbd}>esc</span>
        </div>

        <Command.List className={styles.list}>
          {!query && recent.length > 0 && (
            <div className={styles.recentRow}>
              <span className={styles.recentLabel}>Recent</span>
              {recent.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={styles.recentChip}
                  onClick={() => setQuery(r)}
                >
                  {r}
                </button>
              ))}
              <button
                type="button"
                className={styles.recentChip}
                onClick={() => clearRecent()}
                aria-label="Clear recent searches"
              >
                <X size={11} />
                clear
              </button>
            </div>
          )}

          <Command.Empty className={styles.empty}>
            No results for &ldquo;{query}&rdquo;
          </Command.Empty>

          {/* Quick actions — always visible */}
          <Command.Group className={styles.group} heading="Quick actions">
            <div className={styles.groupHeading}>Quick actions</div>
            <Command.Item
              className={styles.item}
              value="toggle theme"
              onSelect={() => {
                toggleTheme();
                closePalette();
              }}
            >
              <span className={styles.avatar} aria-hidden>
                {theme === 'dark' ? (
                  <Sun size={14} strokeWidth={2} />
                ) : (
                  <Moon size={14} strokeWidth={2} />
                )}
              </span>
              <span className={styles.itemBody}>
                <span className={styles.itemTitle}>
                  Switch to {theme === 'dark' ? 'light' : 'dark'} theme
                </span>
                <span className={styles.itemSubtitle}>
                  Currently {theme} · saved across sessions
                </span>
              </span>
            </Command.Item>

            <Command.Item
              className={styles.item}
              value="show keyboard shortcuts"
              onSelect={() => {
                closePalette();
                openShortcuts();
              }}
            >
              <span className={styles.avatar} aria-hidden>
                <Keyboard size={14} strokeWidth={2} />
              </span>
              <span className={styles.itemBody}>
                <span className={styles.itemTitle}>Show keyboard shortcuts</span>
                <span className={styles.itemSubtitle}>Press ? any time</span>
              </span>
            </Command.Item>

            {NAV_SHORTCUTS.map((nav) => {
              const Icon = nav.icon;
              return (
                <Command.Item
                  key={nav.section}
                  className={styles.item}
                  value={`navigate ${nav.label}`}
                  onSelect={() => handleNavigate(nav.section)}
                >
                  <span className={styles.avatar} aria-hidden>
                    <Icon size={14} strokeWidth={2} />
                  </span>
                  <span className={styles.itemBody}>
                    <span className={styles.itemTitle}>{nav.label}</span>
                    <span className={styles.itemSubtitle}>Jump to section</span>
                  </span>
                </Command.Item>
              );
            })}
          </Command.Group>

          {/* Search results, grouped by kind */}
          {total > 0 &&
            groups.map((g) => (
              <Command.Group key={g.kind} className={styles.group}>
                <div className={styles.groupHeading}>{g.label}</div>
                {g.items.map((item) => (
                  <Command.Item
                    key={item.id}
                    className={styles.item}
                    value={`${item.kind}-${item.title}-${item.subtitle}`}
                    onSelect={() => handleResult(item)}
                  >
                    <span
                      className={styles.avatar}
                      data-color={item.kind === 'color'}
                      data-accent={Boolean(item.accent && item.kind !== 'color')}
                      style={
                        item.kind === 'color'
                          ? { background: item.hex, color: 'transparent' }
                          : item.accent
                            ? { background: item.accent }
                            : undefined
                      }
                      aria-hidden
                    >
                      {item.initials ?? item.title.slice(0, 2)}
                    </span>
                    <span className={styles.itemBody}>
                      <span className={styles.itemTitle}>{item.title}</span>
                      <span className={styles.itemSubtitle}>{item.subtitle}</span>
                    </span>
                    {item.url && <span className={styles.itemMeta}>↗</span>}
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
        </Command.List>

        <div className={styles.footer}>
          <div className={styles.footerHints}>
            <span className={styles.footerHint}>
              <span className={styles.footerKbd}>↑↓</span>
              navigate
            </span>
            <span className={styles.footerHint}>
              <span className={styles.footerKbd}>↩</span>
              select
            </span>
            <span className={styles.footerHint}>
              <span className={styles.footerKbd}>esc</span>
              close
            </span>
          </div>
          <span>Atlas command</span>
        </div>
      </Command>
    </div>
  );
};
