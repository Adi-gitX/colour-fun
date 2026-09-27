import { ArrowUpRight, Github } from 'lucide-react';
import sitesJson from '../../data/sites.json';
import type { Site, SiteType } from '../../lib/find/types';
import { Button } from '../ui/button';
import styles from './LibrariesView.module.css';

const sites = sitesJson as Site[];

const GROUPS: Array<{ type: SiteType; title: string; note: string }> = [
  {
    type: 'components',
    title: 'Component libraries',
    note: 'Code you can install or copy: shadcn registries, Tailwind kits, React collections.',
  },
  {
    type: 'inspiration',
    title: 'Inspiration',
    note: 'Galleries of real sites and sections, for when you need to see what good looks like first.',
  },
  {
    type: 'library',
    title: 'Animation & UI libraries',
    note: 'Packages that power motion and interaction: GSAP, Motion, Lenis and more.',
  },
];

const host = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

/** Garden's hand-picked list. Every answer weighs these first, then the rest of the web. */
export function LibrariesView() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headText}>
          <div className="eyebrow">The list</div>
          <h1 className={styles.title}>Sites</h1>
          <p className={styles.subtitle}>
            The sites Garden trusts first. When you ask for something, these are weighed against
            what the web says today, and only the best few come back.
          </p>
        </div>
        <dl className={styles.stats}>
          <div>
            <dt>Sites</dt>
            <dd>{sites.length}</dd>
          </div>
          {GROUPS.slice(0, 2).map((g) => (
            <div key={g.type}>
              <dt>{g.type === 'components' ? 'Components' : 'Inspiration'}</dt>
              <dd>{sites.filter((s) => s.type === g.type).length}</dd>
            </div>
          ))}
        </dl>
      </header>

      {GROUPS.map((g) => {
        const list = sites.filter((s) => s.type === g.type);
        return (
          <section key={g.type} className={styles.group}>
            <div className={styles.groupHead}>
              <h2 className={styles.groupTitle}>{g.title}</h2>
              <p className={styles.groupNote}>
                {g.note} <span className={styles.groupCount}>{list.length}</span>
              </p>
            </div>
            <div className={styles.grid}>
              {list.map((site) => (
                <article key={site.id} className={styles.card}>
                  <div className={styles.cardHead}>
                    <h3 className={styles.name}>{site.name}</h3>
                    {site.paid && <span className={styles.status}>Paid</span>}
                  </div>
                  <p className={styles.domain}>{host(site.url)}</p>
                  <div className={styles.actions}>
                    <Button asChild variant="link" size="xs" className={styles.visit}>
                      <a href={site.url} target="_blank" rel="noreferrer noopener">
                        Visit <ArrowUpRight />
                      </a>
                    </Button>
                    {site.github && (
                      <Button asChild variant="link" size="xs" className={styles.visit}>
                        <a
                          href={site.github}
                          target="_blank"
                          rel="noreferrer noopener"
                          aria-label={`${site.name} on GitHub`}
                        >
                          <Github /> GitHub
                        </a>
                      </Button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
