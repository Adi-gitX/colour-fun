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
vi.mock('./DownloadModal.module.css', () => ({
    default: new Proxy({}, { get: (_, prop) => prop }),
}));

// Import after mocks
const { DownloadModal } = await import('../DownloadModal');

describe('DownloadModal Integration', () => {
    const mockColor = {
        id: 'red-1',
        name: 'Pure Red',
        hex: '#FF0000',
        category: 'reds' as const,
    };

    beforeEach(() => {
        act(() => {
            useAppStore.setState({
                selectedColor: null,
                isDownloadModalOpen: false,
                selectedRatio: '16:9',
                selectedFormat: 'png',
                selectedResolution: { width: 3840, height: 2160 },
            });
        });
    });

    it('does not render when closed', () => {
        render(<DownloadModal />);
        expect(screen.queryByText('Pure Red')).not.toBeInTheDocument();
    });

    it('renders color info when open', () => {
        act(() => {
            useAppStore.getState().openDownloadModal(mockColor);
        });
        render(<DownloadModal />);
        expect(screen.getByText('Pure Red')).toBeInTheDocument();
        expect(screen.getByText('#FF0000')).toBeInTheDocument();
    });

    it('closes when close button is clicked', async () => {
        const user = userEvent.setup();
        act(() => {
            useAppStore.getState().openDownloadModal(mockColor);
        });
        const { container } = render(<DownloadModal />);

        const closeBtn = container.querySelector('.closeBtn') as HTMLButtonElement;
        expect(closeBtn).toBeTruthy();
        await user.click(closeBtn);
        expect(useAppStore.getState().isDownloadModalOpen).toBe(false);
    });
});
