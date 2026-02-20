# Testing Guide — colour-fun

This document describes all tests in the project and how to run them.

## Quick Start

```bash
cd solid-colour

npm run test           # Run all unit + integration tests
npm run test:unit      # Same but verbose output
npm run test:e2e       # Run Playwright E2E tests (requires browsers installed)
npm run test:coverage  # Run with code coverage report
```

## Test Architecture

```
┌────────────────────────────────────────────────────┐
│  🐢 E2E Tests (Playwright)                         │
│  Slow · Real Browser · 6 tests                     │
│  Full user flows: search, download, theme toggle    │
├────────────────────────────────────────────────────┤
│  ⚡ Integration Tests (Vitest + React Testing Lib) │
│  Medium · jsdom · 4 suites                         │
│  Components with store interaction & rendering      │
├────────────────────────────────────────────────────┤
│  🚀 Unit Tests (Vitest)                            │
│  Fast · No DOM · 4 suites                          │
│  Pure functions, data validation, store logic       │
└────────────────────────────────────────────────────┘
```

---

## Unit Tests (Fast · ~50ms)

### `src/utils/__tests__/colorUtils.test.ts`
Tests all 8 color conversion and validation functions.

| Test | What it verifies |
|------|-----------------|
| `hexToRgb` (7 tests) | Converts hex → RGB, handles `#` prefix, invalid input returns null, case insensitive |
| `rgbToHex` (6 tests) | Converts RGB → uppercase hex, clamps out-of-range values, pads single digits |
| `rgbToHsl` (6 tests) | Converts RGB → HSL for primaries, white, black, gray |
| `hslToRgb` (4 tests) | Converts HSL → RGB, roundtrip verification with `rgbToHsl` |
| `getContrastColor` (5 tests) | Returns `#FFFFFF` for dark backgrounds, `#000000` for light |
| `isValidHex` (6 tests) | Validates 3/6 char hex, rejects invalid strings |
| `normalizeHex` (4 tests) | Adds `#`, expands shorthand `#F00` → `#FF0000`, uppercases |
| `adjustBrightness` (5 tests) | Lightens/darkens colors, clamps to black/white boundaries |

### `src/utils/__tests__/imageGenerator.test.ts`
Tests image export utilities and preset data.

| Test | What it verifies |
|------|-----------------|
| `estimateFileSize` (6 tests) | Returns size estimates in B/KB/MB for png/jpeg/webp formats |
| `calculateDimensions` (5 tests) | Calculates height from aspect ratio: 16:9, 1:1, 4:3, 9:16, 21:9 |
| `aspectRatios` (4 tests) | All 8 ratios have label/ratio/presets, all presets have width/height |
| `defaultPreset` (1 test) | Default is 4K UHD (3840×2160) |

### `src/data/__tests__/colors.test.ts`
Tests the 238-color database and search/filter functions.

| Test | What it verifies |
|------|-----------------|
| `colors` array (4 tests) | Contains exactly 238 colors, all have valid hex, unique IDs, valid categories |
| `categoryLabels` (2 tests) | Has 12 categories (reds, oranges, yellows, greens, blues, purples, pinks, browns, grays, blacks, pastels, neons) |
| `getColorsByCategory` (4 tests) | Returns all 238 for 'all', 22 for 'reds', 32 for 'blues', 14 for 'neons' |
| `searchColors` (7 tests) | Search by name/hex/category, case insensitive, empty query returns all |

### `src/store/__tests__/appStore.test.ts`
Tests the Zustand store — all actions and state mutations.

| Test | What it verifies |
|------|-----------------|
| Theme (3 tests) | Default dark, toggle dark→light→dark |
| Search (2 tests) | Default empty, `setSearchQuery` updates state |
| Navigation (2 tests) | Default solid-colors, `setCurrentSection` switches |
| Category filter (2 tests) | Default all, `setSelectedCategory` updates |
| Download modal (2 tests) | `openDownloadModal` sets color + opens, `closeDownloadModal` clears |
| Recent colors (3 tests) | Adds colors, deduplicates, limits to 12 |
| Favorites (3 tests) | Toggle on/off, `clearFavorites` empties list |
| Toasts (4 tests) | Show with default/custom type, remove by ID, auto-dismiss after 3s |
| Download options (4 tests) | Set ratio, format, resolution, custom size |
| Sidebar (2 tests) | Toggle and close |
| Settings (2 tests) | Open and close |
| Preferences (3 tests) | High quality, reduced motion, sound effects |

---

## Integration Tests (Medium · ~500ms)

### `src/components/__tests__/ColorGrid.integration.test.tsx`
Tests the color grid component with real store interactions.

| Test | What it verifies |
|------|-----------------|
| Renders color cards | Grid displays hex codes for all colors |
| Shows color count | Displays "238 colors" |
| Filters by category | Setting category to 'reds' shows "22 colors" |
| Filters by search | Setting query to 'crimson' shows Crimson card |
| Empty state | Non-matching query shows "No colors found" message |
| Click opens modal | Clicking Pure Red card opens download modal with correct color |

### `src/components/__tests__/Header.integration.test.tsx`
Tests header: search, theme toggle, sidebar toggle.

| Test | What it verifies |
|------|-----------------|
| Renders logo | "colour-fun" text is visible |
| Renders search input | Search placeholder is present |
| Updates search | Typing updates store's `searchQuery` |
| Shows clear button | Clear button appears when search has text |
| Clears search | Clicking clear resets `searchQuery` to '' |
| Theme toggle | Clicking toggles dark→light |
| Color count | Shows "238 Colors" |
| Sidebar toggle | Menu button toggles sidebar state |

### `src/components/__tests__/DownloadModal.integration.test.tsx`
Tests the download modal open/close and display.

| Test | What it verifies |
|------|-----------------|
| Hidden when closed | Nothing renders when `isDownloadModalOpen` is false |
| Shows color info | Displays color name and hex when opened |
| Close button | Clicking close button sets `isDownloadModalOpen` to false |

### `src/components/__tests__/App.integration.test.tsx`
Tests full app rendering and section navigation.

| Test | What it verifies |
|------|-----------------|
| Header and footer | App renders branding and footer text |
| Solid colors default | "All Colors" grid title visible by default |
| Gradients section | Switching to gradients renders GradientGenerator |
| Images section | "Background Images" coming soon page |
| UI Themes section | "UI Themes" coming soon page |
| Version number | Footer shows v1.2.0 |

---

## E2E Tests (Slow · ~8s)

### `e2e/app.spec.ts`
Real browser tests using Playwright (Chromium).

| Test | What it verifies |
|------|-----------------|
| Page loads | Page title matches, footer branding visible, version shown |
| Color grid renders | "All Colors" heading, 238 count, Pure Red card visible |
| Search filters | Type "crimson" → Crimson shown, clear → all colors restored |
| Click opens modal | Clicking Pure Red → modal shows #FF0000 |
| Theme toggle | Toggle changes `data-theme`, toggle back restores original |
| Empty state | Search "xyznonexistent" → "No colors found" message |

---

## CI/CD Pipeline

The `frontend-tests.yml` workflow runs on every push/PR to `main` or `tests`:

```
Push/PR → Unit & Integration Tests (fast) → E2E Tests (slow, Chromium only)
```

- **Unit & Integration**: ~3s, runs first
- **E2E**: ~30s, runs only after unit/integration pass, installs Chromium only

---

## Mocks

| Mock | Purpose |
|------|---------|
| `src/test/__mocks__/framer-motion.tsx` | Replaces motion components with plain HTML elements |
| `src/test/__mocks__/pwa-register.ts` | Stubs `virtual:pwa-register/react` for tests |
| `src/test/setup.ts` | Browser API mocks: `matchMedia`, `IntersectionObserver`, `URL.createObjectURL` |
