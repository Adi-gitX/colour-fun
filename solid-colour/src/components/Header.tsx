import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Command, Menu, Moon, Settings, Sun, X } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import type { Section } from '../store/appStore';
import { colors } from '../data/colors';
import { gradients } from '../data/gradients';
import { imageUrls } from '../data/images';
import { DotMark } from './brand/DotMark';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import styles from './Header.module.css';

const isMac =
  typeof navigator !== 'undefined' && /mac/i.test(navigator.platform || navigator.userAgent);

const WALLPAPER_SECTIONS: Section[] = ['solid-colors', 'gradients', 'backgrounds'];

interface NavLink {
  id: Section;
  label: string;
  /** Sections that keep this link highlighted. */
  matches: Section[];
}

const NAV: NavLink[] = [
  { id: 'home', label: 'Ask', matches: ['home'] },
  { id: 'libraries', label: 'Sites', matches: ['libraries'] },
  { id: 'backgrounds', label: 'Wallpapers', matches: WALLPAPER_SECTIONS },
];

const WALLPAPER_LINKS: Array<{ id: Section; label: string; count: number }> = [
  { id: 'backgrounds', label: 'Images', count: imageUrls.length },
  { id: 'gradients', label: 'Gradients', count: gradients.length },
  { id: 'solid-colors', label: 'Solid colours', count: colors.length },
];

function IconAction({
  label,
  onClick,
  children,
  className,
  ...rest
}: React.ComponentProps<'button'> & { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={label}
          onClick={onClick}
          className={`${styles.iconBtn} ${className ?? ''}`}
          {...rest}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={6}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Top-bar shell: wordmark, three section links, search, theme, settings. Under 720px the links
 * fold into a menu sheet driven by the store's `isSidebarOpen` flag.
 */
export const Header = () => {
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const currentSection = useAppStore((s) => s.currentSection);
  const setCurrentSection = useAppStore((s) => s.setCurrentSection);
  const openPalette = useAppStore((s) => s.openPalette);
  const openSettings = useAppStore((s) => s.openSettings);
  const menuOpen = useAppStore((s) => s.isSidebarOpen);
  const toggleMenu = useAppStore((s) => s.toggleSidebar);
  const closeMenu = useAppStore((s) => s.closeSidebar);

  const go = (section: Section) => {
    setCurrentSection(section);
    closeMenu();
  };

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen, closeMenu]);

  const isActive = (link: NavLink) => link.matches.includes(currentSection);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <button
          type="button"
          className={styles.brand}
          onClick={() => go('home')}
          aria-label="Garden home"
        >
          <span className={styles.brandMark}>
            <DotMark size={16} />
          </span>
          <span className={styles.brandText}>Garden</span>
        </button>

        <nav className={styles.nav} aria-label="Primary">
          {NAV.map((link) => (
            <button
              key={link.id}
              type="button"
              className={`${styles.navLink} ${isActive(link) ? styles.navLinkActive : ''}`}
              onClick={() => go(link.id)}
              aria-current={isActive(link) ? 'page' : undefined}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className={styles.right}>
          <IconAction label={`Search  ${isMac ? '⌘' : 'Ctrl'} K`} onClick={openPalette} aria-label="Open command palette">
            <Command />
          </IconAction>
          <IconAction
            label={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <Sun /> : <Moon />}
          </IconAction>
          <IconAction label="Settings" onClick={openSettings} className={styles.desktopOnly}>
            <Settings />
          </IconAction>
          <IconAction
            label={menuOpen ? 'Close menu' : 'Menu'}
            onClick={toggleMenu}
            className={styles.menuBtn}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X /> : <Menu />}
          </IconAction>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className={styles.scrim}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
            />
            <motion.div
              className={styles.sheet}
              role="dialog"
              aria-label="Menu"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.16 }}
            >
              {NAV.filter((l) => l.id !== 'backgrounds').map((link) => (
                <button
                  key={link.id}
                  type="button"
                  className={`${styles.sheetLink} ${isActive(link) ? styles.sheetLinkActive : ''}`}
                  onClick={() => go(link.id)}
                >
                  {link.label}
                </button>
              ))}
              <div className={`eyebrow ${styles.sheetLabel}`}>Wallpapers</div>
              {WALLPAPER_LINKS.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  className={`${styles.sheetLink} ${styles.sheetSub} ${currentSection === w.id ? styles.sheetLinkActive : ''}`}
                  onClick={() => go(w.id)}
                >
                  {w.label}
                  <span className={styles.subCount}>{w.count}</span>
                </button>
              ))}
              <div className={styles.sheetDivider} />
              <button
                type="button"
                className={styles.sheetLink}
                onClick={() => {
                  closeMenu();
                  openSettings();
                }}
              >
                Settings
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
