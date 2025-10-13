import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from './Register.tsx';
import { MemoryRouter } from 'react-router-dom';
jest.mock('../apis/auth.api', () => ({
  register: jest.fn(() => Promise.resolve()),
}));
describe('Register', () => {
  it('submits registration form', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByPlaceholderText(/nickname/i), { target: { value: 'tester' } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    await waitFor(() => expect(screen.queryByText(/registration failed/i)).not.toBeInTheDocument());
  });
});
