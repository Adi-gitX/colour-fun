import { useMemo, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Bookmark, ChevronRight, Pipette } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import {
  colors,
  getColorsByCategory,
  searchColors,
  categoryLabels,
  categoryColors,
} from '../data/colors';
import type { Color, ColorCategory } from '../data/colors';
import styles from './ColorGrid.module.css';

const ColorCard = ({ color, index }: { color: Color; index: number }) => {
  const { openDownloadModal, favorites, toggleFavorite } = useAppStore();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const isFav = favorites.includes(color.hex);

  return (
    <motion.div
      ref={ref}
      className={styles.card}
      initial={{ opacity: 0, y: 12 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.32,
        delay: (index % 18) * 0.012,
        ease: [0.2, 0.8, 0.2, 1],
      }}
      onClick={() => openDownloadModal(color)}
    >
      <div
        className={styles.swatch}
        style={{ backgroundColor: color.hex }}
        aria-label={color.name}
      />
      <div className={styles.cardFooter}>
        <div className={styles.colorDot} style={{ backgroundColor: color.hex }} />
        <div className={styles.cardMeta}>
          <span className={styles.colorName}>{color.name}</span>
          <span className={styles.colorHex}>{color.hex}</span>
        </div>
        <button
          className={`${styles.favBtn} ${isFav ? styles.favBtnActive : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(color.hex);
          }}
          aria-label={isFav ? 'Remove favorite' : 'Add favorite'}
        >
          <Bookmark size={13} strokeWidth={1.75} fill={isFav ? 'currentColor' : 'none'} />
        </button>
      </div>
    </motion.div>
  );
};

export const ColorGrid = () => {
  const { searchQuery, colorCategory, setColorCategory, openPicker } = useAppStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredColors = useMemo(() => {
    let result: Color[] = colors;
    if (colorCategory !== 'all') {
      result = getColorsByCategory(colorCategory);
    }
    if (searchQuery.trim()) {
      const searched = searchColors(searchQuery);
      result = result.filter((c) => searched.some((s) => s.id === c.id));
    }
    return result;
  }, [searchQuery, colorCategory]);

  const allCategories = Object.keys(categoryLabels) as ColorCategory[];

  return (
    <div ref={containerRef} className={styles.gridWrapper}>
      <div className={styles.headRow}>
        <div className={styles.headText}>
          <div className={styles.eyebrow}>Studio</div>
          <div className={styles.headTitleRow}>
            <h2 className={styles.gridTitle}>Solid Colors</h2>
            <span className={styles.gridCount}>{filteredColors.length}</span>
          </div>
          <p className={styles.headDescription}>
            238 curated colors plus a custom picker — export at up to 8K in PNG, JPEG or WebP.
          </p>
        </div>
        <button className={styles.pickerBtn} type="button" onClick={openPicker}>
          <Pipette size={13} strokeWidth={1.75} />
          Custom color
          <ChevronRight size={13} strokeWidth={1.75} />
        </button>
      </div>

      <div className={styles.filterBar}>
        <button
          className={`${styles.chip} ${colorCategory === 'all' ? styles.chipActive : ''}`}
          onClick={() => setColorCategory('all')}
        >
          <span
            className={styles.chipDot}
            style={{
              background:
                'conic-gradient(from 0deg, #ef4444, #f59e0b, #10b981, #3b82f6, #8b5cf6, #ec4899, #ef4444)',
            }}
          />
          All
        </button>
        {allCategories.map((cat) => (
          <button
            key={cat}
            className={`${styles.chip} ${colorCategory === cat ? styles.chipActive : ''}`}
            onClick={() => setColorCategory(cat)}
          >
            <span className={styles.chipDot} style={{ background: categoryColors[cat] }} />
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      {filteredColors.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>○</div>
          <h3>No colors match</h3>
          <p>Try a different category or use the custom color picker.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredColors.map((color, index) => (
            <ColorCard key={color.id} color={color} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};
