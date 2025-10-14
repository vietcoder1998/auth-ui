import React from 'react';
import { useAuth } from '../hooks/useAuth.tsx';

const AuthStatus: React.FC = () => {
  const { user, isAuthenticated, loading, token } = useAuth();

  if (loading) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
        <span className="text-yellow-600">🔄 Checking authentication...</span>
      </div>
    );
  }
  return
};

export default AuthStatus;