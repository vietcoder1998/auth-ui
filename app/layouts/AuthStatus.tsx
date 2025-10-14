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

  if (!isAuthenticated) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-3">
        <span className="text-red-600">❌ Not authenticated</span>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-green-600">✅ Authenticated as</span>
          <span className="font-medium text-green-800">
            {user?.nickname || user?.email}
          </span>
          {user?.role && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
              {user.role.name}
            </span>
          )}
        </div>
        <div className="text-xs text-green-600">
          Token: {token?.substring(0, 10)}...
        </div>
      </div>
    </div>
  );
};

export default AuthStatus;