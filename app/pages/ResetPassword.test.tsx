import React from 'react';
import { render } from '@testing-library/react';
import { fireEvent, waitFor } from '@testing-library/dom';
import ResetPassword from './ResetPassword.tsx';
import { MemoryRouter } from 'react-router-dom';
jest.mock('../apis/auth.api', () => ({
  resetPassword: jest.fn(() => Promise.resolve()),
}));
describe('ResetPassword', () => {
  it('validates and submits new password', async () => {
    const { getByPlaceholderText, getByRole, getByText } = render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );
    fireEvent.change(getByPlaceholderText(/new password/i), { target: { value: 'password123' } });
    fireEvent.change(getByPlaceholderText(/confirm password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(getByRole('button', { name: /reset password/i }));
    await waitFor(() => expect(getByText(/password reset successful/i)).toBeInTheDocument());
  });
});
