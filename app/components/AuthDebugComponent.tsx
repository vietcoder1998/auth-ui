import React from 'react';
import { useAuth } from '../hooks/useAuth.tsx';

export const AuthDebugComponent: React.FC = () => {
  try {
    const { user, token, loading, isAuthenticated } = useAuth();
    
    return (
      <div style={{ 
        position: 'fixed', 
        top: '10px', 
        right: '10px', 
        background: '#f0f0f0', 
        padding: '10px', 
        borderRadius: '4px',
        fontSize: '12px',
        maxWidth: '300px',
        zIndex: 10000,
        border: '1px solid #ccc'
      }}>
        <strong>Auth Debug Info:</strong>
        <div>Loading: {loading ? 'true' : 'false'}</div>
        <div>Authenticated: {isAuthenticated ? 'true' : 'false'}</div>
        <div>Token: {token ? `${token.substring(0, 10)}...` : 'null'}</div>
        <div>User: {user ? user.email : 'null'}</div>
        <div>Context Available: ✅</div>
      </div>
    );
  } catch (error) {
    return (
      <div style={{ 
        position: 'fixed', 
        top: '10px', 
        right: '10px', 
        background: '#ffebee', 
        padding: '10px', 
        borderRadius: '4px',
        fontSize: '12px',
        maxWidth: '300px',
        zIndex: 10000,
        border: '1px solid #f44336',
        color: '#d32f2f'
      }}>
        <strong>Auth Error:</strong>
        <div>{error instanceof Error ? error.message : 'Unknown error'}</div>
        <div>Context Available: ❌</div>
      </div>
    );
  }
};

export default AuthDebugComponent;