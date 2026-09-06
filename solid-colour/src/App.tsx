import { useEffect } from 'react';
import { Header } from './components/Header';
import { SettingsModal } from './components/SettingsModal';
import { ReloadPrompt } from './components/ReloadPrompt';
import { ColorPicker } from './components/ColorPicker';
import { DownloadModal } from './components/DownloadModal';
import { ToastContainer } from './components/ToastContainer';
import { AskView } from './components/views/AskView';
import { LibrariesView } from './components/views/LibrariesView';
import { WallpapersView } from './components/views/WallpapersView';
import { CommandPalette } from './components/CommandPalette';
import { ShortcutsOverlay } from './components/ShortcutsOverlay';
import { DotMark } from './components/brand/DotMark';
import { APP_VERSION } from './constants/version';
import { useAppStore } from './store/appStore';
import { TooltipProvider } from './components/ui/tooltip';
import './components/dotmatrix-loader.css';
import './App.css';

function App() {
  const currentSection = useAppStore((s) => s.currentSection);
  const theme = useAppStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const renderContent = () => {
    switch (currentSection) {
      case 'libraries':
        return <LibrariesView />;
      case 'solid-colors':
      case 'gradients':
      case 'backgrounds':
        return <WallpapersView section={currentSection} />;
      case 'home':
      default:
        return <AskView />;
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="app">
        <main className="main-content">
          <Header />
          {renderContent()}
          {currentSection !== 'home' && (
            <footer className="footer">
              <div className="footer-content">
                <div className="footer-brand">
                  <DotMark size={14} />
                  <span>Atlas</span>
                  <span className="version">v{APP_VERSION}</span>
                </div>
                <p>Every component installs from its own library and keeps its own licence.</p>
              </div>
            </footer>
          )}
        </main>
        <DownloadModal />
        <ColorPicker />
        <SettingsModal />
        <CommandPalette />
        <ShortcutsOverlay />
        <ToastContainer />
        <ReloadPrompt />
      </div>
    </TooltipProvider>
  );
}

export default App;
