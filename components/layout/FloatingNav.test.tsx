import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FloatingNav from './FloatingNav';

vi.mock('next/navigation', () => ({
    usePathname: () => '/dates',
}));

describe('FloatingNav', () => {
    it('highlights active tab', () => {
        render(<FloatingNav />);
        const activeTab = screen.getByText('Свидания').closest('a');
        expect(activeTab).toHaveClass('relative');
    });

    it('renders all 5 tabs', () => {
        render(<FloatingNav />);
        expect(screen.getByText('Главная')).toBeInTheDocument();
        expect(screen.getByText('Свидания')).toBeInTheDocument();
        expect(screen.getByText('Календарь')).toBeInTheDocument();
        expect(screen.getByText('Идеи')).toBeInTheDocument();
        expect(screen.getByText('Профиль')).toBeInTheDocument();
    });
});