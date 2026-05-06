import { useState, useMemo } from 'react';
import styles from './PreviewImage.module.css';

interface Props {
  /** GitHub `owner/repo`. Tier 1 of the fallback chain. */
  github?: string;
  /** Canonical URL. Tier 2 (microlink screenshot) when no `github` is set. */
  url?: string;
  /** Display name — used to derive the deterministic gradient + initial. */
  name: string;
  /** Optional explicit gradient to use as the final fallback. */
  fallbackGradient?: string;
  className?: string;
}

type Source = 'github' | 'microlink' | 'gradient';

/**
 * Hash a string to a stable, evenly-distributed integer in [0, 360).
 */
function hashToHue(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h) % 360;
}

function deterministicGradient(name: string): string {
  const h1 = hashToHue(name);
  const h2 = (h1 + 50) % 360;
  return `linear-gradient(135deg, hsl(${h1} 70% 55%) 0%, hsl(${h2} 70% 45%) 100%)`;
}

function buildSrc(source: Source, github?: string, url?: string): string | null {
  if (source === 'github' && github) {
    return `https://opengraph.githubassets.com/1/${github}`;
  }
  if (source === 'microlink' && url) {
    const params = new URLSearchParams({
      url,
      screenshot: 'true',
      meta: 'false',
      embed: 'screenshot.url',
    });
    return `https://api.microlink.io/?${params.toString()}`;
  }
  return null;
}

interface State {
  /** Identity key — combination of github/url. When inputs change we reset. */
  inputKey: string;
  /** Sources that have already failed for this `inputKey`. */
  failed: Source[];
  /** Whether the current image has finished loading. */
  loaded: boolean;
}

/**
 * Tiered preview-image element.
 *
 * Tier 1 — GitHub Open Graph (instant, free, cached).
 * Tier 2 — Microlink screenshot of the canonical URL (slower, served live).
 * Tier 3 — Deterministic gradient from the name hash + a centered initial.
 *
 * State is reset during render when the inputs change — the React-recommended
 * pattern for "derived state, but with a memo across renders". `onError`
 * appends the failed tier to the list and re-derives `source`.
 */
export const PreviewImage = ({ github, url, name, fallbackGradient, className }: Props) => {
  const inputKey = `${github ?? ''}|${url ?? ''}`;

  const [state, setState] = useState<State>({ inputKey, failed: [], loaded: false });

  // Reset on input change — setState during render, the canonical React pattern
  // for "this prop is the input, here's the derived state".
  if (state.inputKey !== inputKey) {
    setState({ inputKey, failed: [], loaded: false });
  }

  const source: Source = useMemo(() => {
    if (github && !state.failed.includes('github')) return 'github';
    if (url && !state.failed.includes('microlink')) return 'microlink';
    return 'gradient';
  }, [github, url, state.failed]);

  const src = useMemo(() => buildSrc(source, github, url), [source, github, url]);

  const gradient = fallbackGradient ?? deterministicGradient(name);
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  if (source === 'gradient' || !src) {
    return (
      <div
        className={`${styles.preview} ${styles.gradient} ${className ?? ''}`}
        style={{ background: gradient }}
        aria-hidden
      >
        <span className={styles.initial}>{initial}</span>
      </div>
    );
  }

  return (
    <div
      className={`${styles.preview} ${className ?? ''}`}
      style={{ background: gradient }}
      aria-hidden
    >
      {!state.loaded && <span className={styles.skeleton} />}
      <img
        // key on source so React remounts the <img> across tiers — onLoad fires fresh.
        key={source}
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        className={styles.img}
        data-loaded={state.loaded || undefined}
        onLoad={() => setState((s) => ({ ...s, loaded: true }))}
        onError={() =>
          setState((s) => ({
            ...s,
            failed: s.failed.includes(source) ? s.failed : [...s.failed, source],
            loaded: false,
          }))
        }
      />
    </div>
  );
};
