# Atlas

[![Tests](https://github.com/Adi-gitX/colour-fun/actions/workflows/tests.yml/badge.svg)](https://github.com/Adi-gitX/colour-fun/actions/workflows/tests.yml)
[![Secret scan](https://github.com/Adi-gitX/colour-fun/actions/workflows/secret-scan.yml/badge.svg)](https://github.com/Adi-gitX/colour-fun/actions/workflows/secret-scan.yml)
[![CodeQL](https://github.com/Adi-gitX/colour-fun/actions/workflows/codeql.yml/badge.svg)](https://github.com/Adi-gitX/colour-fun/actions/workflows/codeql.yml)
[![Deploy](https://github.com/Adi-gitX/colour-fun/actions/workflows/gh-pages.yml/badge.svg)](https://github.com/Adi-gitX/colour-fun/actions/workflows/gh-pages.yml)

> **Atlas — every design resource a developer or designer ever needs, in one place.**

The web has scattered design resources across thousands of disconnected sites — Awwwards for inspiration, shadcn for components, Coolors for palettes, Unsplash for backgrounds, Lucide for icons, Mobbin for mobile UI, Dribbble for trends. Atlas pulls every category that matters into a single curated, searchable, opinionated library. One tab. Everything.

**Live:** [atlas.vercel.app](https://colour-fun.vercel.app) · [GitHub Pages mirror](https://adi-gitx.github.io/colour-fun/)

---

## Why Atlas

Every senior product team eventually builds an internal "design resource wiki" — a Notion page or a Figma file pointing at the same 50 resources. Atlas is that wiki, but built right: live previews, structured metadata, fast search, copy-paste install snippets, and a cohesive UI you'd actually want to spend time in.

The mission is simple: if a developer or designer needs a visual asset, a component, a system, or a reference, they should find it on Atlas first — and not have to leave.

---

## What's inside

Atlas indexes resources across nine categories. Each entry has a live preview, a direct link, install or copy snippets where applicable, and tags so search actually works.

| Category                | What you'll find                                                                          | Examples currently indexed                                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Component libraries** | Modern React / Vue / Svelte / Solid libraries with installation snippets and live preview | shadcn/ui · Radix · MUI · Mantine · Chakra · Headless UI · Park UI · Ariakit · Tremor                               |
| **Design systems**      | Production design systems from major teams, browseable side by side                       | Material 3 · Apple HIG · Polaris (Shopify) · Atlassian · Carbon (IBM) · Fluent (Microsoft) · Lightning (Salesforce) |
| **UI inspiration**      | Curated galleries with screenshots, source links, and category filters                    | Awwwards · Mobbin · SaaS Landing Pages · Land-book · Page Flows                                                     |
| **Solid backgrounds**   | 238 hand-picked color tones, exportable at any resolution                                 | 1080p · 4K · custom · PNG / JPEG / WebP                                                                             |
| **Gradients**           | Code-free gradient generator with angle, stops, copy-paste CSS / SVG / PNG export         | Mesh · Conic · Linear · Radial                                                                                      |
| **Icon libraries**      | Cross-search every major open icon set in one query                                       | Lucide · Phosphor · Heroicons · Tabler · Feather · Radix Icons                                                      |
| **Fonts & typography**  | Curated font pairings, free-tier picks, designer favorites with live preview              | Google Fonts (curated) · Fontshare · Pangram Pangram                                                                |
| **Illustrations & 3D**  | Free-to-use illustration sets and 3D scene libraries                                      | unDraw · Storyset · Open Doodles · Humaaans · Spline community                                                      |
| **Tools**               | Single-purpose utilities embedded in-app — no tab switching                               | Color contrast checker · Palette generator · Type scale · Easing visualizer · Shadow generator                      |

### Building right now

- **Mockup studio** — drop a screenshot into a device frame (iPhone, Pixel, MacBook, browser chrome, social card).
- **Animation library** — Lottie + CSS-only micro-interactions, copy-paste-ready.
- **Stock asset hub** — curated Unsplash collections, gradient meshes, noise textures.

### Roadmap

- [ ] Public API for component/library metadata so other tools can build on Atlas
- [ ] Browser extension — fingerprint a page's design system in one click
- [ ] AI-powered "components like this" semantic search
- [ ] Figma plugin — drop any Atlas asset directly into a frame
- [ ] Designer ↔ developer collaboration mode (annotate, share, version)

---

## Tech stack

| Layer                    | Choice                                                                     |
| ------------------------ | -------------------------------------------------------------------------- |
| Framework                | React 19 + TypeScript 5.9                                                  |
| Build                    | Vite 7                                                                     |
| State                    | Zustand                                                                    |
| Styling                  | CSS Modules                                                                |
| Animations               | Framer Motion                                                              |
| PWA                      | Vite PWA Plugin (offline-first)                                            |
| Unit / integration tests | Vitest + React Testing Library                                             |
| E2E                      | Playwright (production-preview build)                                      |
| Lint                     | ESLint 9 (flat config), `--max-warnings 0`                                 |
| Format                   | Prettier with husky + lint-staged pre-commit                               |
| Container                | Multi-stage Docker → `nginx-unprivileged:1.27-alpine`                      |
| Hosting                  | Vercel · GitHub Pages                                                      |
| Security                 | gitleaks · CodeQL (security-and-quality) · dependabot auto-merge           |
| CI                       | GitHub Actions with concurrency, timeouts, hadolint, ci-success aggregator |

---

## Architecture

```
solidbackgrounds/
├── .github/
│   ├── dependabot.yml
│   ├── ISSUE_TEMPLATE/
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/
│       ├── tests.yml                  # auto-run on every push/PR
│       ├── secret-scan.yml            # gitleaks, push/PR + weekly cron
│       ├── codeql.yml                 # SAST, push/PR + weekly cron
│       ├── dependabot-auto-merge.yml  # safe-bump auto-merge
│       ├── gh-pages.yml               # build + deploy to Pages
│       └── (rest are workflow_dispatch only — lecture demos)
│
├── solid-colour/                  # Atlas frontend
│   ├── src/
│   │   ├── components/            # Header, Sidebar, ColorGrid, GradientGenerator,
│   │   │                          # ComponentCard, DiscoverCard, ImageGallery, ...
│   │   ├── components/views/      # HomeView, BrowseView, DiscoverView, LibraryView
│   │   ├── components/placeholders/ComingSoon.tsx
│   │   ├── store/appStore.ts      # Zustand: section, theme, search, modals
│   │   ├── data/
│   │   │   ├── colors.ts          # 238 curated tones
│   │   │   ├── components.ts      # indexed component libraries
│   │   │   ├── designSystems.ts   # indexed design systems
│   │   │   ├── inspiration.ts     # indexed inspiration sites
│   │   │   ├── libraries.ts       # indexed UI libraries
│   │   │   ├── tools.ts           # indexed in-app tools
│   │   │   └── images.ts          # background presets
│   │   ├── utils/
│   │   │   ├── colorUtils.ts      # hex ⇄ rgb ⇄ hsl conversion
│   │   │   └── imageGenerator.ts  # canvas → PNG/JPEG/WebP export
│   │   └── test/                  # vitest setup + mocks
│   ├── e2e/smoke.spec.ts          # Playwright smoke (title, mount, no console errors)
│   ├── Dockerfile                 # multi-stage, non-root nginx
│   ├── nginx.conf                 # SPA fallback, security headers, gzip
│   ├── vitest.config.ts           # JUnit + v8 coverage centralized
│   └── playwright.config.ts       # vite preview in CI
│
├── docker-compose.yml             # locked-down runtime (read_only, cap_drop ALL)
├── render.yaml                    # PaaS deploy
├── COURSE_TIMELINE.md             # FSDE 2025 lecture-by-lecture map
└── README.md
```

### Data flow

```
User → Header (search · theme · sidebar)
         │
         ▼
     Sidebar (section nav) ──→ Zustand store ──→ View
                                                 │
                                                 ├── HomeView          (curated mix)
                                                 ├── BrowseView        (filtered grid: components / libraries / systems)
                                                 ├── DiscoverView      (UI inspiration with image previews)
                                                 ├── LibraryView       (deep-dive on a single library)
                                                 ├── ColorGrid         (238 solid backgrounds)
                                                 ├── GradientGenerator (live preview + export)
                                                 ├── ImageGallery      (curated stock + textures)
                                                 └── DownloadModal     (1080p · 4K · custom export)
```

---

## Local development

```bash
git clone git@github.com:Adi-gitX/colour-fun.git atlas
cd atlas

# Install root dev deps (husky, lint-staged, prettier)
npm install

# Install + run the frontend
npm install --prefix solid-colour
npm run dev --prefix solid-colour
```

Available scripts in `solid-colour/`:

| Script                            | What it does                                                       |
| --------------------------------- | ------------------------------------------------------------------ |
| `npm run dev`                     | Vite dev server with HMR                                           |
| `npm run build`                   | TypeScript check + production Vite build                           |
| `npm run preview`                 | Serve the production build locally                                 |
| `npm test`                        | Vitest run                                                         |
| `npm run test:ci`                 | Vitest with v8 coverage + JUnit (`CI=true` enables JUnit reporter) |
| `npm run test:e2e`                | Playwright e2e (boots `vite preview` in CI, `vite dev` locally)    |
| `npm run lint`                    | ESLint with `--max-warnings 0`                                     |
| `npm run format` / `format:check` | Prettier                                                           |

### Container

```bash
docker compose up --build
# → http://localhost:8080
```

The image runs as the non-root `nginx` user, on a read-only filesystem, with all Linux capabilities dropped except those nginx workers strictly need.

---

## CI / CD

Three workflows auto-run on every push and PR:

| Workflow                                               | What it gates                                                                                                                                                                                      |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`tests.yml`](.github/workflows/tests.yml)             | Lint · Prettier · Vitest with coverage + JUnit · Vite build · Playwright e2e (against the production preview build) · hadolint Dockerfile lint · `ci-success` aggregator job for branch protection |
| [`secret-scan.yml`](.github/workflows/secret-scan.yml) | gitleaks across full git history. Also runs on a weekly cron.                                                                                                                                      |
| [`codeql.yml`](.github/workflows/codeql.yml)           | GitHub-native SAST with the `security-and-quality` query pack. Push, PR, and weekly cron.                                                                                                          |

`gh-pages.yml` deploys to GitHub Pages on push to `main`. Every other workflow under `.github/workflows/` is `workflow_dispatch:` only — they're kept as lecture demos but do not block green status.

**Branch protection:** the single status check to require is `CI success` — it aggregates lint-format / unit / build / e2e / hadolint and flips red if any required job fails or is cancelled.

---

## Security

- **Non-root container** — `nginxinc/nginx-unprivileged:1.27-alpine`, port 8080, no `CAP_NET_BIND`.
- **Hardened compose** — `read_only: true`, tmpfs scratch, `cap_drop: ALL`, `no-new-privileges`.
- **Real security headers** — X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, baseline CSP.
- **Pre-commit secret blocking** — husky + lint-staged runs prettier on staged files; gitleaks runs on every push and weekly.
- **Pinned base image** — nginx pinned to a minor (`1.27`), not `:alpine`.
- **No `.npmrc` ever committed** — explicitly gitignored.

---

## Contributing

PRs welcome. Run the local CI dry-run before opening one:

```bash
npm run format:check        # root
cd solid-colour
npm run lint                # eslint --max-warnings 0
npm run format:check        # prettier
CI=true npm run test:ci     # vitest + coverage + junit
npm run build               # vite build
npm run test:e2e            # playwright
```

The PR template will walk you through the checklist. The dependabot auto-merge workflow handles patch + dev-dep minor bumps automatically — the queue stays clean.

---

## License

MIT
