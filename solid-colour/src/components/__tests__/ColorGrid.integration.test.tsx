import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAppStore } from '../../store/appStore';
import { act } from '@testing-library/react';

// Mock framer-motion
vi.mock('framer-motion', async () => {
    const mock = await import('../../test/__mocks__/framer-motion');
    return mock;
});

// Mock CSS modules
vi.mock('./ColorGrid.module.css', () => ({
    default: new Proxy({}, { get: (_, prop) => prop }),
}));

// Import after mocks
const { ColorGrid } = await import('../ColorGrid');

describe('ColorGrid Integration', () => {
    beforeEach(() => {
        act(() => {
            useAppStore.setState({
                searchQuery: '',
                selectedCategory: 'all',
                favorites: [],
                selectedColor: null,
                isDownloadModalOpen: false,
            });
        });
    });

    it('renders color cards', () => {
        render(<ColorGrid />);
        // Should render a grid with color cards
        const allColors = screen.getAllByText(/^#[A-F0-9]{6}$/i);
        expect(allColors.length).toBeGreaterThan(0);
    });

    it('shows color count', () => {
        render(<ColorGrid />);
        expect(screen.getByText(/238 colors/i)).toBeInTheDocument();
    });

    it('filters by category', () => {
        act(() => {
            useAppStore.setState({ selectedCategory: 'reds' });
        });
        render(<ColorGrid />);
        expect(screen.getByText(/22 colors/i)).toBeInTheDocument();
    });

    it('filters by search query', () => {
        act(() => {
            useAppStore.setState({ searchQuery: 'crimson' });
        });
        render(<ColorGrid />);
        expect(screen.getByText('Crimson')).toBeInTheDocument();
    });

    it('shows empty state for no results', () => {
        act(() => {
            useAppStore.setState({ searchQuery: 'xyznonexistent' });
        });
        render(<ColorGrid />);
        expect(screen.getByText(/No colors found/i)).toBeInTheDocument();
    });

    it('clicking a card opens download modal', async () => {
        const user = userEvent.setup();
        render(<ColorGrid />);
        const firstCard = screen.getByText('Pure Red').closest('div');
        if (firstCard) {
            await user.click(firstCard);
        }
        expect(useAppStore.getState().isDownloadModalOpen).toBe(true);
        expect(useAppStore.getState().selectedColor?.name).toBe('Pure Red');
    });
});
