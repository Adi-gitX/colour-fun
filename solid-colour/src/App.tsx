import { useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SettingsModal } from './components/SettingsModal';
import { ReloadPrompt } from './components/ReloadPrompt';
import { ColorGrid } from './components/ColorGrid';
import { ColorPicker } from './components/ColorPicker';
import { DownloadModal } from './components/DownloadModal';
import { GradientGenerator } from './components/GradientGenerator';
import { ImageGallery } from './components/ImageGallery';
import { HomeView } from './components/views/HomeView';
import { BrowseView } from './components/views/BrowseView';
import { DiscoverView } from './components/views/DiscoverView';
import { LibraryView } from './components/views/LibraryView';
import { LibraryDetailView } from './components/views/LibraryDetailView';
import { FontsView } from './components/views/FontsView';
import { HooksView } from './components/views/HooksView';
import { ComingSoon } from './components/placeholders/ComingSoon';
import { CommandPalette } from './components/CommandPalette';
import { ShortcutsOverlay } from './components/ShortcutsOverlay';
import { ContrastChecker } from './components/tools/ContrastChecker';
import { PaletteGenerator } from './components/tools/PaletteGenerator';
import { TypeScale } from './components/tools/TypeScale';
import { ShadowGenerator } from './components/tools/ShadowGenerator';
import { useAppStore } from './store/appStore';
import './App.css';

function App() {
  const { currentSection, theme } = useAppStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const renderContent = () => {
    switch (currentSection) {
      case 'home':
        return <HomeView />;
      case 'components':
        return (
          <BrowseView
            scope="all"
            eyebrow="Browse"
            title="Components"
            description="Copy-paste-ready React components, filtered by category."
          />
        );
      case 'community':
        return (
          <BrowseView
            scope="community"
            eyebrow="Community"
            title="Community submissions"
            description="Components submitted by the Atlas community. Sign in to submit your own."
          />
        );
      case 'libraries':
        return <DiscoverView variant="libraries" />;
      case 'library-detail':
        return <LibraryDetailView />;
      case 'design-systems':
        return <DiscoverView variant="design-systems" />;
      case 'inspiration':
        return <DiscoverView variant="inspiration" />;
      case 'fonts':
        return <FontsView />;
      case 'tools':
        return <DiscoverView variant="tools" />;
      case 'tool-contrast':
        return <ContrastChecker />;
      case 'tool-palette':
        return <PaletteGenerator />;
      case 'tool-typescale':
        return <TypeScale />;
      case 'tool-shadow':
        return <ShadowGenerator />;
      case 'library':
        return <LibraryView />;
      case 'solid-colors':
        return <ColorGrid />;
      case 'gradients':
        return <GradientGenerator />;
      case 'backgrounds':
        return <ImageGallery />;
      case 'hooks':
        return <HooksView />;
      case 'blocks':
        return (
          <ComingSoon
            title="Blocks"
            icon="◫"
            description="Pre-built, copy-paste-ready page sections — heroes, pricing, feature grids, FAQs, CTAs — sourced from the same OSS projects already indexed in Atlas."
            scope={[
              'Curated blocks from shadcn/ui examples, Magic UI, Aceternity, and shadcnblocks',
              'Live preview in dark + light + responsive at 360 / 768 / 1280',
              'Copy-paste JSX with auto-resolved import paths',
              'Filter by category (Hero / Pricing / FAQ / CTA / Footer)',
            ]}
            roadmap={[
              {
                label: 'v1.1 · indexing pipeline',
                description:
                  'Extend scripts/scrape-awesome.ts to also pull block-level URLs from each indexed project.',
              },
              {
                label: 'v1.2 · live preview',
                description:
                  'Render each block in a sandbox <iframe> with theme + viewport controls.',
              },
              {
                label: 'v1.3 · copy-paste flow',
                description: 'Resolve relative imports to absolute paths and offer one-click copy.',
              },
            ]}
            mailto="adithya.k@emergent.sh"
          />
        );
      case 'templates':
        return (
          <ComingSoon
            title="Templates"
            icon="◰"
            description="Full-app starters with auth, billing, dashboard, and settings already wired — picked from Vercel Templates, Astro Themes, and the wider OSS ecosystem."
            scope={[
              'Curated starters across Next.js, Remix, Astro, SvelteKit, Vite SPA',
              'Each entry tagged: Auth · Billing · CMS · Database · Email · Stripe',
              'GitHub stars + last commit refreshed weekly',
              'One-click "deploy to Vercel" / clone-with-CLI affordances',
            ]}
            roadmap={[
              {
                label: 'v1.2 · seed catalog',
                description:
                  'Inline-author 30+ template entries from Vercel Templates and Astro Themes.',
              },
              {
                label: 'v1.3 · feature filters',
                description:
                  'Multi-select feature filters (Auth, Billing, Stripe…) with stack preview.',
              },
              {
                label: 'v2.0 · stack scaffolder',
                description:
                  'Describe a SaaS in one sentence — Atlas picks a template + recommended stack.',
              },
            ]}
            mailto="adithya.k@emergent.sh"
          />
        );
      case 'following':
        return (
          <ComingSoon
            title="Following"
            icon="◎"
            description="Track designers and engineers whose work you love. Get notified when they add new picks to their public Atlas collections."
            scope={[
              'Public profile pages with shared collections',
              'Follow / unfollow individual curators',
              'Per-curator feed of newly-bookmarked resources',
              'Optional weekly digest email',
            ]}
            roadmap={[
              {
                label: 'v2.0 · accounts',
                description: 'Light auth (GitHub OAuth) — required gate for public profiles.',
              },
              {
                label: 'v2.1 · public collections',
                description: 'Share-via-URL collections graduate to /@username/collections/<slug>.',
              },
              {
                label: 'v2.2 · feed',
                description: 'Activity feed and weekly digest.',
              },
            ]}
            mailto="adithya.k@emergent.sh"
          />
        );
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <Header />
        {renderContent()}
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-brand">
              <span>Atlas</span>
              <span className="version">v1.0</span>
            </div>
            <p>Every design resource a developer or designer ever needs, in one place.</p>
          </div>
        </footer>
      </main>
      <DownloadModal />
      <ColorPicker />
      <SettingsModal />
      <CommandPalette />
      <ShortcutsOverlay />
      <ReloadPrompt />
    </div>
  );
}

export default App;
