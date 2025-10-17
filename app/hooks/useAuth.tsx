import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getMe } from '../apis/auth.api.ts';

interface User {
  id: string;
  email: string;
  nickname?: string;
  role?: {
    id: string;
    name: string;
  };
  status: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, userData?: User) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Cookie utility functions
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
};

const getCookie = (name: string): string | null => {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from cookies on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const savedToken = getCookie('auth_token');
      const savedUser = getCookie('auth_user');

      if (savedToken) {
        setToken(savedToken);
        
        // Try to get fresh user data from API
        try {
          const userData = await getMe();
          setUser(userData);
          // Update user cookie with fresh data
          setCookie('auth_user', JSON.stringify(userData));
        } catch (error) {
          // If API call fails, try to use saved user data
          if (savedUser) {
            try {
              const parsedUser = JSON.parse(savedUser);
              setUser(parsedUser);
            } catch (parseError) {
              console.error('Failed to parse saved user data:', parseError);
              // Clear invalid cookies
              logout();
            }
          } else {
            // No saved user data and API call failed, logout
            logout();
          }
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (newToken: string, userData?: User) => {
    try {
      setLoading(true);
      setToken(newToken);
      
      // Save token to cookie
      setCookie('auth_token', newToken);
      
      // Get user data if not provided
      let userToSet: User;
      if (userData) {
        userToSet = userData;
      } else {
        userToSet = await getMe();
      }
      
      setUser(userToSet);
      
      // Save user data to cookie
      setCookie('auth_user', JSON.stringify(userToSet));
      
      // Also save to localStorage for backward compatibility
      localStorage.setItem('token', newToken);
      
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
    deleteCookie('auth_token');
    deleteCookie('auth_user');
    
    // Clear localStorage for backward compatibility
    localStorage.removeItem('token');
    
    setLoading(false);
  };

  const refreshUser = async () => {
    if (!token) return;
    
    try {
      const userData = await getMe();
      setUser(userData);
      setCookie('auth_user', JSON.stringify(userData));
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
    login,
    logout,
    loading,
    isAuthenticated,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error('useAuth hook called outside of AuthProvider. Current location:', window.location.href);
    console.error('Component stack:', new Error().stack);
    throw new Error('useAuth must be used within an AuthProvider. Make sure your component is wrapped in <AuthProvider>.');
  }
  return context;
};

export default AuthContext;