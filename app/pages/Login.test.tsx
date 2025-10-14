import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login.tsx';
import { AuthProvider } from '../hooks/useAuth.tsx';

// Mock the auth API
jest.mock('../apis/auth.api', () => ({
  login: jest.fn(),
  getMe: jest.fn(),
}));

// Get references to the mocked functions
const authApi = jest.requireMock('../apis/auth.api');
const mockLogin = authApi.login;
const mockGetMe = authApi.getMe;

// Mock document.cookie for cookie operations
const mockCookies: { [key: string]: string } = {};

Object.defineProperty(document, 'cookie', {
  get: () => {
    return Object.entries(mockCookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');
  },
  set: (cookieString: string) => {
    const [nameValue] = cookieString.split(';');
    const [name, value] = nameValue.split('=');
    
    if (value === '' || cookieString.includes('expires=Thu, 01 Jan 1970')) {
      delete mockCookies[name];
    } else {
      mockCookies[name] = value;
    }
  },
  configurable: true,
});

describe('Login', () => {
  beforeEach(() => {
    // Clear mocks and storage before each test
    jest.clearAllMocks();
    localStorage.clear();
    Object.keys(mockCookies).forEach(key => delete mockCookies[key]);
    
    // Setup default mock implementations
    mockLogin.mockResolvedValue({ 
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
      user: { id: '1', email: 'test@example.com', nickname: 'Test User' }
    });
    mockGetMe.mockResolvedValue({ 
      id: '1', 
      email: 'test@example.com', 
      nickname: 'Test User',
      status: 'active'
    });
  });

  it('submits credentials and saves token', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>
    );

    // Wait for auth provider to initialize
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    });

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText(/email/i), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { 
      target: { value: 'password123' } 
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Wait for the login API to be called
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    // Check that token is saved to localStorage (for backward compatibility)
    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('test-token');
    });
  });

  it('displays error message on login failure', async () => {
    // Mock failed login
    mockLogin.mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } }
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>
    );

    // Wait for auth provider to initialize
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    });

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText(/email/i), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { 
      target: { value: 'wrongpassword' } 
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});
