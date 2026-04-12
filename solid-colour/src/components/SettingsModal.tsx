import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Moon, Sun, Trash2, Database, Info, Monitor, Bookmark, Github } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import './SettingsModal.css';

export const SettingsModal = () => {
  const {
    isSettingsOpen,
    closeSettings,
    theme,
    toggleTheme,
    reducedMotion,
    setReducedMotion,
    bookmarks,
    clearBookmarks,
  } = useAppStore();

  const [activeTab, setActiveTab] = React.useState<'appearance' | 'data' | 'about'>('appearance');

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSettings();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [closeSettings]);

  if (!isSettingsOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="settings-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeSettings}
      >
        <motion.div
          className="settings-modal"
          initial={{ scale: 0.97, opacity: 0, y: 8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.97, opacity: 0, y: 8 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="settings-header">
            <h2>Settings</h2>
            <button className="close-btn" onClick={closeSettings}>
              <X size={16} strokeWidth={1.75} />
            </button>
          </div>

          <div className="settings-c">
            <div className="settings-sidebar">
              <button
                className={`tab-btn ${activeTab === 'appearance' ? 'active' : ''}`}
                onClick={() => setActiveTab('appearance')}
              >
                <Monitor size={15} strokeWidth={1.75} />
                Appearance
              </button>
              <button
                className={`tab-btn ${activeTab === 'data' ? 'active' : ''}`}
                onClick={() => setActiveTab('data')}
              >
                <Database size={15} strokeWidth={1.75} />
                Data
              </button>
              <button
                className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
                onClick={() => setActiveTab('about')}
              >
                <Info size={15} strokeWidth={1.75} />
                About
              </button>
            </div>

            <div className="settings-content">
              {activeTab === 'appearance' && (
                <div className="settings-section">
                  <h3>Theme</h3>
                  <div className="theme-toggle-large" onClick={toggleTheme}>
                    <div className={`theme-option ${theme === 'light' ? 'active' : ''}`}>
                      <Sun size={15} strokeWidth={1.75} />
                      Light
                    </div>
                    <div className={`theme-option ${theme === 'dark' ? 'active' : ''}`}>
                      <Moon size={15} strokeWidth={1.75} />
                      Dark
                    </div>
                  </div>

                  <h3>Accessibility</h3>
                  <div className="setting-row">
                    <div className="setting-info">
                      <strong>Reduced Motion</strong>
                      <p>Minimize animations across the app</p>
                    </div>
                    <Toggle value={reducedMotion} onChange={setReducedMotion} />
                  </div>
                </div>
              )}

              {activeTab === 'data' && (
                <div className="settings-section">
                  <h3>Storage</h3>
                  <div className="setting-row">
                    <div className="setting-info">
                      <strong>Clear bookmarks</strong>
                      <p>{bookmarks.length} items saved locally</p>
                    </div>
                    <button
                      className="danger-btn"
                      onClick={() => {
                        if (confirm('Clear all bookmarks? This cannot be undone.')) {
                          clearBookmarks();
                        }
                      }}
                    >
                      <Trash2 size={13} strokeWidth={1.75} />
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'about' && (
                <div className="settings-section">
                  <div className="about-header">
                    <div className="app-logo">S</div>
                    <h3>Stax</h3>
                    <p>v1.0 · The library of UI libraries</p>
                  </div>

                  <div className="feature-list">
                    <div className="feature-item">
                      <Bookmark size={15} strokeWidth={1.75} />
                      <div>
                        <strong>Bookmarks sync</strong>
                        <p>Saved locally — backend sync coming soon</p>
                      </div>
                    </div>
                    <div className="feature-item">
                      <Github size={15} strokeWidth={1.75} />
                      <div>
                        <strong>Open source</strong>
                        <p>Stax is open source. Contribute on GitHub.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
  <button className={`toggle-switch ${value ? 'on' : 'off'}`} onClick={() => onChange(!value)}>
    <motion.div
      className="toggle-handle"
      layout
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    />
  </button>
);
