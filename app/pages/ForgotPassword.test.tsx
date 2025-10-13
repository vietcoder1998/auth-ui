import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ForgotPassword from './ForgotPassword.tsx';
import { MemoryRouter } from 'react-router-dom';
jest.mock('../apis/auth.api', () => ({
  forgotPassword: jest.fn(() => Promise.resolve()),
}));
describe('ForgotPassword', () => {
  it('submits email and shows success message', async () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));
    await waitFor(() => expect(screen.getByText(/password reset link sent/i)).toBeInTheDocument());
  });
});
