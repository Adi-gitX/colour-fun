import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useAppStore } from '../../store/appStore';
import { act } from '@testing-library/react';

// Mock framer-motion
vi.mock('framer-motion', async () => {
    const mock = await import('../../test/__mocks__/framer-motion');
    return mock;
});

// Mock all CSS modules used by components
vi.mock('../Header.module.css', () => ({
    default: new Proxy({}, { get: (_, prop) => prop }),
}));
vi.mock('../Sidebar.module.css', () => ({
    default: new Proxy({}, { get: (_, prop) => prop }),
}));
vi.mock('../Hero.module.css', () => ({
    default: new Proxy({}, { get: (_, prop) => prop }),
}));
vi.mock('../ColorGrid.module.css', () => ({
    default: new Proxy({}, { get: (_, prop) => prop }),
}));
vi.mock('../DownloadModal.module.css', () => ({
    default: new Proxy({}, { get: (_, prop) => prop }),
}));
vi.mock('../ColorPicker.module.css', () => ({
    default: new Proxy({}, { get: (_, prop) => prop }),
}));
vi.mock('../GradientGenerator.module.css', () => ({
    default: new Proxy({}, { get: (_, prop) => prop }),
}));
vi.mock('../ReloadPrompt.module.css', () => ({
    default: new Proxy({}, { get: (_, prop) => prop }),
}));
vi.mock('../Toast.module.css', () => ({
    default: new Proxy({}, { get: (_, prop) => prop }),
}));
vi.mock('../SettingsModal.css', () => ({}));

// Mock ReloadPrompt component directly (avoids virtual:pwa-register/react import issue)
vi.mock('../ReloadPrompt', () => ({
    ReloadPrompt: () => null,
}));

// Mock virtual module for PWA
vi.mock('virtual:pwa-register/react', () => ({
    useRegisterSW: () => ({
        needRefresh: [false],
        offlineReady: [false],
        updateServiceWorker: vi.fn(),
    }),
}));

// Mock react-colorful
vi.mock('react-colorful', () => ({
    HexColorPicker: () => <div data-testid="color-picker" />,
    HexColorInput: (props: Record<string, unknown>) => <input data-testid="color-input" {...props} />,
}));

// Import after mocks
const { default: App } = await import('../../App');

describe('App Integration', () => {
    beforeEach(() => {
        act(() => {
            useAppStore.setState({
                currentSection: 'solid-colors',
                theme: 'dark',
                searchQuery: '',
                selectedCategory: 'all',
                isDownloadModalOpen: false,
                isPickerOpen: false,
                isSettingsOpen: false,
                isSidebarOpen: false,
            });
        });
    });

    it('renders the app with header and footer', () => {
        render(<App />);
        expect(screen.getAllByText('colour-fun').length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText(/Premium Color Assets/i)).toBeInTheDocument();
    });

    it('renders solid colors section by default', () => {
        render(<App />);
        // The grid title should show "All Colors"
        expect(screen.getByText(/All Colors/i)).toBeInTheDocument();
    });

    it('renders gradients section', () => {
        act(() => {
            useAppStore.setState({ currentSection: 'gradients' });
        });
        render(<App />);
        // GradientGenerator should render
        expect(document.querySelector('.app')).toBeInTheDocument();
    });

    it('renders images coming soon section', () => {
        act(() => {
            useAppStore.setState({ currentSection: 'images' });
        });
        render(<App />);
        expect(screen.getByText('Background Images')).toBeInTheDocument();
    });

    it('renders ui-themes coming soon section', () => {
        act(() => {
            useAppStore.setState({ currentSection: 'ui-themes' });
        });
        render(<App />);
        expect(screen.getByText('UI Themes')).toBeInTheDocument();
    });

    it('renders version number', () => {
        render(<App />);
        expect(screen.getByText(/v1\.2\.0/)).toBeInTheDocument();
    });
});
