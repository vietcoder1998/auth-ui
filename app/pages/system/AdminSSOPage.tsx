import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  RefreshCw,
  Key,
  Calendar,
  Monitor,
  User
} from 'lucide-react';

interface SSOEntry {
  id: string;
  url: string;
  key: string;
  userId: string;
  deviceIP?: string;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    nickname?: string;
  };
  _count: {
    loginHistory: number;
  };
}

interface SSOStats {
  totalSSO: number;
  activeSSO: number;
  inactiveSSO: number;
  expiredSSO: number;
  totalLogins: number;
}

const AdminSSOPage: React.FC = () => {
  const [ssoEntries, setSSOEntries] = useState<SSOEntry[]>([]);
  const [stats, setStats] = useState<SSOStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSSO, setSelectedSSO] = useState<SSOEntry | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchSSOEntries = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/sso?page=${page}&limit=10&search=${encodeURIComponent(search)}`
      );
      const data = await response.json();
      
      if (response.ok) {
        setSSOEntries(data.data);
        setTotalPages(data.pagination.totalPages);
        setCurrentPage(data.pagination.page);
      } else {
        console.error('Failed to fetch SSO entries:', data.error);
      }
    } catch (error) {
      console.error('Error fetching SSO entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/sso/stats');
      const data = await response.json();
      
      if (response.ok) {
        setStats(data);
      } else {
        console.error('Failed to fetch SSO stats:', data.error);
      }
    } catch (error) {
      console.error('Error fetching SSO stats:', error);
    }
  };

  useEffect(() => {
    fetchSSOEntries();
    fetchStats();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSSOEntries(1, searchTerm);
  };

  const handlePageChange = (page: number) => {
    fetchSSOEntries(page, searchTerm);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this SSO entry?')) return;

    try {
      const response = await fetch(`/api/admin/sso/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchSSOEntries(currentPage, searchTerm);
        fetchStats();
      } else {
        const data = await response.json();
        alert(`Failed to delete SSO entry: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting SSO entry:', error);
      alert('Failed to delete SSO entry');
    }
  };

  const handleRegenerateKey = async (id: string) => {
    if (!confirm('Are you sure you want to regenerate the SSO key?')) return;

    try {
      const response = await fetch(`/api/admin/sso/${id}/regenerate-key`, {
        method: 'PATCH',
      });

      if (response.ok) {
        fetchSSOEntries(currentPage, searchTerm);
      } else {
        const data = await response.json();
        alert(`Failed to regenerate key: ${data.error}`);
      }
    } catch (error) {
      console.error('Error regenerating key:', error);
      alert('Failed to regenerate key');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">SSO Management</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create SSO Entry
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total SSO</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSSO}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Monitor className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeSSO}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive</CardTitle>
              <Monitor className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.inactiveSSO}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired</CardTitle>
              <Calendar className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.expiredSSO}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Logins</CardTitle>
              <User className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalLogins}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search by URL, key, user email, or device IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* SSO Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>SSO Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">URL</th>
                      <th className="text-left p-2">User</th>
                      <th className="text-left p-2">Device IP</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Logins</th>
                      <th className="text-left p-2">Created</th>
                      <th className="text-right p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ssoEntries.map((sso) => (
                      <tr key={sso.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <div className="font-mono text-sm">{sso.url}</div>
                        </td>
                        <td className="p-2">
                          <div className="text-sm">
                            <div className="font-medium">{sso.user.email}</div>
                            {sso.user.nickname && (
                              <div className="text-gray-500">{sso.user.nickname}</div>
                            )}
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="font-mono text-sm">{sso.deviceIP || 'N/A'}</div>
                        </td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            <Badge variant={sso.isActive ? 'default' : 'secondary'}>
                              {sso.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            {sso.expiresAt && isExpired(sso.expiresAt) && (
                              <Badge variant="destructive">Expired</Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge variant="outline">{sso._count.loginHistory}</Badge>
                        </td>
                        <td className="p-2 text-sm text-gray-500">
                          {formatDate(sso.createdAt)}
                        </td>
                        <td className="p-2">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedSSO(sso);
                                setShowEditModal(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRegenerateKey(sso.id)}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(sso.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    Previous
                  </Button>
                  <span className="px-4 py-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSSOPage;