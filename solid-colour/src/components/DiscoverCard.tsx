import { ArrowUpRight, Bookmark } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useAppStore } from '../store/appStore';
import styles from './DiscoverCard.module.css';

export interface DiscoverEntry {
  id: string;
  name: string;
  description: string;
  url: string;
  initials: string;
  accent: string;
  /** e.g. "React · Tailwind · Free" */
  tags: string[];
  /** Sub-line, e.g. org name for design systems */
  subline?: string;
  highlight?: string;
}

interface DiscoverCardProps {
  entry: DiscoverEntry;
  index?: number;
  /**
   * Optional: when set, the card body opens an in-app detail page instead
   * of the external URL. The "Visit" affordance still opens the URL.
   */
  onOpenDetail?: (id: string) => void;
}

export const DiscoverCard = ({ entry, index = 0, onOpenDetail }: DiscoverCardProps) => {
  const { bookmarks, toggleBookmark } = useAppStore();
  const isBookmarked = bookmarks.includes(entry.id);
  const ref = useRef<HTMLAnchorElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  const handleClick = onOpenDetail
    ? (e: React.MouseEvent<HTMLAnchorElement>) => {
        // Cmd/Ctrl+click should still open in a new tab.
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        onOpenDetail(entry.id);
      }
    : undefined;

  return (
    <motion.a
      ref={ref}
      href={entry.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={styles.card}
      initial={{ opacity: 0, y: 8 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.28,
        delay: (index % 18) * 0.012,
        ease: [0.2, 0.8, 0.2, 1],
      }}
    >
      <div className={styles.head}>
        <div className={styles.logo} style={{ background: entry.accent }}>
          {entry.initials}
        </div>
        <div className={styles.titleBlock}>
          <div className={styles.name}>
            {entry.name}
            {entry.highlight && <span className={styles.highlight}>{entry.highlight}</span>}
          </div>
          {entry.subline && <div className={styles.subline}>{entry.subline}</div>}
        </div>
        <button
          className={`${styles.bookmark} ${isBookmarked ? styles.bookmarkOn : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleBookmark(entry.id);
          }}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
        >
          <Bookmark size={13} strokeWidth={1.75} fill={isBookmarked ? 'currentColor' : 'none'} />
        </button>
      </div>
      <p className={styles.description}>{entry.description}</p>
      <div className={styles.footer}>
        <div className={styles.tags}>
          {entry.tags.map((t) => (
            <span key={t} className={styles.tag}>
              {t}
            </span>
          ))}
        </div>
        <span className={styles.visit}>
          Visit
          <ArrowUpRight size={12} strokeWidth={2} />
        </span>
      </div>
    </motion.a>
  );
};
