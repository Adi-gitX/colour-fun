import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Moon, Sun, Smartphone, Download, Trash2, Database, Info, Monitor } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import './SettingsModal.css';

export const SettingsModal = () => {
    const {
        isSettingsOpen,
        closeSettings,
        theme,
        toggleTheme,
        highQualityDownloads,
        setHighQualityDownloads,
        reducedMotion,
        setReducedMotion,

        clearFavorites,
        favorites
    } = useAppStore();

    const [activeTab, setActiveTab] = React.useState<'appearance' | 'data' | 'about'>('appearance');

    // Close on escape
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
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="settings-header">
                        <h2>Settings</h2>
                        <button className="close-btn" onClick={closeSettings}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="settings-c">
                        <div className="settings-sidebar">
                            <button
                                className={`tab-btn ${activeTab === 'appearance' ? 'active' : ''}`}
                                onClick={() => setActiveTab('appearance')}
                            >
                                <Monitor size={18} /> Appearance
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'data' ? 'active' : ''}`}
                                onClick={() => setActiveTab('data')}
                            >
                                <Database size={18} /> Data & Storage
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
                                onClick={() => setActiveTab('about')}
                            >
                                <Info size={18} /> About
                            </button>
                        </div>

                        <div className="settings-content">
                            {activeTab === 'appearance' && (
                                <div className="settings-section">
                                    <h3>Theme</h3>
                                    <div className="theme-toggle-large" onClick={toggleTheme}>
                                        <div className={`theme-option ${theme === 'light' ? 'active' : ''}`}>
                                            <Sun size={20} /> Light
                                        </div>
                                        <div className={`theme-option ${theme === 'dark' ? 'active' : ''}`}>
                                            <Moon size={20} /> Dark
                                        </div>
                                    </div>

                                    <h3>Accessibility</h3>
                                    <div className="setting-row">
                                        <div className="setting-info">
                                            <span>Reduced Motion</span>
                                            <p>Minimize animations across the app</p>
                                        </div>
                                        <Toggle
                                            value={reducedMotion}
                                            onChange={setReducedMotion}
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'data' && (
                                <div className="settings-section">
                                    <h3>Downloads</h3>
                                    <div className="setting-row">
                                        <div className="setting-info">
                                            <span>High Quality Downloads</span>
                                            <p>Export images in maximum resolution (4K+)</p>
                                        </div>
                                        <Toggle
                                            value={highQualityDownloads}
                                            onChange={setHighQualityDownloads}
                                        />
                                    </div>

                                    <h3>Storage</h3>
                                    <div className="setting-row">
                                        <div className="setting-info">
                                            <span>Clear Favorites</span>
                                            <p>{favorites.length} items saved locally</p>
                                        </div>
                                        <button
                                            className="danger-btn"
                                            onClick={() => {
                                                if (confirm('Are you sure? This cannot be undone.')) {
                                                    clearFavorites();
                                                }
                                            }}
                                        >
                                            <Trash2 size={16} /> Clear
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'about' && (
                                <div className="settings-section">
                                    <div className="about-header">
                                        <div className="app-logo">◆</div>
                                        <h3>Colour&Fun</h3>
                                        <p>v1.2.0 • Premium Edition</p>
                                    </div>

                                    <div className="feature-list">
                                        <div className="feature-item">
                                            <Smartphone size={20} />
                                            <div>
                                                <strong>Offline Ready</strong>
                                                <p>Works fully without internet connection</p>
                                            </div>
                                        </div>
                                        <div className="feature-item">
                                            <Download size={20} />
                                            <div>
                                                <strong>No Limits</strong>
                                                <p>Unlimited high-res exports</p>
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

// Simple Toggle Component
const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
        className={`toggle-switch ${value ? 'on' : 'off'}`}
        onClick={() => onChange(!value)}
    >
        <motion.div
            className="toggle-handle"
            layout
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
    </button>
);
