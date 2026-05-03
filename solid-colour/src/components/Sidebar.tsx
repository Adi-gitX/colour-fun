import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Boxes,
  LayoutGrid,
  FileCode2,
  Cable,
  Users,
  Library,
  Sparkles,
  Wrench,
  Settings,
  Bookmark,
  Search,
  Palette,
  Image as ImageIcon,
  Pipette,
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/appStore';
import type { Section } from '../store/appStore';
import { components } from '../data/components';
import { libraries } from '../data/libraries';
import { designSystems } from '../data/designSystems';
import { inspirationSites } from '../data/inspiration';
import { tools } from '../data/tools';
import { colors } from '../data/colors';
import { imageUrls } from '../data/images';
import styles from './Sidebar.module.css';

interface NavItem {
  id: Section;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  count?: number | 'soon';
}

const browseItems: NavItem[] = [
  { id: 'components', label: 'Components', icon: Boxes, count: components.length },
  { id: 'blocks', label: 'Blocks', icon: LayoutGrid, count: 'soon' },
  { id: 'templates', label: 'Templates', icon: FileCode2, count: 'soon' },
  { id: 'hooks', label: 'Hooks', icon: Cable, count: 'soon' },
];

const discoverItems: NavItem[] = [
  { id: 'libraries', label: 'Component Libraries', icon: Library, count: libraries.length },
  { id: 'design-systems', label: 'Design Systems', icon: LayoutGrid, count: designSystems.length },
  { id: 'inspiration', label: 'UI Inspiration', icon: Sparkles, count: inspirationSites.length },
  { id: 'tools', label: 'Tools', icon: Wrench, count: tools.length },
];

const studioItems: NavItem[] = [
  { id: 'solid-colors', label: 'Solid Colors', icon: Palette, count: colors.length },
  { id: 'gradients', label: 'Gradients', icon: Sparkles },
  { id: 'backgrounds', label: 'Backgrounds', icon: ImageIcon, count: imageUrls.length },
];

export const Sidebar = () => {
  const {
    currentSection,
    setCurrentSection,
    openSettings,
    openPicker,
    customColor,
    isSidebarOpen,
    closeSidebar,
    searchQuery,
    setSearchQuery,
    bookmarks,
  } = useAppStore();

  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape' && document.activeElement === searchRef.current) {
        searchRef.current?.blur();
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [setSearchQuery]);

  const renderItem = (item: NavItem) => (
    <button
      key={item.id}
      className={`${styles.navItem} ${currentSection === item.id ? styles.navItemActive : ''}`}
      onClick={() => {
        setCurrentSection(item.id);
        closeSidebar();
      }}
    >
      <item.icon size={15} strokeWidth={1.75} />
      <span>{item.label}</span>
      {item.count === 'soon' ? (
        <span className={styles.countSoon}>soon</span>
      ) : typeof item.count === 'number' ? (
        <span className={styles.count}>{item.count}</span>
      ) : null}
    </button>
  );

  return (
    <>
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className={styles.overlay}
          />
        )}
      </AnimatePresence>

      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.brandMark}>A</div>
          <span className={styles.brandText}>Atlas</span>
        </div>

        {/* Search */}
        <div className={styles.searchBox}>
          <Search size={14} className={styles.searchIcon} strokeWidth={2} />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search"
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className={styles.kbd}>⌘K</span>
        </div>

        <nav className={styles.nav}>
          {/* Top-level */}
          <div className={styles.navGroup}>
            <button
              className={`${styles.navItem} ${
                currentSection === 'home' ? styles.navItemActive : ''
              }`}
              onClick={() => {
                setCurrentSection('home');
                closeSidebar();
              }}
            >
              <Home size={15} strokeWidth={1.75} />
              <span>Home</span>
            </button>
            <button
              className={`${styles.navItem} ${
                currentSection === 'community' ? styles.navItemActive : ''
              }`}
              onClick={() => {
                setCurrentSection('community');
                closeSidebar();
              }}
            >
              <Users size={15} strokeWidth={1.75} />
              <span>Community</span>
            </button>
          </div>

          {/* Browse */}
          <div className={styles.navGroup}>
            <div className={styles.groupLabel}>Browse</div>
            {browseItems.map(renderItem)}
          </div>

          {/* Discover */}
          <div className={styles.navGroup}>
            <div className={styles.groupLabel}>Discover</div>
            {discoverItems.map(renderItem)}
          </div>

          {/* Studio */}
          <div className={styles.navGroup}>
            <div className={styles.groupLabel}>Studio</div>
            {studioItems.map(renderItem)}
            <button
              className={styles.navItem}
              onClick={() => {
                openPicker();
                closeSidebar();
              }}
              aria-label="Custom color picker"
            >
              <Pipette size={15} strokeWidth={1.75} />
              <span>Custom color</span>
              <div className={styles.swatch} style={{ background: customColor }} />
            </button>
          </div>

          {/* Library */}
          <div className={styles.navGroup}>
            <div className={styles.groupLabel}>Library</div>
            <button
              className={`${styles.navItem} ${
                currentSection === 'library' ? styles.navItemActive : ''
              }`}
              onClick={() => {
                setCurrentSection('library');
                closeSidebar();
              }}
            >
              <Bookmark size={15} strokeWidth={1.75} />
              <span>Bookmarks</span>
              {bookmarks.length > 0 && <span className={styles.count}>{bookmarks.length}</span>}
            </button>
            <button className={styles.navItem} onClick={openSettings}>
              <Settings size={15} strokeWidth={1.75} />
              <span>Settings</span>
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className={styles.sideFooter}>
          <span className={styles.sideFooterText}>Atlas · v1.0</span>
        </div>
      </aside>
    </>
  );
};
