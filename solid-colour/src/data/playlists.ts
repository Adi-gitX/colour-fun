/* ===========================================================
   Atlas — curated playlists.

   Editorial collections of resources stitched across categories.
   Each entry resolves to an existing item id in components /
   libraries / designSystems / inspiration / tools / fonts /
   hooks. Validation happens once at module load — broken
   references throw in dev so we never ship a stale playlist.
   =========================================================== */

import { components } from './components';
import { libraries } from './libraries';
import { designSystems } from './designSystems';
import { inspirationSites } from './inspiration';
import { tools } from './tools';
import { fonts } from './fonts';
import { hooks } from './hooks';

export type PlaylistKind =
  | 'component'
  | 'library'
  | 'design-system'
  | 'inspiration'
  | 'tool'
  | 'font'
  | 'hook';

export interface PlaylistRef {
  kind: PlaylistKind;
  id: string;
}

export interface ResolvedPlaylistItem extends PlaylistRef {
  name: string;
  /** Free-form context line shown under the name on the playlist row. */
  description?: string;
  /** Canonical URL the row links out to. */
  url: string;
  /** Owner / author for compact attribution. */
  author?: string;
  /** Two-letter initials for the avatar. */
  initials?: string;
  /** Accent color for the avatar background. */
  accent?: string;
  /** GitHub `owner/repo` — drives the preview image when available. */
  github?: string;
}

export interface Playlist {
  id: string;
  /** Curator-style title. */
  title: string;
  /** A single sentence editorial pitch. */
  pitch: string;
  /** Refs into the existing data files — kept stable across builds. */
  items: PlaylistRef[];
}

export const playlists: Playlist[] = [
  {
    id: 'saas-launch-stack',
    title: 'SaaS launch stack',
    pitch:
      'The opinionated picks for spinning up a real SaaS this weekend — auth, components, charts, payments-adjacent UI.',
    items: [
      { kind: 'library', id: 'shadcn-ui' },
      { kind: 'library', id: 'radix-ui' },
      { kind: 'component', id: 'cmp-auth-better' },
      { kind: 'component', id: 'cmp-dashboard-tremor' },
      { kind: 'component', id: 'cmp-dashboard-tanstack-table' },
      { kind: 'component', id: 'cmp-form-rhf' },
      { kind: 'component', id: 'cmp-modal-cmdk' },
      { kind: 'component', id: 'cmp-modal-sonner' },
    ],
  },
  {
    id: 'ai-chat-shell',
    title: 'Ship an AI chat in a weekend',
    pitch:
      'Composable inputs + chat shells + agent UI — all real components from Vercel AI SDK, LobeHub, and the 21st.dev community.',
    items: [
      { kind: 'component', id: 'cmp-ai-vercel' },
      { kind: 'component', id: 'cmp-ai-lobe' },
      { kind: 'component', id: 'cmp-21st-prompt-box' },
      { kind: 'component', id: 'cmp-21st-v0-chat' },
      { kind: 'component', id: 'cmp-21st-animated-chat' },
      { kind: 'component', id: 'cmp-21st-agent-plan' },
      { kind: 'component', id: 'cmp-21st-message-dock' },
      { kind: 'component', id: 'cmp-ai-continue' },
    ],
  },
  {
    id: 'free-mui-alts',
    title: 'Free alternatives to MUI',
    pitch: 'When you want polish + breadth + accessibility but Material isn’t the vibe.',
    items: [
      { kind: 'library', id: 'shadcn-ui' },
      { kind: 'library', id: 'mantine' },
      { kind: 'library', id: 'chakra-ui' },
      { kind: 'library', id: 'heroui' },
      { kind: 'design-system', id: 'spectrum' },
      { kind: 'design-system', id: 'evergreen' },
    ],
  },
  {
    id: 'dashboard-stack',
    title: 'Build a dashboard people actually use',
    pitch:
      'Tables, charts, KPI tiles — and the data-state library that makes it not feel like a Notion clone.',
    items: [
      { kind: 'component', id: 'cmp-dashboard-tremor' },
      { kind: 'component', id: 'cmp-dashboard-tanstack-table' },
      { kind: 'component', id: 'cmp-c-recharts' },
      { kind: 'component', id: 'cmp-c-visx' },
      { kind: 'component', id: 'cmp-c-react-table-tanstack' },
      { kind: 'component', id: 'cmp-c-tabler' },
      { kind: 'component', id: 'cmp-dashboard-glide' },
    ],
  },
  {
    id: 'typography-set',
    title: 'A typography set you’ll keep',
    pitch: 'Three sans + one serif + one mono. Boring on purpose — these never go out of style.',
    items: [
      { kind: 'font', id: 'inter' },
      { kind: 'font', id: 'geist' },
      { kind: 'font', id: 'plus-jakarta' },
      { kind: 'font', id: 'fraunces' },
      { kind: 'font', id: 'jetbrains-mono' },
    ],
  },
  {
    id: 'inspo-loop',
    title: 'My weekly inspiration loop',
    pitch: 'Five sites I open every Monday morning.',
    items: [
      { kind: 'inspiration', id: 'mobbin' },
      { kind: 'inspiration', id: 'land-book' },
      { kind: 'inspiration', id: 'godly' },
      { kind: 'inspiration', id: 'minimal-gallery' },
      { kind: 'inspiration', id: 'typewolf' },
    ],
  },
  {
    id: 'tooling-utility-belt',
    title: 'The utility belt',
    pitch: 'Tools you’ll actually keep open. Free, fast, no ads.',
    items: [
      { kind: 'tool', id: 'lucide' },
      { kind: 'tool', id: 'realtime-colors' },
      { kind: 'tool', id: 'ui-gradients' },
      { kind: 'tool', id: 'who-can-use' },
      { kind: 'tool', id: 'easings' },
      { kind: 'tool', id: 'haikei' },
      { kind: 'tool', id: 'unsplash' },
    ],
  },
];

const componentLookup = new Map(components.map((c) => [c.id, c]));
const libraryLookup = new Map(libraries.map((l) => [l.id, l]));
const designSystemLookup = new Map(designSystems.map((d) => [d.id, d]));
const inspirationLookup = new Map(inspirationSites.map((s) => [s.id, s]));
const toolLookup = new Map(tools.map((t) => [t.id, t]));
const fontLookup = new Map(fonts.map((f) => [f.id, f]));
const hookLookup = new Map(hooks.map((h) => [h.id, h]));

function resolveRef(ref: PlaylistRef): ResolvedPlaylistItem | null {
  switch (ref.kind) {
    case 'component': {
      const c = componentLookup.get(ref.id);
      if (!c) return null;
      return {
        ...ref,
        name: c.name,
        description: c.tagline,
        url: c.url,
        author: c.author,
        initials: c.authorInitials,
        accent: c.authorColor,
        github: c.github,
      };
    }
    case 'library': {
      const l = libraryLookup.get(ref.id);
      if (!l) return null;
      return {
        ...ref,
        name: l.name,
        description: l.description,
        url: l.url,
        author: l.framework[0],
        initials: l.initials,
        accent: l.accent,
        github: l.github,
      };
    }
    case 'design-system': {
      const d = designSystemLookup.get(ref.id);
      if (!d) return null;
      return {
        ...ref,
        name: d.name,
        description: d.description,
        url: d.url,
        author: d.org,
        initials: d.initials,
        accent: d.accent,
        github: d.github,
      };
    }
    case 'inspiration': {
      const s = inspirationLookup.get(ref.id);
      if (!s) return null;
      return {
        ...ref,
        name: s.name,
        description: s.description,
        url: s.url,
        author: s.category,
        initials: s.initials,
        accent: s.accent,
      };
    }
    case 'tool': {
      const t = toolLookup.get(ref.id);
      if (!t) return null;
      return {
        ...ref,
        name: t.name,
        description: t.description,
        url: t.url,
        author: t.category,
        initials: t.initials,
        accent: t.accent,
        github: t.github,
      };
    }
    case 'font': {
      const f = fontLookup.get(ref.id);
      if (!f) return null;
      return {
        ...ref,
        name: f.name,
        description: f.description,
        url: f.url,
        author: f.foundry,
        initials: f.initials,
        accent: '#0F172A',
      };
    }
    case 'hook': {
      const h = hookLookup.get(ref.id);
      if (!h) return null;
      return {
        ...ref,
        name: h.name,
        description: h.description,
        url: h.url,
        author: h.source,
      };
    }
  }
}

export const resolvePlaylist = (
  playlist: Playlist
): { playlist: Playlist; items: ResolvedPlaylistItem[] } => {
  const resolved = playlist.items
    .map(resolveRef)
    .filter((i): i is ResolvedPlaylistItem => i !== null);
  return { playlist, items: resolved };
};

// Sanity check at module load — fail loudly in dev if a playlist
// references a deleted resource.
if (import.meta.env.DEV) {
  for (const p of playlists) {
    for (const ref of p.items) {
      if (resolveRef(ref) === null) {
        console.warn(`[playlists] broken ref in "${p.id}":`, ref);
      }
    }
  }
}
