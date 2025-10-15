# Authentication System with Cookies - Usage Guide

## Overview
This authentication system provides a robust, cookie-based authentication solution with React Context for state management. It includes automatic token refresh, interceptors for API calls, and comprehensive error handling.

## 🔧 Features

### ✅ Cookie-Based Authentication
- Secure cookie storage for auth tokens
- Automatic token inclusion in API requests
- 7-day cookie expiration by default
- Fallback to localStorage for backward compatibility

### ✅ React Context Integration
- Global authentication state management
- Automatic re-authentication on app reload
- Loading states and error handling
- User data caching and refresh

### ✅ API Integration
- Automatic token attachment to requests
- Global 401 error handling with auto-logout
- Token refresh mechanism
- CORS and credentials support

## 🚀 Usage Examples

### 1. Basic Login Flow

```tsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.tsx';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await loginApi({ username: email, password });
      await login(response.token, response.user);
      // User is now logged in, cookies are set, context is updated
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
};
```

### 2. Protected Routes

```tsx
import ProtectedRoute from '../layouts/ProtectedRoute.tsx';

// Wrap your protected components
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// Or with custom redirect
<ProtectedRoute redirectTo="/signin">
  <AdminPanel />
</ProtectedRoute>
```

### 3. Using Auth Context

```tsx
import { useAuth } from '../hooks/useAuth.tsx';

const UserProfile: React.FC = () => {
  const { user, logout, refreshUser, isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;

  return (
    <div>
      <h1>Welcome, {user?.nickname || user?.email}!</h1>
      <p>Role: {user?.role?.name}</p>
      <button onClick={logout}>Logout</button>
      <button onClick={refreshUser}>Refresh User Data</button>
    </div>
  );
};
```

### 4. Auth Status Component

```tsx
import AuthStatus from '../layouts/AuthStatus.tsx';

// Shows current authentication state
<AuthStatus />
```

## 🔐 Security Features

### 1. Cookie Configuration
- `SameSite=Strict` for CSRF protection
- 7-day expiration
- Secure flag (in production)
- HttpOnly (can be configured)

### 2. Token Management
- Automatic token attachment to API requests
- Global 401 error handling
- Token validation on app load
- Secure token storage

### 3. Error Handling
- Automatic logout on token expiration
- Graceful error handling for API failures
- User-friendly error messages
- Loading states management

## 📋 API Structure

### Auth Context Interface
```typescript
interface AuthContextType {
  user: User | null;           // Current user data
  token: string | null;        // JWT token
  login: (token: string, userData?: User) => Promise<void>;
  logout: () => void;          // Clear auth state
  loading: boolean;            // Auth state loading
  isAuthenticated: boolean;    // Quick auth check
  refreshUser: () => Promise<void>; // Refresh user data
}
```

### User Interface
```typescript
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
```

## 🔄 Flow Diagrams

### Login Flow
1. User submits credentials
2. API call to `/users:login`
3. Response contains token and user data
4. `login()` function saves token to cookie
5. User data saved to cookie
6. Context state updated
7. User redirected to dashboard

### Auto-Login Flow (App Reload)
1. App loads, AuthProvider initializes
2. Check for `auth_token` cookie
3. If token exists, call `/users/me` API
4. Update user data in cookie and context
5. Set `isAuthenticated = true`
6. If API fails, logout user

### API Request Flow
1. User makes API request
2. Axios interceptor adds token from cookie
3. If 401 response, clear cookies and redirect to login
4. Handle other errors normally

## 🛠️ Configuration

### Environment Variables
```env
VITE_API_URL=http://localhost:13030/api
```

### Cookie Configuration
Modify the cookie utility functions in `useAuth.tsx`:

```typescript
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  const secure = window.location.protocol === 'https:' ? ';Secure' : '';
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict${secure}`;
};
```

## 🧪 Testing

### Test Authentication Flow
1. Go to `/login`
2. Enter credentials
3. Verify cookie is set in DevTools
4. Check that user is redirected
5. Reload page and verify auto-login
6. Test logout functionality

### Test Protected Routes
1. Navigate to protected route without login
2. Verify redirect to login page
3. Login and verify redirect back to original route
4. Test token expiration handling

## 📝 Best Practices

### 1. Token Security
- Use HTTPS in production
- Set appropriate cookie expiration
- Implement token rotation
- Monitor for suspicious activity

### 2. Error Handling
- Always handle loading states
- Provide user-friendly error messages
- Implement retry mechanisms
- Log errors for debugging

### 3. Performance
- Cache user data appropriately
- Minimize API calls
- Use loading states effectively
- Optimize re-renders

## 🔧 Troubleshooting

### Common Issues

#### 1. Cookies Not Set
- Check domain configuration
- Verify SameSite settings
- Ensure HTTPS in production

#### 2. Auto-Login Fails
- Check API endpoint `/users/me`
- Verify token format
- Check network connectivity

#### 3. 401 Errors
- Verify token expiration
- Check API authorization headers
- Ensure backend accepts Bearer tokens

### Debug Tools
```typescript
// Add to useAuth.tsx for debugging
useEffect(() => {
  console.log('Auth State:', { user, token, isAuthenticated, loading });
}, [user, token, isAuthenticated, loading]);
```

## 📦 File Structure
```
app/
├── hooks/
│   └── useAuth.tsx          # Auth context and hook
├── layouts/
│   ├── ProtectedRoute.tsx   # Route protection
│   └── AuthStatus.tsx       # Auth status display
├── pages/
│   ├── Login.tsx           # Login page
│   └── Dashboard.tsx       # Protected dashboard
└── apis/
    ├── index.ts            # API instance with interceptors
    └── auth.api.ts         # Auth API calls
```

This authentication system provides a solid foundation for secure, user-friendly authentication in React applications with automatic token management and comprehensive error handling.