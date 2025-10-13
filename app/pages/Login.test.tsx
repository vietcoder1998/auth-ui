import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login.tsx';
import { MemoryRouter } from 'react-router-dom';
jest.mock('../apis/auth.api', () => ({
  login: jest.fn(() => Promise.resolve({ token: 'test-token' })),
}));
describe('Login', () => {
  it('submits credentials and saves token', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    await waitFor(() => expect(localStorage.getItem('token')).toBe('test-token'));
  });
});
