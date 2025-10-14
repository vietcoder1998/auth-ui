import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuth, AuthProvider } from './useAuth.tsx';

// Mock the auth API
jest.mock('../apis/auth.api', () => ({
  getMe: jest.fn(),
}));

// Get reference to the mocked function
const authApi = jest.requireMock('../apis/auth.api');
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

// Test component to verify useAuth hook
const TestComponent: React.FC = () => {
  const { user, token, isAuthenticated, loading, login, logout } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="user-email">{user?.email || 'no-email'}</div>
      <div data-testid="token">{token ? 'has-token' : 'no-token'}</div>
      <button onClick={() => login('test-token', { id: '1', email: 'test@example.com', status: 'active' })}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('useAuth Hook', () => {
  beforeEach(() => {
    // Clear mocks and storage before each test
    jest.clearAllMocks();
    localStorage.clear();
    Object.keys(mockCookies).forEach(key => delete mockCookies[key]);
    
    // Setup default mock implementations
    mockGetMe.mockResolvedValue({ 
      id: '1', 
      email: 'test@example.com', 
      nickname: 'Test User',
      status: 'active'
    });
  });

  it('should provide initial auth state', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    );
    
    // Initially should not be authenticated
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
      expect(screen.getByTestId('user-email')).toHaveTextContent('no-email');
      expect(screen.getByTestId('token')).toHaveTextContent('no-token');
    });

    // Loading should eventually be false
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });
  });

  it('should handle login correctly', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    // Click login button
    const loginButton = screen.getByText('Login');
    loginButton.click();

    // Wait for login to complete
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('token')).toHaveTextContent('has-token');
    });

    // Check that token is saved to localStorage
    expect(localStorage.getItem('token')).toBe('test-token');
  });

  it('should handle logout correctly', async () => {
    // Set initial auth state
    mockCookies['auth_token'] = 'test-token';
    mockCookies['auth_user'] = JSON.stringify({ 
      id: '1', 
      email: 'test@example.com',
      status: 'active'
    });
    localStorage.setItem('token', 'test-token');

    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    );

    // Should be authenticated initially
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
    });

    // Click logout button
    const logoutButton = screen.getByText('Logout');
    logoutButton.click();

    // Wait for logout to complete
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
      expect(screen.getByTestId('user-email')).toHaveTextContent('no-email');
      expect(screen.getByTestId('token')).toHaveTextContent('no-token');
    });

    // Check that tokens are cleared
    expect(localStorage.getItem('token')).toBeNull();
    expect(mockCookies).toEqual({});
  });
});