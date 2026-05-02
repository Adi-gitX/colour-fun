# colour-fun

[![Tests](https://github.com/Adi-gitX/colour-fun/actions/workflows/tests.yml/badge.svg)](https://github.com/Adi-gitX/colour-fun/actions/workflows/tests.yml)
[![Secret scan](https://github.com/Adi-gitX/colour-fun/actions/workflows/secret-scan.yml/badge.svg)](https://github.com/Adi-gitX/colour-fun/actions/workflows/secret-scan.yml)
[![CodeQL](https://github.com/Adi-gitX/colour-fun/actions/workflows/codeql.yml/badge.svg)](https://github.com/Adi-gitX/colour-fun/actions/workflows/codeql.yml)
[![Deploy](https://github.com/Adi-gitX/colour-fun/actions/workflows/gh-pages.yml/badge.svg)](https://github.com/Adi-gitX/colour-fun/actions/workflows/gh-pages.yml)

> Course timeline & lecturer commit map → [COURSE_TIMELINE.md](COURSE_TIMELINE.md)

Hard finding the right solid background color? **colour&fun** lets you grab clean, pixel-perfect backgrounds in any color, any size — instantly.

**Live Demo:** [colour-fun on Vercel](https://colour-fun.vercel.app) · [GitHub Pages](https://adi-gitx.github.io/colour-fun/)

---

## Architecture

```
solidbackgrounds/
├── .github/
│   ├── dependabot.yml            # Automated dependency updates
│   └── workflows/
│       ├── github-actions.yml    # CI: Build + Lint + Format check
│       ├── integration.yml       # Matrix test (Node 20/22) + Slack
│       ├── frontend-tests.yml    # Unit/Integration → E2E pipeline
│       ├── unit-integration.yaml # Combined test + E2E workflow
│       ├── gh-pages.yml          # Deploy to GitHub Pages
│       ├── deploy.yml            # Deploy to EC2 via SSH
│       ├── manual.yml            # Remote SSH commands (EC2)
│       ├── 01-recap.yml          # Recap workflow (manual dispatch)
│       ├── 02-variables-secrets-artifacts.yml
│       └── 03-server-matrix-test.yml
│
├── solid-colour/                 # Frontend Application
│   ├── src/
│   │   ├── components/           # React UI Components
│   │   │   ├── ColorGrid.tsx     # Color palette grid with filtering
│   │   │   ├── ColorPicker.tsx   # Custom color picker with precision controls
│   │   │   ├── GradientGenerator.tsx
│   │   │   ├── DownloadModal.tsx # Export modal (1080p, 4K, custom)
│   │   │   ├── SettingsModal.tsx # User preferences
│   │   │   ├── Header.tsx        # Search, theme toggle, sidebar trigger
│   │   │   ├── Hero.tsx          # Landing section
│   │   │   ├── Sidebar.tsx       # Category navigation
│   │   │   └── __tests__/        # Integration tests (4 suites)
│   │   ├── store/                # Zustand state management
│   │   │   ├── appStore.ts
│   │   │   └── __tests__/        # Store unit tests
│   │   ├── utils/                # Color conversion, image generation
│   │   │   ├── colorUtils.ts
│   │   │   ├── imageGenerator.ts
│   │   │   └── __tests__/        # Utility unit tests
│   │   ├── data/                 # 238-color database
│   │   │   ├── colors.ts
│   │   │   └── __tests__/        # Data validation tests
│   │   └── test/                 # Test setup & mocks
│   ├── e2e/                      # Playwright E2E tests
│   │   └── app.spec.ts           # 6 full browser tests
│   ├── vitest.config.ts          # Unit/Integration test config
│   ├── playwright.config.ts      # E2E test config
│   ├── eslint.config.js          # ESLint flat config
│   └── .prettierrc               # Code formatting rules
│
├── devops/                       # DevOps Resources
│   ├── classNotes/               # Learning documentation
│   └── scripts/                  # Automation scripts
│       ├── run.sh                # Idempotent project setup
│       ├── run2.sh               # Development utilities
│       └── run5.sh               # AWS EC2 instance launcher
│
├── .pre-commit-config.yaml       # Pre-commit hooks
├── vercel.json                   # Vercel deployment config
└── README.md
```

### Component Flow

```
User → Header (search/theme) → ColorGrid (filter/display) → DownloadModal (export)
                                      ↑
                               Zustand Store ← Sidebar (categories)
                                      ↑
                              colorUtils.ts (conversions)
                              imageGenerator.ts (canvas export)
```

---

## Tech Stack

| Category               | Technology                     |
| ---------------------- | ------------------------------ |
| Framework              | React 19                       |
| Language               | TypeScript 5.9                 |
| Build                  | Vite 7                         |
| State                  | Zustand                        |
| Styling                | CSS Modules                    |
| Animations             | Framer Motion                  |
| PWA                    | Vite PWA Plugin                |
| Unit/Integration Tests | Vitest + React Testing Library |
| E2E Tests              | Playwright                     |
| Linting                | ESLint 9 (flat config)         |
| Formatting             | Prettier                       |
| CI/CD                  | GitHub Actions                 |
| Hosting                | Vercel + GitHub Pages          |

---

## Features

- 238 curated solid color palette with 12 categories
- Custom color picker with hex/RGB/HSL precision controls
- Gradient background generator with angle and stop controls
- High-resolution image export (1080p, 4K, custom dimensions)
- Multiple export formats (PNG, JPEG, WebP)
- Dark/Light theme toggle with persistence
- Search and filter by name, hex, or category
- Favorites and recent colors tracking
- Progressive Web App with offline support
- Responsive design across all devices

---

## CI/CD Workflow

The project uses multiple GitHub Actions workflows forming a comprehensive pipeline:

```
  Push to main ──┬──→ CI (build + lint + format check)
                 ├──→ Integration (matrix: Node 20/22 + Slack notification)
                 ├──→ Frontend Tests (unit/integration → E2E)
                 ├──→ GitHub Pages (build + deploy)
                 └──→ EC2 Deploy (SSH → pull → build → nginx)

  Pull Request ──┬──→ CI (build + lint + format check)
                 ├──→ Integration (matrix test)
                 └──→ Frontend Tests (unit/integration → E2E)
```

**CI (`github-actions.yml`):** Runs build, ESLint, and Prettier format check in parallel jobs. Triggers on both push and pull request to main.

**Integration (`integration.yml`):** Tests across Node 20 and 22 using matrix strategy. Sends Slack notifications on success/failure.

**Frontend Tests (`frontend-tests.yml`):** Two-stage pipeline — unit/integration tests run first (fast, ~3s), and E2E tests follow only if they pass (slower, ~30s with Chromium).

**GitHub Pages (`gh-pages.yml`):** Builds the Vite app and deploys to GitHub Pages using the official `deploy-pages` action.

**EC2 Deploy (`deploy.yml`):** SSHes into an EC2 instance, pulls latest code, installs dependencies, builds, and deploys to nginx.

---

## Testing

The project follows the testing pyramid approach:

```
┌────────────────────────────────────────────────────┐
│  E2E Tests (Playwright)                            │
│  6 tests · Real browser · Full user flows          │
├────────────────────────────────────────────────────┤
│  Integration Tests (Vitest + React Testing Lib)    │
│  4 suites · jsdom · Component + store interaction  │
├────────────────────────────────────────────────────┤
│  Unit Tests (Vitest)                               │
│  4 suites · No DOM · Pure functions + store logic  │
└────────────────────────────────────────────────────┘
```

```bash
cd solid-colour

npm run test           # Run all unit + integration tests
npm run test:unit      # Verbose output
npm run test:e2e       # Playwright E2E (requires browsers)
npm run test:coverage  # Coverage report
npm run lint           # ESLint check
npm run format:check   # Prettier format check
```

See [TESTING.md](solid-colour/TESTING.md) for detailed test documentation with per-test descriptions.

---

## Design Decisions

**React + Vite + TypeScript:** Vite provides near-instant HMR and optimized builds. TypeScript catches type errors at compile time, which is especially valuable for color manipulation functions where hex/RGB/HSL conversions need strict typing.

**Zustand over Redux:** The app's state (theme, search, categories, favorites, download options) is relatively flat. Zustand provides the same centralized store pattern without Redux's boilerplate — no action creators, reducers, or providers needed.

**CSS Modules:** Component-scoped styles prevent class name collisions without runtime overhead. Each component gets its own `.module.css` file, keeping styles co-located with components.

**Testing Pyramid:** Unit tests cover pure utility functions (fast, no DOM). Integration tests verify component-store interactions with jsdom. E2E tests validate real user flows in Chromium. This layered approach catches bugs at the cheapest level possible.

**PWA:** The Vite PWA plugin enables offline access and installability with minimal configuration — important for a tool that users might want to use without internet.

---

## Challenges

**CI Matrix Testing:** Getting tests to pass consistently across Node 20, and 22 required careful dependency management. Some packages had different behavior across versions, leading to the `fail-fast: false` strategy so all versions get tested even if one fails.

**E2E in CI:** Playwright tests in GitHub Actions required explicit browser installation (`playwright install --with-deps chromium`), increased timeouts for slower CI runners, and building the app before running tests since Playwright serves from the build output.

**Monorepo Structure:** The project combines a frontend app with DevOps learning resources. Workflows needed `working-directory` and `paths-ignore` configurations to avoid triggering CI on documentation changes.

**Pre-commit Hooks:** Integrating pre-commit hooks with the JavaScript ecosystem required balancing between the Python-based `pre-commit` framework and npm-native tools like ESLint and Prettier.

---

## Idempotent Scripts

All DevOps scripts are designed to produce the same result regardless of how many times they're run:

| Script    | Purpose                 | Idempotent Pattern                                         |
| --------- | ----------------------- | ---------------------------------------------------------- |
| `run.sh`  | Project setup           | `mkdir -p`, file existence checks, conditional npm install |
| `run2.sh` | Development environment | `mkdir -p ./logs`, `.env` existence check                  |
| `run5.sh` | AWS EC2 launch          | Unique security group naming with timestamp                |

```bash
bash devops/scripts/run.sh dev    # First run: installs everything
bash devops/scripts/run.sh dev    # Second run: skips, same result
```

---

## Development

```bash
cd solid-colour
npm install
npm run dev
```

## Build

```bash
cd solid-colour
npm run build
```

Output: `solid-colour/dist/`

---

## License

MIT

---

## Author

[Adi-gitX](https://github.com/Adi-gitX)
