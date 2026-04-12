import { Menu, Sun, Moon } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import type { Section } from '../store/appStore';
import styles from './Header.module.css';

const sectionLabels: Record<Section, { parent?: string; label: string }> = {
  home: { label: 'Home' },
  components: { parent: 'Browse', label: 'Components' },
  blocks: { parent: 'Browse', label: 'Blocks' },
  templates: { parent: 'Browse', label: 'Templates' },
  hooks: { parent: 'Browse', label: 'Hooks' },
  community: { label: 'Community' },
  libraries: { parent: 'Discover', label: 'Component Libraries' },
  'design-systems': { parent: 'Discover', label: 'Design Systems' },
  inspiration: { parent: 'Discover', label: 'UI Inspiration' },
  tools: { parent: 'Discover', label: 'Tools' },
  library: { label: 'Bookmarks' },
  following: { label: 'Following' },
  'solid-colors': { parent: 'Studio', label: 'Solid Colors' },
  gradients: { parent: 'Studio', label: 'Gradients' },
  backgrounds: { parent: 'Studio', label: 'Backgrounds' },
};

export const Header = () => {
  const { theme, toggleTheme, toggleSidebar, currentSection } = useAppStore();
  const crumb = sectionLabels[currentSection];

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button className={styles.menuBtn} onClick={toggleSidebar} aria-label="Toggle menu">
          <Menu size={18} strokeWidth={2} />
        </button>
      </div>

      <div className={styles.center}>
        {crumb.parent && (
          <>
            <span className={styles.crumb}>{crumb.parent}</span>
            <span className={styles.crumbSep}>/</span>
          </>
        )}
        <span className={styles.crumbCurrent}>{crumb.label}</span>
      </div>

      <div className={styles.right}>
        <button
          className={styles.iconBtn}
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
        >
          {theme === 'dark' ? (
            <Sun size={14} strokeWidth={1.75} />
          ) : (
            <Moon size={14} strokeWidth={1.75} />
          )}
        </button>
      </div>
    </header>
  );
};
