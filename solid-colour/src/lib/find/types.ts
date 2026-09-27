/**
 * The wire format between /api/find and the app. Shared by the server and the client so both
 * sides agree on every event.
 */

export type SiteType = 'components' | 'library' | 'inspiration';

/** One entry of Garden's hand-picked list (src/data/sites.json). */
export interface Site {
  id: string;
  name: string;
  url: string;
  type: SiteType;
  github?: string;
  paid?: boolean;
}

export interface FindRequest {
  query: string;
  /** Restrict the recommendations to one kind of site; `any` mixes them. */
  type?: SiteType | 'any';
  /** How many sites to recommend. */
  count?: number;
}

export interface Evidence {
  title: string;
  url: string;
}

export interface SiteResult {
  rank: number;
  name: string;
  /** The page to open: a specific section when the evidence points to one, else the homepage. */
  url: string;
  domain: string;
  /** In Garden's own list, or found on the web for this request. */
  origin: 'garden' | 'web';
  type: SiteType | null;
  paid: boolean;
  why: string;
  /** What to look at once there. */
  lookFor: string;
  evidence: Evidence[];
  /** From the live page. */
  title: string | null;
  description: string | null;
  image: string | null;
}

export type FindEvent =
  | { type: 'stage'; id: 'search' | 'judge' | 'verify'; label: string }
  | { type: 'note'; text: string }
  /** Which providers answered, and when a cached answer was first made. */
  | { type: 'meta'; search: string; judge: string; cachedAt?: number }
  | { type: 'sources'; queries: string[]; items: Evidence[] }
  | { type: 'result'; site: SiteResult }
  | { type: 'summary'; text: string }
  | { type: 'error'; message: string }
  | { type: 'done'; ms: number; checked: number };
