import { Bookmark, Star } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useAppStore } from '../store/appStore';
import type { ComponentEntry } from '../data/components';
import { PreviewImage } from './PreviewImage';
import styles from './ComponentCard.module.css';

interface Props {
  entry: ComponentEntry;
  index?: number;
}

const formatCount = (n: number) => {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
};

export const ComponentCard = ({ entry, index = 0 }: Props) => {
  const { bookmarks, toggleBookmark } = useAppStore();
  const isBookmarked = bookmarks.includes(entry.id);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      className={styles.card}
      initial={{ opacity: 0, y: 8 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.32,
        delay: (index % 16) * 0.012,
        ease: [0.2, 0.8, 0.2, 1],
      }}
    >
      <PreviewImage
        github={entry.github}
        url={entry.url}
        name={entry.name}
        fallbackGradient={entry.thumb}
        className={styles.thumb}
      />
      <div className={styles.footer}>
        <div className={styles.avatar} style={{ background: entry.authorColor }}>
          {entry.authorInitials}
        </div>
        <span className={styles.name}>{entry.name}</span>
        <button
          className={`${styles.bookmark} ${isBookmarked ? styles.bookmarkOn : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleBookmark(entry.id);
          }}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
        >
          <Bookmark size={12} strokeWidth={1.75} fill={isBookmarked ? 'currentColor' : 'none'} />
        </button>
        <span
          className={styles.stars}
          title={`${entry.stars.toLocaleString()} GitHub stars`}
          aria-label={`${entry.stars} GitHub stars`}
        >
          <Star size={11} strokeWidth={1.75} />
          {formatCount(entry.stars)}
        </span>
      </div>
    </motion.div>
  );
};
