/** One indexed component: the install command is the deliverable, everything else is context. */
export interface IndexedComponent {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  library: string;
  libraryId: string;
  license: string;
  author: string | null;
  sourceUrl: string;
  docsUrl: string;
  previewImage: string | null;
  installKind: 'shadcn' | 'npm' | 'copy';
  installCommand: string | null;
  registryUrl: string | null;
  packages: string[];
  dependencies: string[];
  code: string | null;
  codePath: string | null;
}

export interface ComponentIndex {
  generatedAt: string;
  components: IndexedComponent[];
}

/** A ranked answer to a request. `why` is Claude's reasoning when the API is available. */
export interface AskMatch {
  component: IndexedComponent;
  score: number;
  why: string | null;
}

export interface AskResponse {
  query: string;
  /** `agent` when Claude ranked the results through the API, `search` for local fuzzy search. */
  mode: 'agent' | 'search';
  /** One-paragraph answer from the agent, absent in search mode. */
  summary: string | null;
  matches: AskMatch[];
}
