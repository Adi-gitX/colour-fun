import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Hero } from './components/Hero';
import { ColorGrid } from './components/ColorGrid';
import { DownloadModal } from './components/DownloadModal';
import { ColorPicker } from './components/ColorPicker';
import { GradientGenerator } from './components/GradientGenerator';
import { SettingsModal } from './components/SettingsModal';
import { ReloadPrompt } from './components/ReloadPrompt';
import { ComingSoon } from './components/placeholders/ComingSoon';
import { useAppStore } from './store/appStore';
import { useEffect } from 'react';
import './App.css';

function App() {
  const { currentSection, theme } = useAppStore();

  // Sync theme with document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const renderContent = () => {
    switch (currentSection) {
      case 'solid-colors':
        return (
          <>
            <Hero />
            <div id="grid-start" style={{ paddingTop: 20 }}>
              <ColorGrid />
            </div>
          </>
        );
      case 'gradients':
        return <GradientGenerator />;
      case 'images':
        return (
          <ComingSoon
            title="Background Images"
            icon="🖼️"
            description="High-quality, curated background images and textures."
          />
        );
      case 'ui-themes':
        return (
          <ComingSoon
            title="UI Themes"
            icon="💻"
            description="Complete website UI themes and color palettes."
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app">
      {/* Header removed as requested for sidebar-centric navigation, or make it minimal if needed.
          User said "no ai looking full app... sidebar design...".
          The reference shows NO top header, just sidebar.
          But I need search... I'll put search in the main content top right or keep header but make it transparent/minimal.
          I'll keep Header but modify layout.
      */}
      <Sidebar />
      <main className="main-content">
        <Header />
        {renderContent()}
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-brand">
              <span>colour-fun</span>
              <span className="version">v1.2.0</span>
            </div>
            <p>Premium Color Assets for Creators</p>
          </div>
        </footer>
      </main>
      <DownloadModal />
      <ColorPicker />
      <SettingsModal />
      <ReloadPrompt />
    </div>
  );
}

export default App;
