import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  Check,
  Copy,
  Github,
  X,
} from 'lucide-react';
import { libraries, type Library } from '../../data/libraries';
import { useAppStore } from '../../store/appStore';
import styles from './LibraryDetailView.module.css';

type PkgManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

const PKG_MANAGERS: PkgManager[] = ['npm', 'pnpm', 'yarn', 'bun'];

function installCommand(pm: PkgManager, pkg: string): string {
  switch (pm) {
    case 'npm':
      return `npm install ${pkg}`;
    case 'pnpm':
      return `pnpm add ${pkg}`;
    case 'yarn':
      return `yarn add ${pkg}`;
    case 'bun':
      return `bun add ${pkg}`;
  }
}

export const LibraryDetailView = () => {
  const id = useAppStore((s) => s.selectedLibraryId);
  const closeLibraryDetail = useAppStore((s) => s.closeLibraryDetail);
  const openLibraryDetail = useAppStore((s) => s.openLibraryDetail);
  const bookmarks = useAppStore((s) => s.bookmarks);
  const toggleBookmark = useAppStore((s) => s.toggleBookmark);
  const showToast = useAppStore((s) => s.showToast);

  const lib = useMemo<Library | undefined>(() => libraries.find((l) => l.id === id), [id]);

  const alternatives = useMemo<Library[]>(() => {
    if (!lib?.alternatives) return [];
    return lib.alternatives
      .map((altId) => libraries.find((l) => l.id === altId))
      .filter((l): l is Library => Boolean(l));
  }, [lib]);

  const [pm, setPm] = useState<PkgManager>('npm');
  const [copied, setCopied] = useState(false);

  if (!lib) {
    return (
      <div className={styles.page}>
        <button className={styles.back} onClick={closeLibraryDetail}>
          <ArrowLeft size={14} strokeWidth={2} />
          Back to libraries
        </button>
        <div className={styles.empty}>Library not found.</div>
      </div>
    );
  }

  const isBookmarked = bookmarks.includes(lib.id);
  const cmd = lib.npmPackage ? installCommand(pm, lib.npmPackage) : null;
  const githubUrl = lib.github ? `https://github.com/${lib.github}` : null;

  const copy = async () => {
    if (!cmd) return;
    try {
      await navigator.clipboard.writeText(cmd);
      setCopied(true);
      showToast('Copied install command', 'success');
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      showToast('Could not copy — clipboard blocked', 'error');
    }
  };

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={closeLibraryDetail}>
        <ArrowLeft size={14} strokeWidth={2} />
        Back to libraries
      </button>

      {/* Hero */}
      <header className={styles.hero}>
        <div className={styles.logo} style={{ background: lib.accent }}>
          {lib.initials}
        </div>

        <div className={styles.heroBody}>
          <span className={styles.eyebrow}>Component library</span>
          <h1 className={styles.name}>{lib.name}</h1>
          <p className={styles.tagline}>{lib.tagline ?? lib.description}</p>

          <div className={styles.metaRow}>
            {lib.framework.map((fw) => (
              <span key={fw} className={styles.tag}>
                {fw}
              </span>
            ))}
            <span className={styles.tag}>{lib.styling}</span>
            <span
              className={`${styles.tag} ${
                lib.pricing === 'Paid'
                  ? styles.tagPro
                  : lib.pricing === 'Free + Pro'
                    ? styles.tagPro
                    : styles.tagFree
              }`}
            >
              {lib.pricing}
            </span>
            {lib.typescript && <span className={`${styles.tag} ${styles.tagTs}`}>TypeScript</span>}
            {lib.highlight && <span className={styles.tag}>{lib.highlight}</span>}
          </div>
        </div>

        <div className={styles.actions}>
          <a href={lib.url} target="_blank" rel="noopener noreferrer" className={styles.btnPrimary}>
            Visit site
            <ArrowUpRight size={13} strokeWidth={2} />
          </a>
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnSecondary}
            >
              <Github size={13} strokeWidth={2} />
              GitHub
            </a>
          )}
          <button
            className={styles.btnSecondary}
            onClick={() => {
              toggleBookmark(lib.id);
              showToast(
                isBookmarked ? `Removed ${lib.name} from bookmarks` : `Bookmarked ${lib.name}`,
                'success'
              );
            }}
          >
            {isBookmarked ? (
              <>
                <BookmarkCheck size={13} strokeWidth={2} />
                Bookmarked
              </>
            ) : (
              <>
                <Bookmark size={13} strokeWidth={2} />
                Bookmark
              </>
            )}
          </button>
        </div>
      </header>

      {/* Install */}
      {cmd && (
        <section className={styles.section}>
          <h2 className={styles.sectionHead}>Install</h2>
          <div className={styles.installTabs}>
            {PKG_MANAGERS.map((m) => (
              <button
                key={m}
                className={styles.installTab}
                data-active={pm === m}
                onClick={() => setPm(m)}
              >
                {m}
              </button>
            ))}
          </div>
          <div className={styles.installRow}>
            <code className={styles.installCmd}>{cmd}</code>
            <button className={styles.copyBtn} onClick={copy} aria-label="Copy install command">
              {copied ? <Check size={12} strokeWidth={2} /> : <Copy size={12} strokeWidth={2} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </section>
      )}

      {/* Pros / cons */}
      {(lib.pros?.length || lib.cons?.length) && (
        <section className={styles.section}>
          <h2 className={styles.sectionHead}>Strengths &amp; trade-offs</h2>
          <div className={styles.prosCons}>
            <div>
              <h3 className={styles.sectionHead} style={{ color: 'rgb(82, 183, 136)' }}>
                What it does well
              </h3>
              <ul className={styles.list}>
                {lib.pros?.map((p, i) => (
                  <li key={i} className={styles.listItem}>
                    <Check size={14} strokeWidth={2.4} className={styles.iconPro} />
                    <span>{p}</span>
                  </li>
                )) ?? <li className={styles.listItem}>—</li>}
              </ul>
            </div>
            <div>
              <h3 className={styles.sectionHead} style={{ color: 'rgb(244, 162, 97)' }}>
                Trade-offs
              </h3>
              <ul className={styles.list}>
                {lib.cons?.map((c, i) => (
                  <li key={i} className={styles.listItem}>
                    <X size={14} strokeWidth={2.4} className={styles.iconCon} />
                    <span>{c}</span>
                  </li>
                )) ?? <li className={styles.listItem}>—</li>}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Alternatives */}
      {alternatives.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionHead}>Worth comparing</h2>
          <div className={styles.altGrid}>
            {alternatives.map((alt) => (
              <button
                key={alt.id}
                className={styles.altCard}
                onClick={() => openLibraryDetail(alt.id)}
              >
                <span className={styles.altLogo} style={{ background: alt.accent }}>
                  {alt.initials}
                </span>
                <span className={styles.altBody}>
                  <span className={styles.altName}>{alt.name}</span>
                  <span className={styles.altSub}>{alt.framework.join(' · ')}</span>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
