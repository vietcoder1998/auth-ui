import React from 'react';
import { render } from '@testing-library/react';
import { fireEvent, waitFor } from '@testing-library/dom';
import Register from './Register.tsx';
import { MemoryRouter } from 'react-router-dom';
jest.mock('../apis/auth.api', () => ({
  register: jest.fn(() => Promise.resolve()),
}));
describe('Register', () => {
  it('submits registration form', async () => {
    const { getByPlaceholderText, getByRole, queryByText } = render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    fireEvent.change(getByPlaceholderText(/nickname/i), { target: { value: 'tester' } });
    fireEvent.change(getByPlaceholderText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(getByPlaceholderText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(getByRole('button', { name: /register/i }));
    await waitFor(() => expect(queryByText(/registration failed/i)).not.toBeInTheDocument());
  });
});
