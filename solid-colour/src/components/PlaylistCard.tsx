import { ArrowRight } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import type { Playlist, ResolvedPlaylistItem } from '../data/playlists';
import { PreviewImage } from './PreviewImage';
import styles from './PlaylistCard.module.css';

interface Props {
  playlist: Playlist;
  items: ResolvedPlaylistItem[];
  index?: number;
}

export const PlaylistCard = ({ playlist, items, index = 0 }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const lead = items[0];
  const rest = items.slice(1, 4);

  return (
    <motion.div
      ref={ref}
      className={styles.card}
      initial={{ opacity: 0, y: 8 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.32, delay: index * 0.05, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {lead && (
        <a
          href={lead.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.lead}
          aria-label={`${playlist.title} — open ${lead.name}`}
        >
          <PreviewImage
            github={lead.github}
            url={lead.url}
            name={lead.name}
            className={styles.preview}
          />
        </a>
      )}

      <div className={styles.body}>
        <div className={styles.head}>
          <span className={styles.eyebrow}>Playlist</span>
          <span className={styles.count}>{items.length} picks</span>
        </div>
        <h3 className={styles.title}>{playlist.title}</h3>
        <p className={styles.pitch}>{playlist.pitch}</p>

        {rest.length > 0 && (
          <ul className={styles.miniList}>
            {rest.map((item) => (
              <li key={`${item.kind}-${item.id}`} className={styles.miniRow}>
                <span className={styles.miniAvatar} style={{ background: item.accent ?? '#222' }}>
                  {item.initials ?? item.name.charAt(0)}
                </span>
                <span className={styles.miniName}>{item.name}</span>
                <span className={styles.miniKind}>{item.kind}</span>
              </li>
            ))}
            {items.length > 4 && (
              <li className={styles.miniRow}>
                <span className={styles.miniMore}>+{items.length - 4} more</span>
              </li>
            )}
          </ul>
        )}

        <div className={styles.footer}>
          <span className={styles.openAll}>
            Open all
            <ArrowRight size={12} strokeWidth={2} />
          </span>
        </div>
      </div>
    </motion.div>
  );
};
