import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Check, Copy, CornerDownLeft, RotateCcw } from 'lucide-react';
import { ask, askEngine, promptFor, promptForAll } from '../../lib/ask';
import type { AskMatch, AskResponse } from '../../lib/ask';
import libraries from '../../data/libraries.json';
import { DotMark } from '../brand/DotMark';
import { DotmSquare3 } from '../ui/dotm-square-3';
import { DotmSquare5 } from '../ui/dotm-square-5';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Kbd } from '../ui/kbd';
import { Conversation, ConversationContent, ConversationScrollButton } from '../ai-elements/conversation';
import { Message, MessageContent } from '../ai-elements/message';
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from '../ai-elements/prompt-input';
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

type Message =
  | { id: string; role: 'user'; text: string }
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
  const [copied, copy] = useCopy();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const libs = libraries as Array<{ indexed: number }>;
  const libraryCount = libs.filter((l) => l.indexed > 0).length;
  const componentCount = libs.reduce((n, l) => n + l.indexed, 0);
  const busy = messages.some((m) => m.role === 'assistant' && m.status === 'thinking');

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || busy) return;
    const answerId = uid();
    setMessages((m) => [
      ...m,
      { id: uid(), role: 'user', text },
      { id: answerId, role: 'assistant', status: 'thinking', request: text },
    ]);
    setQuery('');
    const update = (status: 'ranking' | 'done', response: AskResponse) =>
      setMessages((m) =>
        m.map((msg) => (msg.id === answerId ? { id: answerId, role: 'assistant', status, request: text, response } : msg))
      );
    const finish = (response: AskResponse) => update('done', response);
    try {
      finish(await ask(text, 8, { onCandidates: (partial) => update('ranking', partial) }));
    } catch {
      finish({ query: text, mode: 'search', summary: null, matches: [] });
    } finally {
      inputRef.current?.focus();
    }
  };

  const reset = () => {
    setMessages([]);
    setQuery('');
    inputRef.current?.focus();
  };

  const composer = (
    <PromptInput className={styles.form} onSubmit={({ text }) => void send(text)}>
      <PromptInputBody>
        <PromptInputTextarea
          ref={inputRef}
          className={styles.input}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          placeholder={messages.length ? 'Ask for another component' : 'I need a loader for a checkout page'}
          aria-label="What do you need?"
        />
      </PromptInputBody>
      <PromptInputFooter className={styles.footer}>
        <PromptInputTools className={styles.hints}>
          <span>
            <Kbd>↵</Kbd> send
          </span>
          <span>
            <Kbd>⇧ ↵</Kbd> new line
          </span>
          <span className={styles.engine}>{ENGINE_LINE[askEngine]}</span>
          {messages.length > 0 && (
            <Button type="button" variant="ghost" size="xs" onClick={reset} className={styles.reset}>
              <RotateCcw /> New thread
            </Button>
          )}
        </PromptInputTools>
        <PromptInputSubmit
          size="sm"
          status={busy ? 'submitted' : undefined}
          disabled={busy || !query.trim()}
          className={styles.send}
          aria-label={busy ? 'Searching' : 'Find it'}
        >
          {busy ? (
            <>
              <DotmSquare3 size={14} dotSize={2} ariaLabel="Searching" /> Searching
            </>
          ) : (
            <>
              Find it <CornerDownLeft />
            </>
          )}
        </PromptInputSubmit>
      </PromptInputFooter>
    </PromptInput>
  );

  if (messages.length === 0) {
    return (
      <div className={styles.landing}>
        <div className={styles.empty}>
          <h1 className={styles.welcome}>Describe the component. Get the install command.</h1>
          <p className={styles.welcomeNote}>
            {libraryCount} libraries and {componentCount.toLocaleString()} components are indexed. Ask in plain words;
            the answer is a one-line install for your terminal or your coding agent.
          </p>
          <div className={styles.heroComposer}>{composer}</div>
          <div className={styles.suggestionsBlock}>
            <span className="eyebrow">Try one</span>
            <div className={styles.suggestions}>
              {EXAMPLES.map((ex) => (
                <Suggestion key={ex} suggestion={ex} onClick={(s) => void send(s)} className={styles.suggestion} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chat}>
      <Conversation className={styles.thread}>
        <ConversationContent className={styles.threadInner}>
          {messages.map((m) =>
            m.role === 'user' ? (
              <Message key={m.id} from="user" className={styles.userRow}>
                <MessageContent className={styles.bubble}>{m.text}</MessageContent>
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
      <div className={styles.composer}>{composer}</div>
    </div>
  );
}
