import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { fonts, fontCategories, type FontCategory } from '../../data/fonts';
import { useAppStore } from '../../store/appStore';
import { SectionHeader } from './SectionHeader';
import styles from './FontsView.module.css';

/**
 * Lazily injects a Google Fonts stylesheet for every font in the catalog
 * marked `googleFont: true`. Single <link> tag added once on mount.
 */
function useGoogleFontsStylesheet() {
  useEffect(() => {
    const id = 'atlas-fonts-catalog-stylesheet';
    if (document.getElementById(id)) return;

    const families = fonts
      .filter((f) => f.googleFont)
      .map((f) => {
        const familyToken = f.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
        return `family=${encodeURIComponent(familyToken)}:wght@400;500;600;700`;
      })
      .join('&');

    if (!families) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    document.head.appendChild(link);
  }, []);
}

const PREVIEW_TEXT = 'The quick brown fox jumps over the lazy dog · 1234567890';

export const FontsView = () => {
  useGoogleFontsStylesheet();
  const { searchQuery } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<FontCategory | 'all'>('all');

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return fonts.filter((f) => {
      const inCategory = selectedCategory === 'all' || f.category === selectedCategory;
      if (!inCategory) return false;
      if (!q) return true;
      return (
        f.name.toLowerCase().includes(q) ||
        f.foundry.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className={styles.page}>
      <SectionHeader
        eyebrow="Discover"
        title="Fonts"
        description={`Curated open-source typefaces and free-tier picks. ${fonts.length} indexed.`}
        count={filtered.length}
      />

      <div className={styles.filters}>
        <button
          className={`${styles.chip} ${selectedCategory === 'all' ? styles.chipActive : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          All
        </button>
        {fontCategories.map((cat) => (
          <button
            key={cat}
            className={`${styles.chip} ${selectedCategory === cat ? styles.chipActive : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <p>Nothing matches that search. Try a broader term.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map((font) => (
            <a
              key={font.id}
              href={font.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.row}
            >
              <div className={styles.head}>
                <div>
                  <div className={styles.name} style={{ fontFamily: font.fontFamily }}>
                    {font.name}
                  </div>
                  <div className={styles.meta}>
                    <span>{font.foundry}</span>
                    <span className={styles.dot}>·</span>
                    <span>{font.category}</span>
                    <span className={styles.dot}>·</span>
                    <span className={styles.license}>{font.license}</span>
                  </div>
                </div>
                <span className={styles.visit}>
                  Visit
                  <ArrowUpRight size={12} strokeWidth={2} />
                </span>
              </div>
              <p className={styles.preview} style={{ fontFamily: font.fontFamily }}>
                {PREVIEW_TEXT}
              </p>
              <p className={styles.description}>{font.description}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};
