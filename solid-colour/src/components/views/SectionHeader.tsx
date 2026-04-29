import styles from './SectionHeader.module.css';

interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  count?: number;
  trailing?: React.ReactNode;
}

export const SectionHeader = ({
  eyebrow,
  title,
  description,
  count,
  trailing,
}: Props) => (
  <div className={styles.header}>
    <div className={styles.text}>
      {eyebrow && <div className={styles.eyebrow}>{eyebrow}</div>}
      <div className={styles.titleRow}>
        <h2 className={styles.title}>{title}</h2>
        {typeof count === 'number' && (
          <span className={styles.count}>{count}</span>
        )}
      </div>
      {description && <p className={styles.description}>{description}</p>}
    </div>
    {trailing && <div className={styles.trailing}>{trailing}</div>}
  </div>
);
