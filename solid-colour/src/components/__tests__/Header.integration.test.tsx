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
vi.mock('./Header.module.css', () => ({
    default: new Proxy({}, { get: (_, prop) => prop }),
}));

// Import after mocks
const { Header } = await import('../Header');

describe('Header Integration', () => {
    beforeEach(() => {
        act(() => {
            useAppStore.setState({
                searchQuery: '',
                theme: 'dark',
                isSidebarOpen: false,
            });
        });
    });

    it('renders the logo text', () => {
        render(<Header />);
        expect(screen.getByText('colour-fun')).toBeInTheDocument();
    });

    it('renders the search input', () => {
        render(<Header />);
        const input = screen.getByPlaceholderText(/search colors/i);
        expect(input).toBeInTheDocument();
    });

    it('updates search query on input', async () => {
        const user = userEvent.setup();
        render(<Header />);

        const input = screen.getByPlaceholderText(/search colors/i);
        await user.clear(input);
        await user.type(input, 'b');

        expect(useAppStore.getState().searchQuery).toContain('b');
    });

    it('shows clear button when search has text', async () => {
        const user = userEvent.setup();
        render(<Header />);

        const input = screen.getByPlaceholderText(/search colors/i);
        await user.type(input, 'test');

        const clearBtn = screen.getByLabelText(/clear search/i);
        expect(clearBtn).toBeInTheDocument();
    });

    it('clears search when clear button is clicked', async () => {
        const user = userEvent.setup();
        render(<Header />);

        const input = screen.getByPlaceholderText(/search colors/i);
        await user.type(input, 'test');

        const clearBtn = screen.getByLabelText(/clear search/i);
        await user.click(clearBtn);

        expect(useAppStore.getState().searchQuery).toBe('');
    });

    it('toggles theme when theme button is clicked', async () => {
        const user = userEvent.setup();
        render(<Header />);

        const themeBtn = screen.getByLabelText(/toggle theme/i);
        await user.click(themeBtn);

        expect(useAppStore.getState().theme).toBe('light');
    });

    it('shows color count', () => {
        render(<Header />);
        expect(screen.getByText('238 Colors')).toBeInTheDocument();
    });

    it('toggles sidebar when menu button is clicked', async () => {
        const user = userEvent.setup();
        render(<Header />);

        const menuBtn = screen.getByLabelText(/toggle menu/i);
        await user.click(menuBtn);

        expect(useAppStore.getState().isSidebarOpen).toBe(true);
    });
});
