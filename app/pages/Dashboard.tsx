import React from 'react';
import { useAuth } from '../hooks/useAuth.tsx';

const Dashboard: React.FC = () => {
  const { user, logout, refreshUser, loading } = useAuth();

  const handleLogout = () => {
    logout();
    // Optionally redirect to login page
    window.location.href = '/login';
  };

  const handleRefreshUser = async () => {
    try {
      await refreshUser();
      alert('User data refreshed successfully!');
    } catch (error) {
      alert('Failed to refresh user data');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <div className="space-x-3">
            <button
              onClick={handleRefreshUser}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Refresh User
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Information Card */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">User Information</h2>
            <div className="space-y-2">
              <div>
                <span className="font-medium text-gray-600">ID:</span>
                <span className="ml-2 text-gray-800">{user?.id}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Email:</span>
                <span className="ml-2 text-gray-800">{user?.email}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Nickname:</span>
                <span className="ml-2 text-gray-800">{user?.nickname || 'Not set'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Role:</span>
                <span className="ml-2 text-gray-800">{user?.role?.name || 'No role'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  user?.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user?.status}
                </span>
              </div>
            </div>
          </div>

          {/* Session Information Card */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Session Information</h2>
            <div className="space-y-2">
              <div>
                <span className="font-medium text-gray-600">Authentication:</span>
                <span className="ml-2 text-green-600">✓ Authenticated</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Storage:</span>
                <span className="ml-2 text-gray-800">Cookies + localStorage</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Auto-refresh:</span>
                <span className="ml-2 text-gray-800">Enabled</span>
              </div>
            </div>
          </div>
        </div>

        {/* Raw User Data (for debugging) */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">Raw User Data</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;