import React, { useState, useEffect } from 'react';
import CommonSearch from '../../components/CommonSearch.tsx';

interface LogicHistoryEntry {
  id: string;
  userId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  oldValues?: string;
  newValues?: string;
  ipAddress?: string;
  userAgent?: string;
  notificationTemplateId?: string;
  notificationSent: boolean;
  createdAt: string;
  user: {
    id: string;
    email: string;
    nickname?: string;
  };
  notificationTemplate?: {
    id: string;
    name: string;
    title: string;
  };
}

interface LogicHistoryStats {
  totalEntries: number;
  notificationsSent: number;
  pendingNotifications: number;
  actionBreakdown: Array<{
    action: string;
    count: number;
  }>;
}

const AdminLogicHistoryPage: React.FC = () => {
  const [logicHistory, setLogicHistory] = useState<LogicHistoryEntry[]>([]);
  const [stats, setStats] = useState<LogicHistoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedEntry, setSelectedEntry] = useState<LogicHistoryEntry | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const fetchLogicHistory = async (page = 1, search = '', action = '', entityType = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
        ...(action && { action }),
        ...(entityType && { entityType }),
      });

      const response = await fetch(`/api/admin/logic-history?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setLogicHistory(data.data);
        setTotalPages(data.pagination.totalPages);
        setCurrentPage(data.pagination.page);
      } else {
        console.error('Failed to fetch logic history:', data.error);
      }
    } catch (error) {
      console.error('Error fetching logic history:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/logic-history/stats');
      const data = await response.json();
      
      if (response.ok) {
        setStats(data);
      } else {
        console.error('Failed to fetch logic history stats:', data.error);
      }
    } catch (error) {
      console.error('Error fetching logic history stats:', error);
    }
  };

  useEffect(() => {
    fetchLogicHistory();
    fetchStats();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogicHistory(1, searchTerm, actionFilter, entityTypeFilter);
  };

  const handlePageChange = (page: number) => {
    fetchLogicHistory(page, searchTerm, actionFilter, entityTypeFilter);
  };

  const handleMarkNotificationSent = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/logic-history/${id}/notification-sent`, {
        method: 'PATCH',
      });

      if (response.ok) {
        fetchLogicHistory(currentPage, searchTerm, actionFilter, entityTypeFilter);
        fetchStats();
      } else {
        const data = await response.json();
        alert(`Failed to mark notification as sent: ${data.error}`);
      }
    } catch (error) {
      console.error('Error marking notification as sent:', error);
      alert('Failed to mark notification as sent');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const parseJsonSafely = (jsonString?: string) => {
    if (!jsonString) return null;
    try {
      return JSON.parse(jsonString);
    } catch {
      return jsonString;
    }
  };

  const getActionBadge = (action: string) => {
    const actionColors = {
      login: 'bg-blue-100 text-blue-800',
      logout: 'bg-gray-100 text-gray-800',
      password_change: 'bg-yellow-100 text-yellow-800',
      profile_update: 'bg-green-100 text-green-800',
      permission_change: 'bg-purple-100 text-purple-800',
      role_change: 'bg-indigo-100 text-indigo-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${actionColors[action as keyof typeof actionColors] || 'bg-gray-100 text-gray-800'}`}>
        {action.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Logic History</h1>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Entries</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEntries}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Notifications Sent</p>
                <p className="text-2xl font-bold text-green-600">{stats.notificationsSent}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Pending Notifications</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingNotifications}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Breakdown */}
      {stats && stats.actionBreakdown.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Action Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.actionBreakdown.map((item) => (
              <div key={item.action} className="text-center">
                <div className="text-2xl font-bold text-gray-900">{item.count}</div>
                <div className="text-sm text-gray-600">{item.action.replace('_', ' ')}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <CommonSearch
        searchPlaceholder="Search by action, entity, or user..."
        searchValue={searchTerm}
        onSearch={(value) => {
          setSearchTerm(value);
          fetchLogicHistory(1, value, actionFilter, entityTypeFilter);
        }}
        onRefresh={() => {
          fetchLogicHistory(currentPage, searchTerm, actionFilter, entityTypeFilter);
          fetchStats();
        }}
        loading={loading}
        filters={[
          {
            key: 'action',
            label: 'Action',
            options: [
              { value: 'login', label: 'Login' },
              { value: 'logout', label: 'Logout' },
              { value: 'password_change', label: 'Password Change' },
              { value: 'profile_update', label: 'Profile Update' },
              { value: 'permission_change', label: 'Permission Change' },
              { value: 'role_change', label: 'Role Change' }
            ]
          },
          {
            key: 'entityType',
            label: 'Entity Type',
            options: [
              { value: 'user', label: 'User' },
              { value: 'role', label: 'Role' },
              { value: 'permission', label: 'Permission' },
              { value: 'token', label: 'Token' }
            ]
          }
        ]}
        filterValues={{ action: actionFilter, entityType: entityTypeFilter }}
        onFilterChange={(key, value) => {
          if (key === 'action') {
            setActionFilter(value);
          } else if (key === 'entityType') {
            setEntityTypeFilter(value);
          }
          fetchLogicHistory(1, searchTerm, 
            key === 'action' ? value : actionFilter,
            key === 'entityType' ? value : entityTypeFilter
          );
        }}
      />

      {/* Logic History Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Logic History Entries</h2>
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
                      <th className="text-left p-2">Action</th>
                      <th className="text-left p-2">Entity</th>
                      <th className="text-left p-2">IP Address</th>
                      <th className="text-left p-2">Notification</th>
                      <th className="text-left p-2">Created</th>
                      <th className="text-right p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logicHistory.map((entry) => (
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
                          {getActionBadge(entry.action)}
                        </td>
                        <td className="p-2">
                          {entry.entityType && (
                            <div className="text-sm">
                              <div className="font-medium">{entry.entityType}</div>
                              {entry.entityId && (
                                <div className="text-gray-500 font-mono text-xs">{entry.entityId}</div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="p-2">
                          <div className="font-mono text-sm">{entry.ipAddress || 'N/A'}</div>
                        </td>
                        <td className="p-2">
                          {entry.notificationTemplateId ? (
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                entry.notificationSent 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-orange-100 text-orange-800'
                              }`}>
                                {entry.notificationSent ? 'Sent' : 'Pending'}
                              </span>
                              {entry.notificationTemplate && (
                                <div className="text-xs text-gray-500">
                                  {entry.notificationTemplate.name}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">None</span>
                          )}
                        </td>
                        <td className="p-2 text-sm text-gray-500">
                          {formatDate(entry.createdAt)}
                        </td>
                        <td className="p-2">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedEntry(entry);
                                setShowDetailsModal(true);
                              }}
                              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              View Details
                            </button>
                            {entry.notificationTemplateId && !entry.notificationSent && (
                              <button
                                onClick={() => handleMarkNotificationSent(entry.id)}
                                className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                              >
                                Mark Sent
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

      {/* Details Modal */}
      {showDetailsModal && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Logic History Details</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>User:</strong> {selectedEntry.user.email}</div>
                    <div><strong>Action:</strong> {selectedEntry.action}</div>
                    <div><strong>Entity Type:</strong> {selectedEntry.entityType || 'N/A'}</div>
                    <div><strong>Entity ID:</strong> {selectedEntry.entityId || 'N/A'}</div>
                    <div><strong>IP Address:</strong> {selectedEntry.ipAddress || 'N/A'}</div>
                    <div><strong>Created:</strong> {formatDate(selectedEntry.createdAt)}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Notification</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Template:</strong> {selectedEntry.notificationTemplate?.name || 'None'}</div>
                    <div><strong>Status:</strong> {selectedEntry.notificationSent ? 'Sent' : 'Pending'}</div>
                  </div>
                </div>
              </div>

              {selectedEntry.oldValues && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-2">Old Values</h4>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                    {JSON.stringify(parseJsonSafely(selectedEntry.oldValues), null, 2)}
                  </pre>
                </div>
              )}

              {selectedEntry.newValues && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-2">New Values</h4>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                    {JSON.stringify(parseJsonSafely(selectedEntry.newValues), null, 2)}
                  </pre>
                </div>
              )}

              {selectedEntry.userAgent && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-2">User Agent</h4>
                  <div className="bg-gray-100 p-3 rounded text-sm break-all">
                    {selectedEntry.userAgent}
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogicHistoryPage;