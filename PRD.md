# Atlas — Product Requirements Document

**Version:** 1.0
**Status:** v1.0 shipped · v1.1 in planning
**Owner:** Adithya Kammati ([@Adi-gitX](https://github.com/Adi-gitX))
**Last updated:** 2026-05-03

---

## 1. TL;DR

**Atlas is the search-everything reference for developers and designers — every component library, design system, UI inspiration site, color palette, gradient, icon library, font, illustration, and design tool, all in one fast, opinionated, searchable place.**

It exists because the modern web's design knowledge is scattered across 50+ disconnected sites, and every senior product team eventually rebuilds the same internal "design resource wiki." Atlas is that wiki, but built right: live previews, structured metadata, fast search, copy-paste install snippets, and a UI that itself feels like a tool you'd want to use.

**The shortest pitch:** _If a developer or designer needs a visual asset, a component, a system, or a reference, they should find it on Atlas first — and not have to leave._

---

## 2. Problem & Opportunity

### The problem

Discovering, evaluating, and choosing front-end resources is broken:

- **Resources are scattered.** shadcn for components, Coolors for palettes, Awwwards for inspiration, Lucide for icons, Mobbin for mobile UI, Dribbble for trends — every category lives on a different domain with a different UX.
- **Directory sites rot.** Most "best React libraries" lists are stale within 6 months. They show 2022 stats, dead repos, abandoned libraries.
- **No filters that matter.** Existing directories show 200 libraries with no way to narrow by framework, license, bundle size, TypeScript support, or accessibility quality.
- **No opinion.** Most lists are neutral and unhelpful. Developers want curators with taste — not 500 results sorted alphabetically.
- **Auth gates and email walls.** "Sign up to save" for a free design link directory is hostile UX.
- **Mobile is an afterthought.** A meaningful share of devs browse on phone. Most directories ignore that.

### The opportunity

Build the design-resource hub a senior design engineer would actually use — fast, opinionated, comprehensive, no friction, fresh data, mobile-first. Atlas wins by combining:

- **Coverage** (every category that matters, not just one)
- **Curation** (an editor with taste, not a database dump)
- **Freshness** (live GitHub stars, last-commit, last-verified — auto-refreshed)
- **Speed** (sub-100ms perceived UX, ⌘K from anywhere, full keyboard navigation)
- **No friction** (no signup, no email gate, no popup, no consent banner)

---

## 3. Vision & Mission

### Vision (3-year)

The default starting point for any front-end project. When someone says "I'm building a SaaS dashboard," the next thing said is "I'm using Atlas for the stack."

### Mission

Make discovering, evaluating, and adopting front-end resources fast, fair, and free.

### Strategic pillars

1. **Comprehensiveness** — index every category developers and designers care about.
2. **Curation with taste** — opinionated editorial layer, not a database dump.
3. **Freshness as a moat** — live data refresh on a cadence; "last verified" timestamps everywhere.
4. **Beautiful by default** — the product itself looks like the design tools it indexes.
5. **Zero-friction access** — no signup wall for any core feature.

---

## 4. Target Users

### Persona 1 — "The shipping developer" (primary)

- Frontend engineer at a startup or solo indie hacker building a side project.
- Has 12 tabs open. Wants to ship by Sunday night.
- **Hires Atlas to:** stop tab-hopping; find the right library, copy the install snippet, get back to building.
- **Success metric:** time from "I need a component library" to "npm install ran." Target: under 60 seconds.

### Persona 2 — "The design engineer / freelancer" (high-value)

- Bridges design and engineering. Makes tech decisions for clients or their own teams.
- Needs to look credible — citations, comparisons, "used by Vercel/Linear" social proof.
- Bookmarks heavily; revisits often; shares their picks.
- **Hires Atlas to:** make confident, defensible picks fast and share them with collaborators.

### Persona 3 — "The student / curious designer" (volume)

- Bootcamp student, junior dev, designer learning to code.
- Doesn't know what's good; needs curation and explanation.
- **Hires Atlas to:** discover what's modern; learn _why_ a library is recommended.

All three share ~80% of needs. Atlas optimizes for Persona 1; the others come along for free.

---

## 5. Jobs-to-be-done

These are the underlying user needs Atlas exists to serve. Every feature should map to one or more.

| Job                                             | Feature support                                                                                                 |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Help me decide quickly between options**      | Library detail page with pros/cons + alternatives rail; comparison tags (framework, license, TypeScript)        |
| **Help me discover what I didn't know existed** | Trending / new-this-week rails (planned); curated playlists (planned); ⌘K palette empty-state shows browse mode |
| **Help me look smart at work**                  | Shareable URLs (planned); curated commentary; "used by [Linear, Vercel, Stripe]" logos (planned)                |
| **Help me save my brain**                       | Bookmarks (localStorage today, account-bound later); "My Library" view; recently viewed (planned)               |
| **Help me build faster**                        | Install snippet copy buttons; framework filter; embedded tools (no tab switching)                               |
| **Help me trust the data**                      | Live GitHub stars + last-commit (planned, weekly cron); last-verified timestamp (planned)                       |
| **Don't waste my time**                         | No signup gate; ⌘K from anywhere; sub-100ms perceived UX target                                                 |
| **Give me a reason to come back**               | Daily highlight (planned); weekly digest (planned); follow-able curators (planned)                              |

---

## 6. Product Principles

These are the decisions Atlas makes — _not_ a list of "what we believe in." Every principle is a constraint that rules options out.

1. **No signup walls for core features.** Bookmarks live in localStorage until accounts add unique value (cross-device sync, sharing).
2. **Have a point of view.** Editor's picks, curated playlists, opinionated pros/cons. No "200 libraries sorted alphabetically."
3. **Speed is a feature.** Sub-100ms perceived UX. ⌘K from anywhere. Bundle stays under 700KB precache. Lighthouse Performance ≥ 90.
4. **Keyboard-first.** Anything done twice has a shortcut. ⌘K, `?`, `t`, `g x` — power users never touch the mouse.
5. **Mobile is not a port.** Touch targets ≥ 44px. Sidebar collapses cleanly. Modals work one-handed.
6. **Live data over static lists.** Auto-refresh GitHub stars, last commit, NPM downloads weekly. Stale data = a bug.
7. **Beautiful empty states.** Every empty state tells the user what to do next.
8. **Open by default.** All resource metadata served as JSON via a public API (planned). Other tools can build on Atlas.
9. **No analytics that need a consent banner.** Plausible-class analytics only — privacy-friendly, no cookies.
10. **The product is the demo.** Atlas itself uses the patterns it documents.

---

## 7. Scope — In / Out

### In scope (v1.0 — shipped)

- Curated catalog of component libraries, design systems, UI inspiration sites, design tools.
- 238-color background palette + gradient generator + image gallery.
- ⌘K command palette with universal fuzzy search across all data sources.
- Library detail pages with install snippets (npm/pnpm/yarn/bun), pros/cons, alternatives.
- Embedded interactive tools: contrast checker, palette generator, type scale, shadow generator.
- Bookmarks + favorites (localStorage).
- Dark / light theme.
- Keyboard shortcuts (⌘K, `?`, `t`, `g x` navigation).
- PWA with offline support.
- Export solid backgrounds at 1080p / 4K / custom (PNG / JPEG / WebP).

### In scope (v1.1 — next 4 weeks)

- Curated playlists with editorial commentary.
- Compare matrix (2–3 libraries side-by-side).
- Live GitHub data refresh (weekly Action).
- Shareable favorite collections via URL state.
- Onboarding tour for first-time visitors.
- Icon library cross-search (Lucide, Phosphor, Heroicons, Tabler).

### In scope (v2.0 — Q3-Q4 2026)

- AI semantic search (OpenAI embeddings).
- Stack scaffolder ("I'm building X → use this stack").
- Public API for resource metadata.
- Browser extension — detect design system on any URL.
- VSCode extension — search Atlas from the editor.

### Out of scope (forever, unless mission shifts)

- **Full CMS / WYSIWYG** for users to author content. Atlas curates; it doesn't host arbitrary content.
- **Comments / forums.** High moderation cost, low signal. Discourse / Discord do this better.
- **Tutorials / blog posts.** Substack / Medium do this better.
- **AI image / asset generation.** Atlas indexes; it doesn't generate.
- **Native mobile apps.** PWA on iOS/Android is sufficient — install banner handles it.

---

## 8. Feature Inventory — v1.0 (Shipped)

### 8.1 Universal command palette (⌘K)

**What it does:** Press ⌘K (or Ctrl+K) anywhere. A modal opens with a single search input that returns ranked results across every data source — component libraries, design systems, components, UI inspiration, tools, and the full color palette — plus quick-action shortcuts for theme toggle and section navigation.

**Acceptance criteria:**

- ✅ Opens within 80ms of keystroke.
- ✅ Empty query shows curated "browse" results across all categories.
- ✅ Typed query is fuzzy-ranked (Fuse.js) with title weighted 3× over the haystack.
- ✅ Results grouped by kind, capped per category and overall.
- ✅ Quick actions always visible (toggle theme, jump to section, show shortcuts).
- ✅ Last 8 search queries persist across sessions.
- ✅ Keyboard nav: ↑↓ to move, ↩ to select, Esc to close.
- ✅ External resources open in new tab; internal sections navigate in-app.
- ✅ Header has a "Search… ⌘K" pill so non-keyboard users can discover the feature.

**Files:** [`src/components/CommandPalette.tsx`](solid-colour/src/components/CommandPalette.tsx), [`src/hooks/useUniversalSearch.ts`](solid-colour/src/hooks/useUniversalSearch.ts).

### 8.2 Library detail page

**What it does:** Clicking any library card opens an in-app deep-dive — not just an external link. The detail page surfaces install snippets, framework support, pros/cons, alternatives, and bookmark/visit-site CTAs. Clicking an alternative navigates to its detail page.

**Acceptance criteria:**

- ✅ Hero with logo (accent-colored), name, tagline, framework / styling / pricing pills, TypeScript badge.
- ✅ Install snippet block with `npm` / `pnpm` / `yarn` / `bun` tabs and one-click copy.
- ✅ Pros / trade-offs section side-by-side, color-coded.
- ✅ "Worth comparing" rail — alternative libraries clickable.
- ✅ Bookmark CTA persists to localStorage.
- ✅ Visit-site button opens external URL in new tab.
- ✅ GitHub button when `github` field is set.
- ✅ Cmd/Ctrl-click on a library card still opens the external URL (escape hatch).

**Files:** [`src/components/views/LibraryDetailView.tsx`](solid-colour/src/components/views/LibraryDetailView.tsx).

### 8.3 Toolbox — embedded interactive utilities

**What it does:** Four utilities embedded inside Atlas — not external links. Live preview, copy-to-clipboard, designed to feel like first-class app pages.

**Tools shipped:**

| Tool                  | What it does                                                                                                                      |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Contrast Checker**  | Two hex inputs → WCAG 2.1 contrast ratio + pass/fail for AA/AAA × normal/large text. Live preview of foreground on background.    |
| **Palette Generator** | Brand-color input → full Tailwind 50–950 scale. Outputs a copy-paste `tailwind.config.js` block.                                  |
| **Type Scale**        | Base size + musical ratio (8 presets including Golden Ratio) → modular scale with live previews and a CSS custom-property output. |
| **Shadow Generator**  | 5 presets (Soft, Subtle, Card, Lifted, Pop) + custom layers. Sliders for x/y/blur/spread/opacity. Live preview + copy-paste CSS.  |

**Acceptance criteria for each:**

- ✅ Lives at its own section (`tool-contrast`, `tool-palette`, `tool-typescale`, `tool-shadow`).
- ✅ Reachable via ⌘K and via Toolbox sidebar group.
- ✅ Live preview updates on every change.
- ✅ Copy-to-clipboard for any generated output.
- ✅ Responsive on mobile.

**Files:** [`src/components/tools/`](solid-colour/src/components/tools/).

### 8.4 Keyboard shortcuts

**What it does:** Power-user keybindings that work app-wide.

**Bindings:**

| Keys                                             | Action                                                                                 |
| ------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `⌘ K` / `Ctrl K`                                 | Open / close command palette                                                           |
| `?`                                              | Open shortcuts cheat sheet                                                             |
| `T`                                              | Toggle theme                                                                           |
| `G` then `H` / `C` / `L` / `D` / `I` / `T` / `B` | Go to home / components / libraries / design-systems / inspiration / tools / bookmarks |
| `Esc`                                            | Close any overlay                                                                      |

**Acceptance criteria:**

- ✅ All shortcuts ignore inputs (textarea, contenteditable, select).
- ✅ Modifier-key combos (e.g. ⌘T browser tab) are never intercepted.
- ✅ Two-key sequences (`g x`) time out after 700ms.
- ✅ Cheat sheet overlay lists every shortcut in 3 grouped sections.

**Files:** [`src/components/ShortcutsOverlay.tsx`](solid-colour/src/components/ShortcutsOverlay.tsx).

### 8.5 Bookmarks & My Library

**What it does:** Star any resource (library, design system, inspiration site, tool) and see them all in one "My Library" view. localStorage-backed; no signup.

**Acceptance criteria:**

- ✅ Bookmark button on every resource card.
- ✅ "My Library" view aggregates bookmarks across categories.
- ✅ Persists across sessions via Zustand `persist` middleware.
- ✅ Bookmark state survives the Atlas rebrand (storage key kept stable).

### 8.6 Studio — solid colors, gradients, backgrounds

**What it does:** Produce design assets in-app.

- **238 curated solid colors** in 12 categories. Click any → DownloadModal lets you export at 1080p / 4K / custom dimensions in PNG / JPEG / WebP.
- **Gradient generator** — angle, stops, code-free preview, copy-paste CSS / SVG / PNG.
- **Image gallery** — curated background presets.
- **Custom color picker** with persistent recent-colors history.

### 8.7 Browse — components, design systems, inspiration, tools

**What it does:** Curated catalogs across each category. Filter by category. Search-as-you-type. Bookmark from the card.

**Currently indexed (v1.0):**

- 9 component libraries (shadcn/ui, Radix, Headless UI, Mantine, Chakra, MUI, Ant Design, HeroUI, Tremor) — top 7 with full detail-page metadata.
- 7 design systems (Material 3, Apple HIG, Polaris, Atlassian, Carbon, Fluent, Lightning).
- 5 inspiration sites (Mobbin, Awwwards, Land-book, Page Flows, SaaS Landing Pages).
- 12 tools.

### 8.8 Theme

- Dark and light, persisted via Zustand.
- `T` keyboard shortcut + palette quick action + header toggle.
- Theme attribute applied at boot before React hydrates (no FOUC).

### 8.9 PWA

- Offline-first via `vite-plugin-pwa`.
- Installable on iOS/Android/desktop.
- Reload prompt when a new service worker is available.
- Manifest with branded icons.

---

## 9. Information Architecture

```
Atlas
├── Home                         (curated landing)
│
├── Browse
│   ├── Components               (cards · search · category filter)
│   ├── Blocks                   (coming soon)
│   ├── Templates                (coming soon)
│   ├── Hooks                    (coming soon)
│   └── Community                (community submissions)
│
├── Discover
│   ├── Component Libraries      (DiscoverView · click-to-detail)
│   │   └── Library detail       (install · pros/cons · alternatives)
│   ├── Design Systems
│   ├── UI Inspiration
│   └── Tools                    (directory)
│
├── Toolbox                      (embedded utilities)
│   ├── Contrast Checker
│   ├── Palette Generator
│   ├── Type Scale
│   └── Shadow Generator
│
├── Studio
│   ├── Solid Colors             (238 curated, exportable)
│   ├── Gradients                (live generator)
│   └── Backgrounds              (image gallery)
│
├── My Library                   (bookmarks aggregated)
└── Following                    (coming soon)
```

---

## 10. User Flows

### Flow A — "I need a date picker for my React app"

1. User opens Atlas (any page).
2. Hits `⌘K`.
3. Types `date picker`.
4. Sees ranked results: Mantine DatePicker, Radix primitives, Headless UI Combobox.
5. Hits ↩ on Mantine.
6. Lands on Mantine library detail page.
7. Reads the pros/cons.
8. Switches install tab to `pnpm`, hits Copy.
9. Pastes into terminal.

**Total time target:** under 30 seconds. **JTBD served:** decide quickly, build faster.

### Flow B — "I want to send my friend my SaaS stack picks"

1. User browses libraries, bookmarks 5.
2. Goes to "My Library".
3. Hits Share (planned v1.1) → URL with state encoded.
4. Sends link in Slack.
5. Friend opens link, sees the curated picks immediately, no signup.

**JTBD served:** look smart, save my brain.

### Flow C — "I'm prototyping a checkout page and need a 1440×900 background and a fitting palette"

1. User opens Studio → Solid Colors.
2. Searches "navy".
3. Clicks `#0F172A`.
4. DownloadModal opens; picks 1440×900 custom; PNG; downloads.
5. Switches to Toolbox → Palette Generator.
6. Pastes `#0F172A` as brand color.
7. Copies the Tailwind config.
8. Pastes into `tailwind.config.js`.

**JTBD served:** build faster, save my brain, decide quickly.

---

## 11. Content Strategy

### Curation policy

- **Every entry is hand-picked.** No automated scraping of "top X on GitHub."
- **An entry must be alive.** Last commit < 12 months OR a clear "stable, no longer actively developed" status.
- **An entry must be free or have a clear free tier.** Paid-only tools labeled `Paid` and marked.
- **An entry has a point of view.** Pros/cons sections are opinionated. We don't hide trade-offs.
- **Alternatives are honest.** If shadcn/ui is a great pick, the alternatives section lists Radix, Headless UI — not weaker options to make shadcn look better.

### Update cadence

- **Resource metadata:** weekly auto-refresh (planned v1.1) — GitHub stars, last commit, NPM downloads.
- **Curation review:** quarterly — re-rank, retire dead entries, add new ones.
- **Editorial playlists:** monthly — new "Top 10 for X" featured.

### Content shape (Library example)

```ts
{
  id: 'shadcn-ui',
  name: 'shadcn/ui',
  description: 'Beautifully designed components copy-pasted into your app...',
  url: 'https://ui.shadcn.com',
  framework: ['React'],
  styling: 'Tailwind',
  pricing: 'Free',
  initials: 'sh',
  accent: '#09090B',
  npmPackage: 'shadcn',
  github: 'shadcn-ui/ui',
  typescript: true,
  tagline: 'Not a component library. A collection of re-usable components...',
  pros: ['You own the code', 'Zero runtime cost', 'Best-in-class a11y'],
  cons: ['No automatic upgrade path', 'Tailwind dependency is non-negotiable'],
  alternatives: ['radix-ui', 'headlessui'],
}
```

---

## 12. Design Principles

### Visual

- **Hairline borders, dark-first.** Every surface uses the same 1px hairline border on `--border-light`.
- **Typography stack:** Inter (sans), Geist Mono (mono), Geist (display). Loaded via `preconnect` to Google Fonts.
- **Color tokens via `[data-theme]` attribute** on `<html>`. Theme attribute applied before React hydrates → no FOUC.
- **Radius scale:** xs / sm / md / lg / xl / pill. No arbitrary values.
- **Shadow scale:** modal-only. Cards use borders, not drop shadows, in dark mode.

### Interaction

- **Animations are 100–200ms** with `cubic-bezier(0.2, 0.8, 0.2, 1)` ease-out.
- **Framer Motion only for entrance animations and modal/palette transitions.** Never for routine state changes.
- **Hover states are subtle.** `--bg-active` / `--bg-card-hover` only, no full color shifts.
- **`prefers-reduced-motion` respected** via the user setting in SettingsModal.

### Accessibility

- **WCAG 2.1 AA target.** Contrast checker is live in-product because we hold ourselves to it.
- **Focus rings visible.** Custom but always present.
- **Aria labels** on every icon-only button.
- **Keyboard fully sufficient.** No flow requires mouse.

---

## 13. Technical Architecture

### Stack

| Layer             | Choice                                                | Rationale                                                                                    |
| ----------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Framework         | React 19                                              | Latest stable, concurrent features default                                                   |
| Language          | TypeScript 5.9 (`strict: true`)                       | Catch interface drift early                                                                  |
| Build             | Vite 7                                                | Fast HMR, native ESM, sane defaults                                                          |
| State             | Zustand + `persist` middleware                        | Less boilerplate than Redux, localStorage built-in                                           |
| Styling           | CSS Modules                                           | No runtime, no class collisions, no atomic-CSS lock-in                                       |
| Animations        | Framer Motion                                         | Used sparingly; lazy import planned                                                          |
| Routing           | None (in-store section switching)                     | App is a SPA with section-based UI; full router planned for v1.1 to enable deep-link sharing |
| Search            | Fuse.js                                               | Lightweight, fuzzy, ~10KB                                                                    |
| Command palette   | cmdk                                                  | Battle-tested keyboard handling                                                              |
| Tests             | Vitest + React Testing Library + Playwright           | Vitest for unit, RTL for component, Playwright for e2e                                       |
| Lint              | ESLint 9 (flat config), `--max-warnings 0`            | Fail CI on any warning                                                                       |
| Format            | Prettier with husky + lint-staged                     | Auto-format on commit                                                                        |
| Container         | Multi-stage Docker → `nginx-unprivileged:1.27-alpine` | Non-root, port 8080, hardened                                                                |
| Hosting           | Vercel + GitHub Pages mirror                          | Vercel primary, Pages as fallback                                                            |
| CDN (production)  | AWS CloudFront in front of S3 (Terraform)             | Global, cheap, ~$1/month at hobby scale                                                      |
| Security scanning | gitleaks + CodeQL + dependabot                        | Pre-commit, push, weekly cron                                                                |
| CI                | GitHub Actions                                        | Concurrency, timeouts, hadolint, ci-success aggregator                                       |

### Data architecture

All resource data is currently hand-authored TypeScript in `src/data/*.ts`:

- `colors.ts` — 238 curated colors across 12 categories
- `components.ts` — featured + community components
- `libraries.ts` — component libraries with full detail-page metadata
- `designSystems.ts` — production design systems
- `inspiration.ts` — UI inspiration sites
- `tools.ts` — design tools directory
- `images.ts` — background image presets

**Migration plan:** in v2.0, move to JSON files consumed via `import.meta.glob` so non-engineers can edit content without TS recompiles.

### State architecture

Single Zustand store in [`src/store/appStore.ts`](solid-colour/src/store/appStore.ts) divided into namespaces:

| Namespace         | Persisted              | What it owns                              |
| ----------------- | ---------------------- | ----------------------------------------- |
| Theme             | yes                    | dark / light + applied attribute          |
| Search            | no                     | active query string                       |
| Navigation        | yes                    | currentSection, selected category filters |
| Bookmarks         | yes                    | resource ids                              |
| Favorites         | yes                    | color hex strings                         |
| Download modal    | no                     | selected color, modal state               |
| Color picker      | no (recents persisted) | custom color, recent colors               |
| Download options  | yes                    | ratio, resolution, format                 |
| Sidebar           | no                     | mobile open/close                         |
| Settings          | no                     | settings modal open/close                 |
| Command palette   | no (recents persisted) | open/close, query, recent searches        |
| Library detail    | no                     | selectedLibraryId                         |
| Shortcuts overlay | no                     | open/close                                |
| Preferences       | yes                    | reduced motion, high-quality downloads    |
| Toasts            | no                     | active toast list                         |

### Persistence

Single localStorage key: `stax-storage` (kept stable for backward-compat across the rebrand). Partialized via Zustand's `persist.partialize` so only intentional state hits disk.

---

## 14. Performance & Quality Bars

### Performance budgets

| Metric                       | Target   | Current               |
| ---------------------------- | -------- | --------------------- |
| Initial JS bundle (precache) | ≤ 700 KB | 609 KB ✓              |
| LCP (95th, mobile)           | ≤ 2.5s   | not measured yet      |
| CLS                          | ≤ 0.05   | not measured yet      |
| TTI (95th, mobile)           | ≤ 3.0s   | not measured yet      |
| ⌘K open latency              | ≤ 80ms   | qualitatively passing |

**Action items:** Lighthouse CI in `tests.yml` (planned v1.1) to gate PRs against regression.

### Test coverage

| Layer             | Current                              | Target (v1.1)                                                               |
| ----------------- | ------------------------------------ | --------------------------------------------------------------------------- |
| Unit (Vitest)     | 12 tests, ~3% coverage on components | 50% on `components/`, 80% on `utils/`                                       |
| Integration (RTL) | none                                 | core flows for ColorGrid, Sidebar, Header, GradientGenerator, DownloadModal |
| E2E (Playwright)  | 3 smoke tests                        | 1 spec per major user flow                                                  |

**The smoke tests are intentionally minimal** — they assert invariants that hold forever (title, root mounts, no console errors) so they almost never go red on cosmetic changes.

### Quality gates in CI

`tests.yml` blocks PRs on:

- ESLint (`--max-warnings 0`, unused-disable-directives caught)
- Prettier (`--check`)
- Vitest with coverage + JUnit
- `vite build` succeeds
- Playwright e2e against the production preview build
- hadolint of the Dockerfile

`secret-scan.yml` blocks any PR on a gitleaks finding (full git history, weekly cron).
`codeql.yml` runs the `security-and-quality` query pack on push/PR/weekly.

---

## 15. Accessibility — what we promise

- WCAG 2.1 AA target across the app.
- Keyboard sufficient — no flow requires a mouse.
- Visible focus rings on every interactive element.
- Aria labels on every icon-only button.
- Reduced-motion preference respected (toggle in Settings).
- Color contrast checker is built into Atlas — we hold ourselves to it.
- Modals trap focus and restore on close.

**Open gap:** formal axe-DevTools audit per view + keyboard-only walkthrough has not been completed for v1.0. Scheduled for v1.1.

---

## 16. Security & Privacy

### What Atlas does

- Stores all user state in `localStorage` only — bookmarks, favorites, theme, recent searches.
- Sends zero analytics today (Plausible-style is planned, no cookies, no consent banner needed).
- No login. No accounts. No PII.
- Service worker registered for offline + PWA install.
- All outbound resource clicks open in `target="_blank" rel="noopener noreferrer"`.

### What Atlas does not do

- No tracking pixels.
- No third-party JS beyond fonts (preconnected to Google Fonts).
- No remote logging service in v1.0 (Sentry-class planned later, with explicit opt-in).

### Production infrastructure

The Terraform-provisioned production deploy uses:

- Private S3 bucket — versioned, AES256, public access fully blocked.
- CloudFront with Origin Access Control (modern OAI replacement).
- Real security headers in CDN response: HSTS (2y, includeSubDomains, preload), X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy denying camera/mic/geo, baseline CSP.
- Container runtime: `nginx-unprivileged:1.27-alpine`, port 8080, no `CAP_NET_BIND`.
- docker-compose: `read_only` filesystem, tmpfs, `cap_drop: ALL`, `no-new-privileges`.

### Repo guardrails

- `.npmrc` gitignored — auth tokens never reach the repo.
- gitleaks scan on every push and weekly cron.
- CodeQL with the `security-and-quality` query pack.
- husky pre-commit auto-formats; pre-commit secret check via gitleaks.
- Dependabot weekly; auto-merge for patch + dev-dep minor bumps.

---

## 17. CI/CD & Infrastructure

### CI workflows that auto-run

| Workflow          | Trigger                         | What it gates                                                                      |
| ----------------- | ------------------------------- | ---------------------------------------------------------------------------------- |
| `tests.yml`       | every push + PR                 | lint + format + vitest + build + Playwright e2e + hadolint + ci-success aggregator |
| `secret-scan.yml` | every push + PR + weekly cron   | gitleaks                                                                           |
| `codeql.yml`      | push to main + PR + weekly cron | SAST                                                                               |
| `gh-pages.yml`    | push to main                    | deploy to GitHub Pages                                                             |

### Manual / opt-in workflows

| Workflow               | Trigger                                             | Why manual                                                       |
| ---------------------- | --------------------------------------------------- | ---------------------------------------------------------------- |
| `pipeline.yml`         | push to main when `vars.AWS_DEPLOY_ENABLED=='true'` | full chained Terraform apply + S3 sync + CloudFront invalidation |
| `deploy-to-ec2.yml`    | workflow_dispatch                                   | needs EC2 secrets we don't auto-configure                        |
| `deploy-to-docker.yml` | push to `docker` branch                             | manual Docker Hub publish                                        |
| `integration.yml`      | workflow_dispatch                                   | needs Slack webhook                                              |

### Production deploy chain (when AWS is wired up)

```
Push to main
  └─→ tests.yml (auto)
  └─→ pipeline.yml (gated)
        ├─→ 1 · Test (lint + format + vitest)
        ├─→ 2 · Terraform Apply (S3 + CloudFront with OAC)
        └─→ 3 · Build & Deploy
                  ├─→ vite build
                  ├─→ aws s3 sync (long cache for assets, short for HTML)
                  └─→ aws cloudfront create-invalidation /*
```

**Bootstrap commands** for the Terraform state bucket are documented in [`infra/README.md`](infra/README.md).

---

## 18. Roadmap

### v1.1 — next 4 weeks

- [ ] **Curated playlists** — "Top 10 for landing pages", "Best free MUI alternatives", "Component libs with great a11y." Editorial commentary, weekly rotation.
- [ ] **Compare matrix** — checkbox 2–3 libraries → side-by-side comparison.
- [ ] **Live GitHub data** — weekly Action refreshes stars, last-commit, NPM downloads for every indexed library. "Last verified" badge on every entry.
- [ ] **Shareable favorites** — encode bookmark state in URL; share via copy-link.
- [ ] **Onboarding tour** — first-visit 4-step walkthrough.
- [ ] **Icon library cross-search** — Lucide, Phosphor, Heroicons, Tabler in one query.
- [ ] **Lighthouse CI** in `tests.yml` to enforce performance budgets.

### v2.0 — Q3-Q4 2026

- [ ] **AI semantic search** — "show me a lightweight chart library with great docs" → ranked answer with reasoning. OpenAI embeddings indexed weekly.
- [ ] **Stack scaffolder** — "I'm building a SaaS dashboard with auth + billing + charts" → personalized stack recommendation.
- [ ] **Public API** — Cloudflare Workers fronting the JSON metadata, rate-limited free tier.
- [ ] **Browser extension** — fingerprint a page's design system in one click.
- [ ] **VSCode extension** — search Atlas from your editor.
- [ ] **JSON-driven content** — move `src/data/*.ts` to `content/*.json` for easier editing.
- [ ] **Custom domain** + branded OG image.
- [ ] **i18n** — `en` + `es` + `hi`.
- [ ] **Backend (optional)** — Supabase for cross-device favorites, community submissions.

### v3.0 — strategic, when traction warrants

- [ ] **Premium tier** — private collections, team workspaces, AI search at higher volume.
- [ ] **Sponsored listings** (clearly marked, fair pricing).
- [ ] **Atlas API for AI agents** — sell access to AI dev assistants for fresh, verified library data.
- [ ] **Newsletter** — weekly digest of what was added.
- [ ] **Figma plugin.**

---

## 19. Success Metrics

We do not yet collect telemetry (intentional — see Privacy). When Plausible-class analytics ships in v1.1, the metrics that matter:

### North-star metric

**Weekly returning users who run a search.** Captures discovery + utility + repeat use in one number.

### Funnel metrics

| Stage       | Metric                                | Target (3-month) |
| ----------- | ------------------------------------- | ---------------- |
| Acquisition | Unique visitors / week                | 1,000            |
| Activation  | % who use ⌘K within first session     | 40%              |
| Engagement  | Searches / session                    | ≥ 3              |
| Retention   | 4-week return rate                    | ≥ 25%            |
| Action      | Outbound clicks (Visit site / GitHub) | ≥ 1.5 / session  |
| Save        | Bookmarks created / session           | ≥ 0.3            |

### Quality metrics

- Lighthouse Performance ≥ 90 on the home page (mobile)
- LCP ≤ 2.5s (95th, mobile)
- Search latency ≤ 80ms perceived
- CI green-rate ≥ 95% on main

---

## 20. Open Questions & Risks

### Open questions

- **Should Atlas have accounts?** Today: no. Trigger to add: when ≥ 30% of returning users hit the localStorage 5MB ceiling, or when "share my collection" is the #1 unmet feature request.
- **Free vs. premium tier?** Default: free forever for current scope. Premium ships only when team workspaces / private collections are credibly demanded.
- **Sponsored listings policy?** If/when adopted, the rules: clear "Sponsored" badge, no ranking-weight purchase, no ads beyond a clearly-labeled featured slot.
- **Static vs. CMS?** Today: static TypeScript. Migration to JSON is in v2.0. Full CMS (Sanity / Contentful) only if the corpus exceeds 5,000 entries.

### Risks

| Risk                                            | Mitigation                                                                                            |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Resource data goes stale**                    | Weekly auto-refresh Action (v1.1); quarterly editorial review                                         |
| **Atlas becomes "yet another link directory"**  | Editorial layer + curated playlists + opinionated pros/cons; Atlas Score (planned)                    |
| **Bundle size creeps**                          | Lighthouse CI (v1.1); route-level lazy loading; bundle budget in CI                                   |
| **Lecturer / course assessment friction**       | Repo stays green at all times; CI guardrails prevent regression                                       |
| **Maintenance burden of curated content**       | Quarterly review only; rest auto-refreshed; community submissions in v2.0 share the load              |
| **Brand collision with other "Atlas" products** | Acceptable — we're not registering the trademark; subdomain (`atlas.yourdomain.dev`) avoids confusion |

---

## 21. Appendix

### A — Repository structure

```
solidbackgrounds/                 # repo root (legacy name; product is "Atlas")
├── .github/
│   ├── dependabot.yml
│   ├── ISSUE_TEMPLATE/
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/                # 13 workflows; 4 auto-run, rest manual
├── infra/                        # Terraform: S3 + CloudFront for production deploy
├── solid-colour/                 # Atlas frontend (folder name kept for git history)
│   ├── src/
│   │   ├── components/           # 22 components
│   │   │   ├── tools/            # ContrastChecker, PaletteGenerator, TypeScale, ShadowGenerator
│   │   │   └── views/            # HomeView, BrowseView, DiscoverView, LibraryView, LibraryDetailView
│   │   ├── data/                 # 7 hand-curated TS data files
│   │   ├── hooks/                # useUniversalSearch
│   │   ├── store/appStore.ts     # single Zustand store
│   │   ├── utils/                # color + image helpers
│   │   └── test/                 # vitest setup + mocks
│   ├── e2e/                      # Playwright smoke tests
│   ├── Dockerfile                # multi-stage, non-root nginx
│   └── nginx.conf                # SPA fallback + security headers
├── docker-compose.yml
├── render.yaml                   # PaaS deploy (alternative to AWS)
├── COURSE_TIMELINE.md            # FSDE 2025 lecture-by-lecture map
├── PRD.md                        # this document
└── README.md
```

### B — Key data interfaces

```ts
// src/data/libraries.ts
export interface Library {
  id: string;
  name: string;
  description: string;
  url: string;
  framework: ("React" | "Vue" | "Svelte" | "Solid" | "Universal" | "CSS")[];
  styling: "Tailwind" | "CSS" | "CSS-in-JS" | "Unstyled" | "Mixed";
  pricing: "Free" | "Free + Pro" | "Paid";
  highlight?: string;
  initials: string;
  accent: string;
  npmPackage?: string;
  github?: string;
  typescript?: boolean;
  pros?: string[];
  cons?: string[];
  alternatives?: string[];
  tagline?: string;
}

// src/hooks/useUniversalSearch.ts
export type SearchKind =
  | "component"
  | "library"
  | "design-system"
  | "inspiration"
  | "tool"
  | "color";

export interface SearchItem {
  id: string;
  kind: SearchKind;
  title: string;
  subtitle: string;
  section: Section;
  haystack: string;
  url?: string;
  hex?: string;
  initials?: string;
  accent?: string;
}
```

### C — Section enum (single source of truth for navigation)

```ts
export type Section =
  // Atlas top-level
  | "home"
  | "components"
  | "blocks"
  | "templates"
  | "hooks"
  | "community"
  | "libraries"
  | "library-detail"
  | "design-systems"
  | "inspiration"
  | "tools"
  | "library"
  | "following"
  // Studio
  | "solid-colors"
  | "gradients"
  | "backgrounds"
  // Toolbox
  | "tool-contrast"
  | "tool-palette"
  | "tool-typescale"
  | "tool-shadow";
```

### D — Glossary

- **Atlas** — the product name. Single word, classical/mythological branding pattern.
- **Toolbox** — the navigation group containing the four embedded interactive utilities.
- **Studio** — the navigation group containing solid colors, gradients, and backgrounds (the "produce assets" surface).
- **Discover** — the navigation group containing curated catalogs (Component Libraries, Design Systems, UI Inspiration, Tools directory).
- **DiscoverCard** — the card primitive that renders an entry in any Discover catalog.
- **JTBD** — Jobs-to-be-done framework; what users hire the product to accomplish.
- **OAC** — Origin Access Control. AWS CloudFront's modern replacement for OAI; locks an S3 bucket so only the specific CloudFront distribution can read it.
- **SPA fallback** — CloudFront response policy that returns `200 /index.html` for any 403/404 from S3, enabling client-side routing on deep links.

---

## 22. Document History

| Version | Date       | Changes                                                  |
| ------- | ---------- | -------------------------------------------------------- |
| 1.0     | 2026-05-03 | Initial PRD covering shipped v1.0 + v1.1 / v2.0 roadmap. |
