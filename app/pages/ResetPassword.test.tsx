import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResetPassword from './ResetPassword.tsx';
import { MemoryRouter } from 'react-router-dom';
jest.mock('../apis/auth.api', () => ({
  resetPassword: jest.fn(() => Promise.resolve()),
}));
describe('ResetPassword', () => {
  it('validates and submits new password', async () => {
    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByPlaceholderText(/new password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText(/confirm password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));
    await waitFor(() => expect(screen.getByText(/password reset successful/i)).toBeInTheDocument());
  });
});
