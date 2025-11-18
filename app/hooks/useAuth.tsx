import Cookies from 'js-cookie';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '~/apis/auth/index.ts';

interface User {
  id: string;
  email: string;
  nickname?: string;
  role: {
    id: string;
    name: string;
  };
  status: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loginAndDirection: (token: string, userData: User) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  directionWithParams: () => void;
  redirectToSSOLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Initialize auth state from cookies on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const redirectToSSOLogin = () => {
    const redirect = searchParams.get('redirect');
    const ssoUrl = `/sso/login?isSSO=true${redirect ? `&redirect=${encodeURIComponent(redirect)}` : ''}`;
    navigate(ssoUrl);
  };

  const directionWithParams = () => {
    const directionLink = searchParams.get('redirect') || '/admin';
    navigate(directionLink);
  };

  const initializeAuth = async () => {
    try {
      const savedToken = Cookies.get('auth_token');
      const savedUser = Cookies.get('auth_user');

      if (savedToken) {
        setToken(savedToken);

        if (!savedUser) {
          throw new Error('No user data in cookies');
        }

        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const loginAndDirection = async (newToken: string, userData: User) => {
    try {
      setLoading(true);
      setToken(newToken);
      const { role, ...user } = userData;
      const userRole = role ? { id: role.id, name: role.name } : undefined;
      debugger;
      // Save token to cookie
      Cookies.set('auth_token', newToken);
      Cookies.set('auth_user', JSON.stringify({ ...user, role: userRole }));
      directionWithParams();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    // Clear cookies
    Cookies.remove('auth_token');
    Cookies.remove('auth_user');

    navigate('/login');
    setLoading(false);
  };

  const refreshUser = async () => {
    if (!token) return;

    try {
      const userData = await authApi.getMe();
      setUser(userData);
      Cookies.set('auth_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      // If refresh fails, logout to prevent inconsistent state
      logout();
    }
  };

  const isAuthenticated = !!user && !!token;
  const contextValue: AuthContextType = {
    user,
    token,
    loginAndDirection,
    logout,
    loading,
    isAuthenticated,
    refreshUser,
    directionWithParams,
    redirectToSSOLogin,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error(
      'useAuth hook called outside of AuthProvider. Current location:',
      window.location.href
    );
    console.error('Component stack:', new Error().stack);
    throw new Error(
      'useAuth must be used within an AuthProvider. Make sure your component is wrapped in <AuthProvider>.'
    );
  }
  return context;
};

export default AuthContext;
