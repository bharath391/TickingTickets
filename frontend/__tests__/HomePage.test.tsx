import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HomePage from '../app/page';
import api from '@/lib/api';

// Mock useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock Link (Next.js Link)
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock API
vi.mock('@/lib/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly and fetches initial shows', async () => {
    // Mock API response
    (api.get as any).mockResolvedValue({
      data: {
        data: [
          {
            show_id: '1',
            movie_title: 'Inception',
            movie_genre: 'Sci-Fi',
            movie_desc: 'Dreams within dreams',
            movie_price: 10,
            theatre_name: 'PVR',
            theatre_location: 'Downtown',
            show_time: new Date().toISOString(),
            seat_count: 100,
            show_type: 'Evening',
          },
        ],
      },
    });

    render(<HomePage />);

    // Check Hero text
    expect(screen.getByText(/Find Your Next/i)).toBeInTheDocument();

    // Check if loading state appears initially (might be too fast) or waits for result
    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument();
    });

    expect(api.get).toHaveBeenCalledWith('/usersearch', { params: {} });
  });

  it('searches for a movie when form is submitted', async () => {
    (api.get as any).mockResolvedValue({
      data: {
        data: [],
      },
    });

    render(<HomePage />);

    const input = screen.getByPlaceholderText(/Search by movie title/i);
    const button = screen.getByRole('button', { name: '' }); // The SVG button has no text, might need aria-label or find by type

    // Find button by looking inside form or just by type submit
    // But let's act on the input and form
    fireEvent.change(input, { target: { value: 'Interstellar' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/usersearch', { params: { title: 'Interstellar' } });
    });
  });

  it('displays error message on API failure', async () => {
    (api.get as any).mockRejectedValue({
      response: {
        status: 500,
        data: { message: 'Server error' },
      },
    });

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch shows/i)).toBeInTheDocument();
    });
  });
  
  it('displays login message on 401', async () => {
    (api.get as any).mockRejectedValue({
      response: {
        status: 401,
      },
    });

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText(/Please login to search shows/i)).toBeInTheDocument();
    });
  });
});
