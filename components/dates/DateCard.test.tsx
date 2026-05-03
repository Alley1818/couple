import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DateCard from './DateCard';

const mockDate = {
    id: '1',
    title: 'Ужин на крыше',
    description: 'Романтика',
    date_at: '2026-05-10T19:00:00Z',
    location: 'Москва',
    status: 'confirmed' as const,
    created_by: 'user-1',
    address: 'ул. Арбат, 10',
};

describe('DateCard', () => {
    it('renders title and status', () => {
        render(<DateCard date={mockDate} currentUserId="user-1" />);
        expect(screen.getByText('Ужин на крыше')).toBeInTheDocument();
        expect(screen.getByText('Подтверждено')).toBeInTheDocument();
    });

    it('shows "Время не выбрано" when date_at is null', () => {
        render(<DateCard date={{ ...mockDate, date_at: null }} currentUserId="user-1" />);
        expect(screen.getByText('Время не выбрано')).toBeInTheDocument();
    });

    it('shows pending confirmation for partner', () => {
        render(<DateCard date={{ ...mockDate, status: 'proposed' }} currentUserId="user-2" />);
        expect(screen.getByText(/партнёр ждёт/i)).toBeInTheDocument();
    });
});