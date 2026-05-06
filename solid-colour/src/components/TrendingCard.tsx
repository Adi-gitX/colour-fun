import { ArrowUpRight, Bookmark, Star } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useAppStore } from '../store/appStore';
import type { ComponentEntry } from '../data/components';
import { PreviewImage } from './PreviewImage';
import styles from './TrendingCard.module.css';

interface Props {
  entry: ComponentEntry;
  index?: number;
}

const formatStars = (n: number): string => {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
};

/**
 * Card used in HomeView's "Trending" rail. Bigger preview, name + tagline +
 * primary tag + Visit link — built around the PreviewImage fallback chain so
 * every card always renders meaningful content.
 */
export const TrendingCard = ({ entry, index = 0 }: Props) => {
  const { bookmarks, toggleBookmark } = useAppStore();
  const isBookmarked = bookmarks.includes(entry.id);
  const ref = useRef<HTMLAnchorElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.a
      ref={ref}
      href={entry.url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.card}
      initial={{ opacity: 0, y: 8 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.3,
        delay: (index % 16) * 0.012,
        ease: [0.2, 0.8, 0.2, 1],
      }}
    >
      <PreviewImage
        github={entry.github}
        url={entry.url}
        name={entry.name}
        fallbackGradient={entry.thumb}
        className={styles.preview}
      />

      <div className={styles.body}>
        <div className={styles.row}>
          <span className={styles.tag}>{entry.category}</span>
          <span className={styles.stars} aria-label={`${entry.stars} GitHub stars`}>
            <Star size={11} strokeWidth={1.75} />
            {formatStars(entry.stars)}
          </span>
        </div>
        <h3 className={styles.name}>{entry.name}</h3>
        <p className={styles.tagline}>{entry.tagline}</p>
        <div className={styles.footer}>
          <span className={styles.author}>
            <span className={styles.avatar} style={{ background: entry.authorColor }}>
              {entry.authorInitials}
            </span>
            {entry.author}
          </span>
          <button
            type="button"
            className={`${styles.bookmark} ${isBookmarked ? styles.bookmarkOn : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleBookmark(entry.id);
            }}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            <Bookmark size={12} strokeWidth={1.75} fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
          <span className={styles.visit}>
            Visit
            <ArrowUpRight size={12} strokeWidth={2} />
          </span>
        </div>
      </div>
    </motion.a>
  );
};
