import type { FindEvent, FindRequest } from './types';

export type * from './types';

/**
 * Ask Garden's server which sites are best for a request. Events arrive as the server works
 * (stages, web sources, each verified site, the summary) so the UI can show progress; the promise
 * settles when the stream ends. Failures are reported as `error` events, never swallowed.
 */
export async function findSites(
  req: FindRequest,
  onEvent: (e: FindEvent) => void,
  signal?: AbortSignal
): Promise<void> {
  let res: Response;
  try {
    res = await fetch('/api/find', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(req),
      signal,
    });
  } catch (err) {
    if (signal?.aborted) return;
    onEvent({
      type: 'error',
      message: `Could not reach Garden (${String(err)}). Check your connection and try again.`,
    });
    return;
  }
  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => '');
    let message = detail;
    try {
      message = (JSON.parse(detail) as { error?: string }).error ?? detail;
    } catch {
      // plain-text error body
    }
    onEvent({
      type: 'error',
      message: `Garden answered ${res.status}. ${message.slice(0, 160)}`.trim(),
    });
    return;
  }

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  // Watchdog: the server always ends an answer within ~100 s and sends progress as it goes, so a
  // long silence means the connection died. Stop waiting and say so instead of spinning forever.
  let silent: ReturnType<typeof setTimeout> | undefined;
  let stalled = false;
  const arm = () => {
    clearTimeout(silent);
    silent = setTimeout(() => {
      stalled = true;
      void reader.cancel();
    }, 70_000);
  };
  arm();
  let buffer = '';
  let ended = false;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      arm();
      buffer += value;
      let nl: number;
      while ((nl = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        if (!line) continue;
        const event = JSON.parse(line) as FindEvent;
        if (event.type === 'done') ended = true;
        onEvent(event);
      }
    }
  } catch (err) {
    clearTimeout(silent);
    if (signal?.aborted) return;
    onEvent({ type: 'error', message: `The answer was cut off (${String(err)}). Try again.` });
    return;
  }
  clearTimeout(silent);
  if (stalled && !ended) {
    onEvent({ type: 'error', message: 'Garden stopped responding. Try again.' });
    return;
  }
  if (!ended)
    onEvent({ type: 'error', message: 'The answer was cut off before it finished. Try again.' });
}
