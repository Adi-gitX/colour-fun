import { useMemo } from 'react';
import { ArrowUpRight, Github } from 'lucide-react';
import libraries from '../../data/libraries.json';
import { useAppStore } from '../../store/appStore';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import styles from './LibrariesView.module.css';

interface Library {
  id: string;
  name: string;
  kind: string;
  status: string;
  homepage: string;
  github: string | null;
  license: string;
  installs: 'shadcn' | 'npm' | 'copy';
  indexed: number;
}

const STATUS_LABEL: Record<string, string> = {
  live: 'Indexed',
  'auth-required': 'Needs API key',
  'rate-limited': 'Rate limited',
  pending: 'Queued',
  paid: 'Paid',
  blocked: 'Unavailable',
  unresolved: 'Unresolved',
};
const INSTALL_LABEL: Record<string, string> = {
  shadcn: 'shadcn CLI',
  npm: 'npm package',
  copy: 'Copy the code',
};
const KIND_LABEL: Record<string, string> = {
  'shadcn-registry': 'shadcn registry',
  'github-repo': 'GitHub repository',
  'npm-package': 'npm package',
  'html-snippets': 'HTML snippets',
  inspiration: 'Inspiration',
};

export function LibrariesView() {
  const setCurrentSection = useAppStore((s) => s.setCurrentSection);
  const libs = libraries as unknown as Library[];

  const groups = useMemo(
    () =>
      [
        {
          title: 'Searchable now',
          note: 'Indexed. Ask for a component and these are searched.',
          libs: libs.filter((l) => l.indexed > 0),
        },
        {
          title: 'Being indexed',
          note: 'Reachable registries the indexer has not finished yet.',
          libs: libs.filter((l) => l.indexed === 0 && l.status === 'live'),
        },
        {
          title: 'Everything else',
          note: 'Need a key, are paid, or publish only HTML or inspiration.',
          libs: libs.filter((l) => l.indexed === 0 && l.status !== 'live'),
        },
      ].filter((g) => g.libs.length > 0),
    [libs]
  );

  const indexedLibs = libs.filter((l) => l.indexed > 0).length;
  const indexedComponents = libs.reduce((n, l) => n + l.indexed, 0);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headText}>
          <div className="eyebrow">Browse</div>
          <h1 className={styles.title}>Libraries</h1>
          <p className={styles.subtitle}>
            Every component library the finder knows about, with a direct link to each. Components
            install from their own library and keep their own licence and author.
          </p>
        </div>
        <dl className={styles.stats}>
          <div>
            <dt>Libraries</dt>
            <dd>{libs.length}</dd>
          </div>
          <div>
            <dt>Searchable</dt>
            <dd>{indexedLibs}</dd>
          </div>
          <div>
            <dt>Components</dt>
            <dd>{indexedComponents.toLocaleString()}</dd>
          </div>
        </dl>
      </header>

      {groups.map((g) => (
        <section key={g.title} className={styles.group}>
          <div className={styles.groupHead}>
            <h2 className={styles.groupTitle}>{g.title}</h2>
            <p className={styles.groupNote}>
              {g.note}{' '}
              <Badge variant="outline" className={styles.groupCount}>
                {g.libs.length}
              </Badge>
            </p>
          </div>
          <ScrollArea className={styles.scroll}>
            <div className={styles.grid}>
              {g.libs.map((lib) => (
                <article key={lib.id} className={styles.card}>
                  <div className={styles.cardHead}>
                    <h3 className={styles.name}>{lib.name}</h3>
                    <Badge
                      variant={lib.status === 'live' ? 'default' : 'outline'}
                      className={styles.status}
                    >
                      {STATUS_LABEL[lib.status] ?? lib.status}
                    </Badge>
                  </div>
                  <dl className={styles.meta}>
                    <div>
                      <dt>Install</dt>
                      <dd>{INSTALL_LABEL[lib.installs]}</dd>
                    </div>
                    <div>
                      <dt>Licence</dt>
                      <dd>{lib.license}</dd>
                    </div>
                    <div>
                      <dt>Source</dt>
                      <dd>{KIND_LABEL[lib.kind] ?? lib.kind}</dd>
                    </div>
                    {lib.indexed > 0 && (
                      <div>
                        <dt>Indexed</dt>
                        <dd>{lib.indexed.toLocaleString()}</dd>
                      </div>
                    )}
                  </dl>
                  <div className={styles.actions}>
                    <Button asChild variant="link" size="xs" className={styles.visit}>
                      <a href={lib.homepage} target="_blank" rel="noreferrer noopener">
                        Visit site <ArrowUpRight />
                      </a>
                    </Button>
                    {lib.github && (
                      <Button asChild variant="link" size="xs" className={styles.visit}>
                        <a
                          href={lib.github}
                          target="_blank"
                          rel="noreferrer noopener"
                          aria-label={`${lib.name} on GitHub`}
                        >
                          <Github /> GitHub
                        </a>
                      </Button>
                    )}
                    {lib.indexed > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        className={styles.askBtn}
                        onClick={() => setCurrentSection('home')}
                      >
                        Ask
                      </Button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </ScrollArea>
        </section>
      ))}
    </div>
  );
}
