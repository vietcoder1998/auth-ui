import React, { useState, useEffect } from 'react';
import CommonSearch from '../../components/CommonSearch.tsx';

interface LoginHistoryEntry {
  id: string;
  ssoId?: string;
  userId: string;
  deviceIP?: string;
  userAgent?: string;
  loginAt: string;
  logoutAt?: string;
  status: string;
  location?: string;
  user: {
    id: string;
    email: string;
    nickname?: string;
  };
  sso?: {
    id: string;
    url: string;
    key: string;
  };
}

interface LoginStats {
  totalLogins: number;
  activeLogins: number;
  loggedOutLogins: number;
  expiredLogins: number;
  uniqueUsers: number;
}

const AdminLoginHistoryPage: React.FC = () => {
  const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>([]);
  const [stats, setStats] = useState<LoginStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLoginHistory = async (page = 1, search = '', status = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
        ...(status && { status }),
      });

      const response = await fetch(`/api/admin/login-history?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setLoginHistory(data.data);
        setTotalPages(data.pagination.totalPages);
        setCurrentPage(data.pagination.page);
      } else {
        console.error('Failed to fetch login history:', data.error);
      }
    } catch (error) {
      console.error('Error fetching login history:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/login-history/stats');
      const data = await response.json();
      
      if (response.ok) {
        setStats(data);
      } else {
        console.error('Failed to fetch login stats:', data.error);
      }
    } catch (error) {
      console.error('Error fetching login stats:', error);
    }
  };

  useEffect(() => {
    fetchLoginHistory();
    fetchStats();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLoginHistory(1, searchTerm, statusFilter);
  };

  const handlePageChange = (page: number) => {
    fetchLoginHistory(page, searchTerm, statusFilter);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    fetchLoginHistory(1, searchTerm, status);
  };

  const handleLogout = async (id: string) => {
    if (!confirm('Are you sure you want to log out this user?')) return;

    try {
      const response = await fetch(`/api/admin/login-history/${id}/logout`, {
        method: 'PATCH',
      });

      if (response.ok) {
        fetchLoginHistory(currentPage, searchTerm, statusFilter);
        fetchStats();
      } else {
        const data = await response.json();
        alert(`Failed to log out user: ${data.error}`);
      }
    } catch (error) {
      console.error('Error logging out user:', error);
      alert('Failed to log out user');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      logged_out: 'bg-gray-100 text-gray-800',
      expired: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Login History</h1>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Logins</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalLogins}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeLogins}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Logged Out</p>
                <p className="text-2xl font-bold text-gray-600">{stats.loggedOutLogins}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-red-600">{stats.expiredLogins}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Unique Users</p>
                <p className="text-2xl font-bold text-blue-600">{stats.uniqueUsers}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <CommonSearch
        searchPlaceholder="Search by user email, device IP, or location..."
        searchValue={searchTerm}
        onSearch={(value) => {
          setSearchTerm(value);
          fetchLoginHistory(1, value, statusFilter);
        }}
        onRefresh={() => {
          fetchLoginHistory(currentPage, searchTerm, statusFilter);
          fetchStats();
        }}
        loading={loading}
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { value: 'active', label: 'Active' },
              { value: 'logged_out', label: 'Logged Out' },
              { value: 'expired', label: 'Expired' }
            ]
          }
        ]}
        filterValues={{ status: statusFilter }}
        onFilterChange={(key, value) => {
          if (key === 'status') {
            setStatusFilter(value);
            fetchLoginHistory(1, searchTerm, value);
          }
        }}
      />

      {/* Login History Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Login Sessions</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">User</th>
                      <th className="text-left p-2">Device IP</th>
                      <th className="text-left p-2">Location</th>
                      <th className="text-left p-2">Login Time</th>
                      <th className="text-left p-2">Logout Time</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">SSO</th>
                      <th className="text-right p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loginHistory.map((entry) => (
                      <tr key={entry.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <div className="text-sm">
                            <div className="font-medium">{entry.user.email}</div>
                            {entry.user.nickname && (
                              <div className="text-gray-500">{entry.user.nickname}</div>
                            )}
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="font-mono text-sm">{entry.deviceIP || 'N/A'}</div>
                        </td>
                        <td className="p-2">
                          <div className="text-sm">{entry.location || 'N/A'}</div>
                        </td>
                        <td className="p-2 text-sm">
                          {formatDate(entry.loginAt)}
                        </td>
                        <td className="p-2 text-sm">
                          {entry.logoutAt ? formatDate(entry.logoutAt) : 'N/A'}
                        </td>
                        <td className="p-2">
                          {getStatusBadge(entry.status)}
                        </td>
                        <td className="p-2">
                          {entry.sso ? (
                            <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              SSO
                            </div>
                          ) : (
                            <div className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                              Direct
                            </div>
                          )}
                        </td>
                        <td className="p-2">
                          <div className="flex justify-end gap-2">
                            {entry.status === 'active' && (
                              <button
                                onClick={() => handleLogout(entry.id)}
                                className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                Force Logout
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLoginHistoryPage;