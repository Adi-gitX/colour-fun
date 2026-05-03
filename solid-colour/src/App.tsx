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
import { ComingSoon } from './components/placeholders/ComingSoon';
import { CommandPalette } from './components/CommandPalette';
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
      case 'design-systems':
        return <DiscoverView variant="design-systems" />;
      case 'inspiration':
        return <DiscoverView variant="inspiration" />;
      case 'tools':
        return <DiscoverView variant="tools" />;
      case 'library':
        return <LibraryView />;
      case 'solid-colors':
        return <ColorGrid />;
      case 'gradients':
        return <GradientGenerator />;
      case 'backgrounds':
        return <ImageGallery />;
      case 'blocks':
        return (
          <ComingSoon
            title="Blocks"
            icon="◫"
            description="Pre-built page sections — heros, pricing, footers — coming soon."
          />
        );
      case 'templates':
        return (
          <ComingSoon
            title="Templates"
            icon="◰"
            description="Full app templates with auth, billing and onboarding wired up."
          />
        );
      case 'hooks':
        return (
          <ComingSoon
            title="Hooks"
            icon="∿"
            description="Battle-tested React hooks for state, data and DOM patterns."
          />
        );
      case 'following':
        return (
          <ComingSoon
            title="Following"
            icon="◎"
            description="Track designers and engineers whose work you love."
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
      <ReloadPrompt />
    </div>
  );
}

export default App;
