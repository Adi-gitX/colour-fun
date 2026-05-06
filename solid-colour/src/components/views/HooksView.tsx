import { useMemo, useState } from 'react';
import { ArrowUpRight, Copy, Check } from 'lucide-react';
import { hooks, type HookCategory } from '../../data/hooks';
import { useAppStore } from '../../store/appStore';
import { SectionHeader } from './SectionHeader';
import styles from './HooksView.module.css';

const CATEGORIES: HookCategory[] = [
  'State',
  'Effect',
  'DOM',
  'Sensor',
  'Network',
  'Animation',
  'Lifecycle',
  'Utility',
];

export const HooksView = () => {
  const { searchQuery, showToast } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<HookCategory | 'all'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return hooks.filter((h) => {
      const inCategory = selectedCategory === 'all' || h.category === selectedCategory;
      if (!inCategory) return false;
      if (!q) return true;
      return (
        h.name.toLowerCase().includes(q) ||
        h.description.toLowerCase().includes(q) ||
        h.source.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, selectedCategory]);

  const grouped = useMemo(() => {
    const map = new Map<HookCategory, typeof hooks>();
    for (const h of filtered) {
      const list = map.get(h.category) ?? [];
      list.push(h);
      map.set(h.category, list);
    }
    return CATEGORIES.map((c) => ({ category: c, items: map.get(c) ?? [] })).filter(
      (g) => g.items.length > 0
    );
  }, [filtered]);

  const copyInstall = async (id: string, pkg: string) => {
    try {
      await navigator.clipboard.writeText(`npm install ${pkg}`);
      setCopiedId(id);
      showToast(`Copied npm install ${pkg}`, 'success');
      window.setTimeout(() => setCopiedId(null), 1500);
    } catch {
      showToast('Could not copy — clipboard blocked', 'error');
    }
  };

  return (
    <div className={styles.page}>
      <SectionHeader
        eyebrow="Browse"
        title="Hooks"
        description={`Battle-tested React hooks from react-use, usehooks-ts, TanStack and the Mantine team. ${hooks.length} indexed.`}
        count={filtered.length}
      />

      <div className={styles.filters}>
        <button
          className={`${styles.chip} ${selectedCategory === 'all' ? styles.chipActive : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`${styles.chip} ${selectedCategory === cat ? styles.chipActive : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {grouped.length === 0 ? (
        <div className={styles.empty}>
          <p>Nothing matches that search. Try a broader term.</p>
        </div>
      ) : (
        grouped.map((group) => (
          <section key={group.category} className={styles.group}>
            <h3 className={styles.groupHead}>{group.category}</h3>
            <div className={styles.grid}>
              {group.items.map((h) => (
                <div key={h.id} className={styles.card}>
                  <div className={styles.cardHead}>
                    <code className={styles.name}>{h.name}</code>
                    <span className={styles.source}>{h.source}</span>
                  </div>
                  <p className={styles.description}>{h.description}</p>
                  <div className={styles.cardFoot}>
                    {h.npmPackage && (
                      <button
                        type="button"
                        className={styles.installBtn}
                        onClick={() => copyInstall(h.id, h.npmPackage!)}
                        aria-label={`Copy npm install ${h.npmPackage}`}
                      >
                        {copiedId === h.id ? <Check size={11} /> : <Copy size={11} />}
                        {copiedId === h.id ? 'Copied' : `npm install ${h.npmPackage}`}
                      </button>
                    )}
                    <a
                      href={h.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.docs}
                    >
                      Docs
                      <ArrowUpRight size={11} strokeWidth={2} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
};
