import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  Blocks,
  Check,
  Copy,
  Eye,
  Layers,
  RotateCcw,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';
import { findSites } from '../../lib/find';
import type { Evidence, FindEvent, SiteResult, SiteType } from '../../lib/find';
import sites from '../../data/sites.json';
import { Button } from '../ui/button';
import { Kbd } from '../ui/kbd';
import { PromptInput, type PromptInputOption } from '../ui/ai-chat-input';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '../ai-elements/conversation';
import { Message, MessageContent } from '../ai-elements/message';
import { Loader } from '../ai-elements/loader';
import { DotMark } from '../brand/DotMark';
import { LandingHero, LandingSections } from './Landing';
import styles from './AskView.module.css';

type Filter = SiteType | 'any';

const FILTERS: Array<PromptInputOption & { value: Filter }> = [
  { value: 'any', label: 'Any site', icon: <Layers /> },
  { value: 'components', label: 'Component libraries', icon: <Blocks /> },
  { value: 'inspiration', label: 'Inspiration', icon: <Eye /> },
  { value: 'library', label: 'Animation & UI', icon: <Sparkles /> },
];
const COUNTS = [3, 6, 9];
const COUNT_LABELS = COUNTS.map((n) => `${n} sites`);

const TYPE_LABEL: Record<SiteType, string> = {
  components: 'Components',
  library: 'Library',
  inspiration: 'Inspiration',
};

interface Turn {
  id: string;
  query: string;
  filter: Filter;
  count: number;
  status: 'running' | 'done' | 'error';
  stages: Array<{ id: string; label: string }>;
  notes: string[];
  queries: string[];
  sources: Evidence[];
  results: SiteResult[];
  summary: string | null;
  error: string | null;
  ms: number | null;
  via: { search: string; judge: string; cachedAt?: number } | null;
}

let nextId = 0;
const uid = () => `t${++nextId}`;

function reduce(turn: Turn, e: FindEvent): Turn {
  switch (e.type) {
    case 'stage':
      return { ...turn, stages: [...turn.stages, { id: e.id, label: e.label }] };
    case 'note':
      return { ...turn, notes: [...turn.notes, e.text] };
    case 'meta':
      return { ...turn, via: { search: e.search, judge: e.judge, cachedAt: e.cachedAt } };
    case 'sources':
      return { ...turn, queries: e.queries, sources: e.items };
    case 'result':
      return { ...turn, results: [...turn.results, e.site] };
    case 'summary':
      return { ...turn, summary: e.text };
    case 'error':
      return { ...turn, status: 'error', error: e.message };
    case 'done':
      return { ...turn, status: turn.status === 'error' ? 'error' : 'done', ms: e.ms };
  }
}

function useCopy(): [string | null, (key: string, text: string) => void] {
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  const copy = (key: string, text: string) => {
    void navigator.clipboard.writeText(text);
    setCopied(key);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(null), 1500);
  };
  return [copied, copy];
}

/** "3 hours ago" for cached answers. */
function ago(at: number): string {
  const mins = Math.round((Date.now() - at) / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.round(hours / 24)} d ago`;
}

const host = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

/** Counts up while a turn runs, so a long answer visibly keeps working. */
function Elapsed({ since }: { since: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  return <span className={styles.elapsed}>{Math.max(0, Math.round((now - since) / 1000))}s</span>;
}

function SiteCard({
  site,
  copied,
  copy,
}: {
  site: SiteResult;
  copied: string | null;
  copy: (k: string, t: string) => void;
}) {
  const [imageOk, setImageOk] = useState(Boolean(site.image));
  const key = `link:${site.url}`;
  return (
    <article className={styles.card}>
      <a
        className={styles.preview}
        href={site.url}
        target="_blank"
        rel="noreferrer noopener"
        tabIndex={-1}
        aria-hidden
      >
        {imageOk && site.image ? (
          <img
            src={site.image}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImageOk(false)}
          />
        ) : (
          <span className={styles.previewEmpty}>
            <img
              src={new URL('/favicon.ico', site.url).toString()}
              alt=""
              referrerPolicy="no-referrer"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
            {site.domain}
          </span>
        )}
        <span className={styles.rank}>{String(site.rank).padStart(2, '0')}</span>
      </a>
      <div className={styles.cardBody}>
        <div className={styles.cardHead}>
          <div className={styles.cardTitleBlock}>
            <h3 className={styles.cardTitle}>{site.name}</h3>
            <p className={styles.cardMeta}>
              {host(site.url)}
              {site.url.replace(/\/$/, '') !== new URL(site.url).origin
                ? ` · ${new URL(site.url).pathname}`
                : ''}
            </p>
          </div>
          <div className={styles.badges}>
            {site.type && <span className={styles.badge}>{TYPE_LABEL[site.type]}</span>}
            {site.paid && <span className={styles.badge}>Paid</span>}
            <span className={`${styles.badge} ${site.origin === 'web' ? styles.badgeWeb : ''}`}>
              {site.origin === 'garden' ? 'In Garden' : 'Found on the web'}
            </span>
          </div>
        </div>
        <p className={styles.why}>{site.why}</p>
        {site.lookFor && (
          <p className={styles.lookFor}>
            <span>Look for</span> {site.lookFor}
          </p>
        )}
        {site.evidence.length > 0 && (
          <div className={styles.evidence}>
            <span className={styles.evidenceLabel}>Backed by</span>
            {site.evidence.map((ev) => (
              <a
                key={ev.url}
                href={ev.url}
                target="_blank"
                rel="noreferrer noopener"
                title={ev.url}
              >
                {host(ev.url)}
              </a>
            ))}
          </div>
        )}
        <div className={styles.actions}>
          <Button asChild size="sm" className={styles.visit}>
            <a href={site.url} target="_blank" rel="noreferrer noopener">
              Visit {site.domain} <ArrowUpRight />
            </a>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => copy(key, site.url)}
            className={styles.copyLink}
          >
            {copied === key ? <Check /> : <Copy />} {copied === key ? 'Copied' : 'Copy link'}
          </Button>
        </div>
      </div>
    </article>
  );
}

function Progress({ turn, since }: { turn: Turn; since: number }) {
  const running = turn.status === 'running';
  if (running) {
    return (
      <ol className={styles.stages} aria-live="polite">
        {turn.stages.map((s, i) => {
          const current = i === turn.stages.length - 1;
          return (
            <li key={s.id} className={current ? styles.stageCurrent : styles.stageDone}>
              {current ? <Loader size={13} /> : <Check size={13} />}
              <span>{s.label}</span>
              {current && <Elapsed since={since} />}
            </li>
          );
        })}
        {turn.stages.length === 0 && (
          <li className={styles.stageCurrent}>
            <Loader size={13} /> <span>Starting</span>
          </li>
        )}
      </ol>
    );
  }
  return (
    <details className={styles.trail}>
      <summary>
        {turn.via?.cachedAt
          ? `Saved answer from ${ago(turn.via.cachedAt)}, links checked then`
          : `${turn.sources.length > 0 ? `Read ${turn.sources.length} web sources` : 'Judged from Garden’s list'} · opened ${
              turn.results.length
            } ${turn.results.length === 1 ? 'site' : 'sites'} live${turn.ms ? ` · ${Math.round(turn.ms / 1000)}s` : ''}`}
      </summary>
      {turn.via && (
        <p className={styles.trailQueries}>
          Searched with {turn.via.search} · judged by {turn.via.judge}
        </p>
      )}
      {turn.queries.length > 0 && (
        <p className={styles.trailQueries}>Searched: {turn.queries.join(' · ')}</p>
      )}
      <ul>
        {turn.sources.map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noreferrer noopener">
              {s.url.replace(/^https?:\/\/(www\.)?/, '')}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}

function AnswerTurn({
  turn,
  onRetry,
  copied,
  copy,
}: {
  turn: Turn;
  onRetry: () => void;
  copied: string | null;
  copy: (k: string, t: string) => void;
}) {
  const [since] = useState(() => Date.now());
  return (
    <Message from="assistant" className={styles.assistantRow}>
      <div className={styles.avatar}>
        <DotMark size={20} animate={turn.status === 'running'} />
      </div>
      <MessageContent className={styles.assistantContent}>
        <Progress turn={turn} since={since} />
        {turn.notes.map((n) => (
          <p key={n} className={styles.note}>
            {n}
          </p>
        ))}
        {turn.summary && <p className={styles.summary}>{turn.summary}</p>}
        {turn.results.length > 0 && (
          <div className={styles.grid}>
            {turn.results.map((r) => (
              <SiteCard key={r.url} site={r} copied={copied} copy={copy} />
            ))}
          </div>
        )}
        {turn.status === 'error' && (
          <div className={styles.error} role="alert">
            <TriangleAlert size={15} />
            <p>{turn.error}</p>
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              <RotateCcw /> Try again
            </Button>
          </div>
        )}
      </MessageContent>
    </Message>
  );
}

export function AskView() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('any');
  const [countIndex, setCountIndex] = useState(1);
  const [copied, copy] = useCopy();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const aborts = useRef(new Set<AbortController>());
  const busy = turns.some((t) => t.status === 'running');
  const landing = turns.length === 0;

  useEffect(() => {
    const live = aborts.current;
    return () => live.forEach((a) => a.abort());
  }, []);

  const run = async (text: string, f: Filter, count: number, replaceId?: string) => {
    const id = replaceId ?? uid();
    const fresh: Turn = {
      id,
      query: text,
      filter: f,
      count,
      status: 'running',
      stages: [],
      notes: [],
      queries: [],
      sources: [],
      results: [],
      summary: null,
      error: null,
      ms: null,
      via: null,
    };
    setTurns((ts) => (replaceId ? ts.map((t) => (t.id === id ? fresh : t)) : [...ts, fresh]));
    const ac = new AbortController();
    aborts.current.add(ac);
    await findSites(
      { query: text, type: f, count },
      (e) => setTurns((ts) => ts.map((t) => (t.id === id ? reduce(t, e) : t))),
      ac.signal
    );
    aborts.current.delete(ac);
    inputRef.current?.focus({ preventScroll: true });
  };

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text || busy) return;
    setQuery('');
    void run(text, filter, COUNTS[countIndex]);
  };

  const reset = () => {
    aborts.current.forEach((a) => a.abort());
    aborts.current.clear();
    setTurns([]);
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div className={styles.root} data-state={landing ? 'landing' : 'chat'}>
      {landing ? (
        <LandingHero onStart={() => inputRef.current?.focus()} onAsk={(text) => send(text)} />
      ) : (
        <Conversation className={styles.thread}>
          <ConversationContent className={styles.threadInner}>
            {turns.map((t) => (
              <div key={t.id} className={styles.turn}>
                <Message from="user" className={styles.userRow}>
                  <MessageContent className={styles.bubble}>{t.query}</MessageContent>
                  {t.filter !== 'any' && (
                    <span className={styles.bubbleScope}>
                      {FILTERS.find((f) => f.value === t.filter)?.label} only
                    </span>
                  )}
                </Message>
                <AnswerTurn
                  turn={t}
                  onRetry={() => void run(t.query, t.filter, t.count, t.id)}
                  copied={copied}
                  copy={copy}
                />
              </div>
            ))}
          </ConversationContent>
          <ConversationScrollButton
            className={styles.scrollButton}
            aria-label="Scroll to the latest"
          />
        </Conversation>
      )}

      {/* One composer for both states: it glides from the hero to the dock instead of remounting. */}
      <motion.div
        layout="position"
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        className={styles.dock}
      >
        <PromptInput
          inputRef={inputRef}
          className={styles.prompt}
          value={query}
          onChange={setQuery}
          onSubmit={(text) => send(text)}
          placeholder={landing ? 'What are you designing?' : 'Ask about something else…'}
          inputLabel="What do you need?"
          models={FILTERS}
          model={filter}
          onModelChange={(v) => setFilter(v as Filter)}
          efforts={COUNT_LABELS}
          effortIndex={countIndex}
          onEffortChange={setCountIndex}
          allowAttachments={false}
          collapsible={landing}
          collapsedWidth={340}
          expandedWidth={landing ? 640 : 720}
          busy={busy}
          autoFocus={!landing}
        />
        <div className={styles.dockMeta} hidden={landing}>
          <span className={styles.hints}>
            <Kbd>↵</Kbd> send <Kbd>⇧ ↵</Kbd> new line
          </span>
          <span className={styles.engine}>
            Searched live across the web and {sites.length} hand-picked sites
          </span>
          <Button type="button" variant="ghost" size="xs" onClick={reset} className={styles.reset}>
            <RotateCcw /> New thread
          </Button>
        </div>
      </motion.div>

      {landing && (
        <LandingSections
          onAsk={(text) => {
            window.scrollTo({ top: 0 });
            send(text);
          }}
          onStart={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            inputRef.current?.focus({ preventScroll: true });
          }}
        />
      )}
    </div>
  );
}
