import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Check, Code, Copy, Layers, Package, RotateCcw, Terminal } from 'lucide-react';
import { ask, askEngine, promptFor, promptForAll } from '../../lib/ask';
import type { AskMatch, AskResponse } from '../../lib/ask';
import libraries from '../../data/libraries.json';
import { DotMark } from '../brand/DotMark';
import { DotmSquare5 } from '../ui/dotm-square-5';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Kbd } from '../ui/kbd';
import { PromptInput, type PromptInputOption } from '../ui/ai-chat-input';
import { Conversation, ConversationContent, ConversationScrollButton } from '../ai-elements/conversation';
import { Message, MessageContent } from '../ai-elements/message';
import { Suggestion } from '../ai-elements/suggestion';
import { Loader } from '../ai-elements/loader';
import styles from './AskView.module.css';

const EXAMPLES = [
  'a loader for a checkout page',
  'a submit form with validation',
  'a landing page hero with an aurora background',
  'a testimonial carousel',
  'a pricing table with monthly and yearly',
  'a glassmorphism button',
];

/** Where results may install from; `any` leaves the ranking untouched. */
type Source = 'any' | 'shadcn' | 'npm' | 'copy';

const SOURCES: Array<PromptInputOption & { value: Source }> = [
  { value: 'any', label: 'Any source', icon: <Layers /> },
  { value: 'shadcn', label: 'shadcn registry', icon: <Terminal /> },
  { value: 'npm', label: 'npm package', icon: <Package /> },
  { value: 'copy', label: 'Copy-paste code', icon: <Code /> },
];

const RESULT_COUNTS = [4, 8, 12];
const RESULT_LABELS = RESULT_COUNTS.map((n) => `${n} results`);

type Message =
  | { id: string; role: 'user'; text: string; scope: string | null }
  | { id: string; role: 'assistant'; status: 'thinking'; request: string }
  | { id: string; role: 'assistant'; status: 'ranking' | 'done'; request: string; response: AskResponse };

let nextId = 0;
const uid = () => `m${++nextId}`;

const ENGINE_LINE: Record<typeof askEngine, string> = {
  gemini: 'Ranked by Gemini',
  api: 'Ranked by the Garden API',
  local: 'Ranked by search. Add a Gemini key in .env for explanations',
};

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

/** Rotates through status lines while mounted; the caller remounts it per request. */
function useStatusLine(lines: string[]) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setI((n) => (n + 1) % lines.length), 1100);
    return () => window.clearInterval(t);
  }, [lines]);
  return lines[i];
}

function CopyBlock({
  text,
  copyKey,
  copied,
  copy,
  label,
}: {
  text: string;
  copyKey: string;
  copied: string | null;
  copy: (k: string, t: string) => void;
  label: string;
}) {
  const done = copied === copyKey;
  return (
    <div className={styles.copyBlock}>
      <pre className={styles.copyText}>
        <code>{text}</code>
      </pre>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        className={styles.copyBtn}
        onClick={() => copy(copyKey, text)}
        aria-label={done ? 'Copied' : label}
      >
        {done ? <Check /> : <Copy />}
      </Button>
    </div>
  );
}

function MatchCard({
  match,
  request,
  rank,
  copied,
  copy,
}: {
  match: AskMatch;
  request: string;
  rank: number;
  copied: string | null;
  copy: (k: string, t: string) => void;
}) {
  const c = match.component;
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  const hasInstall = Boolean(c.installCommand);
  const hasCode = Boolean(c.code);
  return (
    <article className={styles.card}>
      {c.previewImage ? (
        <div className={styles.preview}>
          <img src={`${base}/${c.previewImage}`} alt="" loading="lazy" />
          <span className={styles.rank}>{String(rank).padStart(2, '0')}</span>
        </div>
      ) : (
        <div className={styles.previewEmpty} aria-hidden>
          <DotMark size={18} />
          <span className={styles.previewLibrary}>{c.library}</span>
          <span className={styles.rank}>{String(rank).padStart(2, '0')}</span>
        </div>
      )}
      <div className={styles.cardBody}>
        <div className={styles.cardHead}>
          <div className={styles.cardTitleBlock}>
            <h3 className={styles.cardTitle}>{c.title}</h3>
            <p className={styles.cardMeta}>
              <a href={c.sourceUrl} target="_blank" rel="noreferrer noopener">
                {c.library} <ArrowUpRight size={11} />
              </a>
              {c.author ? <span> · {c.author}</span> : null}
              <span> · {c.license}</span>
            </p>
          </div>
          <Badge variant="outline" className={styles.category}>
            {c.category.replace(/-/g, ' ')}
          </Badge>
        </div>
        {(match.why || c.description) && <p className={styles.why}>{match.why ?? c.description}</p>}

        <Tabs defaultValue={hasInstall ? 'install' : 'prompt'} className={styles.tabs}>
          <TabsList variant="line" className={styles.tabList}>
            {hasInstall && <TabsTrigger value="install">Install</TabsTrigger>}
            <TabsTrigger value="prompt">Prompt</TabsTrigger>
            {hasCode && <TabsTrigger value="code">Code</TabsTrigger>}
            <a className={styles.docsLink} href={c.docsUrl} target="_blank" rel="noreferrer noopener">
              Docs <ArrowUpRight size={11} />
            </a>
          </TabsList>
          {hasInstall && (
            <TabsContent value="install">
              <CopyBlock
                text={c.installCommand!}
                copyKey={`cmd:${c.slug}`}
                copied={copied}
                copy={copy}
                label="Copy install command"
              />
            </TabsContent>
          )}
          <TabsContent value="prompt">
            <CopyBlock
              text={promptFor(match, request)}
              copyKey={`prompt:${c.slug}`}
              copied={copied}
              copy={copy}
              label="Copy prompt for your agent"
            />
          </TabsContent>
          {hasCode && (
            <TabsContent value="code">
              <CopyBlock
                text={c.code!}
                copyKey={`code:${c.slug}`}
                copied={copied}
                copy={copy}
                label="Copy component code"
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </article>
  );
}

function AssistantMessage({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Message from="assistant" className={styles.assistantRow}>
      <div className={styles.avatar}>
        <DotMark size={22} />
      </div>
      <MessageContent className={`${styles.assistantContent} ${className ?? ''}`}>{children}</MessageContent>
    </Message>
  );
}

function ThinkingMessage({ libraryCount }: { libraryCount: number }) {
  const lines = useMemo(
    () =>
      askEngine === 'local'
        ? [`Searching ${libraryCount} libraries`]
        : [
            `Searching ${libraryCount} libraries`,
            'Matching meaning',
            askEngine === 'gemini' ? 'Asking Gemini' : 'Asking the Garden API',
          ],
    [libraryCount]
  );
  const line = useStatusLine(lines);
  return (
    <Message from="assistant" className={styles.assistantRow} role="status" aria-live="polite">
      <div className={styles.avatar}>
        <DotmSquare5 size={22} dotSize={3} ariaLabel="Thinking" />
      </div>
      <MessageContent className={`${styles.assistantContent} ${styles.thinking}`}>
        <Loader size={14} className={styles.thinkingSpinner} />
        <span className={styles.thinkingLine} key={line}>
          {line}
        </span>
      </MessageContent>
    </Message>
  );
}

function AnswerMessage({
  message,
  copied,
  copy,
}: {
  message: Extract<Message, { status: 'done' | 'ranking' }>;
  copied: string | null;
  copy: (k: string, t: string) => void;
}) {
  const { response, request, id } = message;
  const n = response.matches.length;
  const ranking = message.status === 'ranking';
  return (
    <AssistantMessage className={styles.answer}>
      <div className={styles.answerHead}>
        <p className={styles.answerLine} aria-live="polite">
          {n === 0
            ? 'Nothing close. Try fewer words, or the name of the thing itself: loader, hero, pricing, carousel.'
            : ranking
              ? `${n} candidates found. ${askEngine === 'gemini' ? 'Gemini' : 'The model'} is picking the best and explaining why`
              : `${n} ${n === 1 ? 'match' : 'matches'} across every indexed library, ${
                  response.mode === 'agent' ? 'picked and explained by the model.' : 'ranked by search.'
                }`}
          {ranking && <span className={styles.rankingDots} aria-hidden>…</span>}
        </p>
        {n > 1 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => copy(`all:${id}`, promptForAll(response.matches.slice(0, 4), request))}
          >
            {copied === `all:${id}` ? <Check /> : <Copy />}
            {copied === `all:${id}` ? 'Copied' : 'Copy top 4 as one prompt'}
          </Button>
        )}
      </div>
      {response.summary && <p className={styles.summary}>{response.summary}</p>}
      {n > 0 && (
        <div className={styles.grid}>
          {response.matches.map((m, i) => (
            <MatchCard key={m.component.slug} match={m} request={request} rank={i + 1} copied={copied} copy={copy} />
          ))}
        </div>
      )}
    </AssistantMessage>
  );
}

export function AskView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState('');
  const [source, setSource] = useState<Source>('any');
  const [countIndex, setCountIndex] = useState(1);
  const [copied, copy] = useCopy();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const libs = libraries as Array<{ indexed: number }>;
  const libraryCount = libs.filter((l) => l.indexed > 0).length;
  const componentCount = libs.reduce((n, l) => n + l.indexed, 0);
  const busy = messages.some((m) => m.role === 'assistant' && m.status === 'thinking');
  const landing = messages.length === 0;

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || busy) return;
    const k = RESULT_COUNTS[countIndex];
    const scoped = source !== 'any';
    const answerId = uid();
    setMessages((m) => [
      ...m,
      { id: uid(), role: 'user', text, scope: scoped ? SOURCES.find((s) => s.value === source)!.label : null },
      { id: answerId, role: 'assistant', status: 'thinking', request: text },
    ]);
    setQuery('');
    // A source filter over-fetches, then keeps the first k that install that way.
    const narrow = (r: AskResponse): AskResponse =>
      scoped ? { ...r, matches: r.matches.filter((m) => m.component.installKind === source).slice(0, k) } : r;
    const update = (status: 'ranking' | 'done', response: AskResponse) =>
      setMessages((m) =>
        m.map((msg) =>
          msg.id === answerId ? { id: answerId, role: 'assistant', status, request: text, response: narrow(response) } : msg
        )
      );
    try {
      update('done', await ask(text, scoped ? k * 3 : k, { onCandidates: (partial) => update('ranking', partial) }));
    } catch {
      update('done', { query: text, mode: 'search', summary: null, matches: [] });
    } finally {
      inputRef.current?.focus();
    }
  };

  const reset = () => {
    setMessages([]);
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div className={styles.root} data-state={landing ? 'landing' : 'chat'}>
      <div className={styles.aurora} aria-hidden />

      {landing ? (
        <section className={styles.hero}>
          <span className={styles.pill}>
            <span className={styles.pillDot} aria-hidden />
            {libraryCount} libraries · {componentCount.toLocaleString()} components indexed
          </span>
          <h1 className={styles.welcome}>
            Describe the component. <span className={styles.welcomeMuted}>Get the install command.</span>
          </h1>
          <p className={styles.welcomeNote}>
            Ask in plain words. Garden searches every indexed library at once and hands back a one-line install for
            your terminal or your coding agent.
          </p>
        </section>
      ) : (
        <Conversation className={styles.thread}>
          <ConversationContent className={styles.threadInner}>
            {messages.map((m) =>
              m.role === 'user' ? (
                <Message key={m.id} from="user" className={styles.userRow}>
                  <MessageContent className={styles.bubble}>{m.text}</MessageContent>
                  {m.scope && <span className={styles.bubbleScope}>{m.scope} only</span>}
                </Message>
              ) : m.status === 'thinking' ? (
                <ThinkingMessage key={m.id} libraryCount={libraryCount} />
              ) : (
                <AnswerMessage key={m.id} message={m} copied={copied} copy={copy} />
              )
            )}
          </ConversationContent>
          <ConversationScrollButton className={styles.scrollButton} aria-label="Scroll to the latest" />
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
          onSubmit={(text) => void send(text)}
          placeholder={landing ? 'I need a loader for a checkout page…' : 'Ask for another component…'}
          inputLabel="What do you need?"
          models={SOURCES}
          model={source}
          onModelChange={(v) => setSource(v as Source)}
          efforts={RESULT_LABELS}
          effortIndex={countIndex}
          onEffortChange={setCountIndex}
          allowAttachments={false}
          collapsible={false}
          expandedWidth={760}
          busy={busy}
          autoFocus
        />
        <div className={styles.dockMeta}>
          <span className={styles.hints}>
            <Kbd>↵</Kbd> send <Kbd>⇧ ↵</Kbd> new line
          </span>
          <span className={styles.engine}>{ENGINE_LINE[askEngine]}</span>
          {!landing && (
            <Button type="button" variant="ghost" size="xs" onClick={reset} className={styles.reset}>
              <RotateCcw /> New thread
            </Button>
          )}
        </div>
      </motion.div>

      {landing && (
        <div className={styles.suggestions}>
          {EXAMPLES.map((ex, i) => (
            <Suggestion
              key={ex}
              suggestion={ex}
              onClick={(s) => void send(s)}
              className={styles.suggestion}
              style={{ animationDelay: `${120 + i * 40}ms` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
