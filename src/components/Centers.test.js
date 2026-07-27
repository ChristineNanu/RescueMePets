import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Centers from './Centers';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Centers vet messaging', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    localStorage.clear();
    localStorage.setItem('user_id', '123');

    global.fetch = jest.fn((url) => {
      if (url.endsWith('/centers')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([{ id: 1, name: 'Happy Paws', location: 'Nairobi', contact: 'info@happypaws.org', animal_count: 3, description: 'Test center' }]),
        });
      }

      if (url.endsWith('/animals?user_id=123')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }

      if (url.includes('/centers/1/stories')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }

      if (url.includes('/vets?center_id=1')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([{ id: 1, name: 'Dr. Asha', specialization: 'General Vet', clinic: 'Wellness Clinic', phone: '0700112233', center_id: 1 }]),
        });
      }

      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });
  });

  test('shows the vet message form when opening a center', async () => {
    render(
      <MemoryRouter>
        <Centers />
      </MemoryRouter>
    );

    const visitButton = await screen.findByRole('button', { name: /visit center/i });
    await userEvent.click(visitButton);

    await waitFor(() => {
      expect(screen.getByText(/our veterinary team/i)).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: /message/i }));

    expect(screen.getByPlaceholderText(/your name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/message for dr\. asha/i)).toBeInTheDocument();
  });
});
