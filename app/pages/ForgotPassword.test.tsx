import { render } from '@testing-library/react';
import { fireEvent, waitFor } from '@testing-library/dom';
import { MemoryRouter } from 'react-router-dom';
import ForgotPassword from './ForgotPassword.tsx';
jest.mock('../apis/auth.api', () => ({
  forgotPassword: jest.fn(() => Promise.resolve()),
}));
describe('ForgotPassword', () => {
  it('submits email and shows success message', async () => {
    const { getByPlaceholderText, getByRole, getByText } = render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );
    fireEvent.change(getByPlaceholderText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.click(getByRole('button', { name: /send reset link/i })); 
    await waitFor(() => expect(getByText(/password reset link sent/i)).toBeInTheDocument());
  });
});
