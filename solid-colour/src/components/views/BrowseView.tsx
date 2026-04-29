import { useMemo } from 'react';
import { ComponentCard } from '../ComponentCard';
import { SectionHeader } from './SectionHeader';
import {
  components,
  categories,
  type ComponentEntry,
} from '../../data/components';
import { useAppStore } from '../../store/appStore';
import styles from './BrowseView.module.css';

interface Props {
  scope: 'all' | 'community';
  title: string;
  eyebrow: string;
  description: string;
}

export const BrowseView = ({ scope, title, eyebrow, description }: Props) => {
  const { selectedCategory, setSelectedCategory, searchQuery } = useAppStore();

  const filtered = useMemo(() => {
    let list: ComponentEntry[] =
      scope === 'community'
        ? components.filter((c) => c.community)
        : components;
    if (selectedCategory !== 'all') {
      list = list.filter((c) => c.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.author.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [scope, selectedCategory, searchQuery]);

  return (
    <div className={styles.page}>
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        count={filtered.length}
      />

      <div className={styles.filterBar}>
        <button
          className={`${styles.chip} ${
            selectedCategory === 'all' ? styles.chipActive : ''
          }`}
          onClick={() => setSelectedCategory('all')}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`${styles.chip} ${
              selectedCategory === cat ? styles.chipActive : ''
            }`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>○</div>
          <h3>No components match</h3>
          <p>Try a different category or clear your search.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((c, i) => (
            <ComponentCard key={c.id} entry={c} index={i} />
          ))}
        </div>
      )}
    </div>
  );
};
