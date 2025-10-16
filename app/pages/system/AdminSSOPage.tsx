import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Input,
  Tag,
  Table,
  Space,
  Modal,
  Form,
  Select,
  DatePicker,
  Statistic,
  Row,
  Col,
  Typography,
  message,
  Popconfirm,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SyncOutlined,
  KeyOutlined,
  CalendarOutlined,
  MonitorOutlined,
  UserOutlined,
  CopyOutlined,
  PlayCircleOutlined,
  LinkOutlined
} from '@ant-design/icons';
import CommonSearch from '../../components/CommonSearch.tsx';
import { adminApi } from '../../apis/admin.api.ts';
import CreateSSOModal from './modals/CreateSSOModal.tsx';
import EditSSOModal from './modals/EditSSOModal.tsx';
import SSOLoginLinkModal from '../../components/SSOLoginLinkModal.tsx';

interface SSOEntry {
  id: string;
  url: string;
  key: string;
  ssoKey?: string;
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

const { Title } = Typography;
const { Search } = Input;

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
  const [showLoginLinkModal, setShowLoginLinkModal] = useState(false);

  const fetchSSOEntries = async (page = 1, search = '', showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      
      const response = await adminApi.getSSOEntries({
        page,
        limit: 10,
        search
      });
      
      // Add null/undefined checks for response structure
      if (response?.data) {
        setSSOEntries(response.data.data || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setCurrentPage(response.data.pagination?.page || 1);
      } else {
        // Handle case where response.data is undefined
        console.warn('SSO API response data is undefined');
        setSSOEntries([]);
        setTotalPages(1);
        setCurrentPage(1);
      }
      
      return response?.data;
    } catch (error: any) {
      console.error('Error fetching SSO entries:', error);
      const errorMessage = error.response?.data?.error || 'Failed to fetch SSO entries';
      message.error(errorMessage);
      
      // Reset state on error
      setSSOEntries([]);
      setTotalPages(1);
      setCurrentPage(1);
      
      throw error;
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminApi.getSSOStats();
      
      if (response.data) {
        setStats(response.data);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching SSO stats:', error);
      const errorMessage = error.response?.data?.error || 'Failed to fetch SSO stats';
      message.error(errorMessage);
      throw error;
    }
  };

  useEffect(() => {
    fetchSSOEntries();
    fetchStats();
  }, []);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    fetchSSOEntries(1, value);
  };

  const handlePageChange = (page: number) => {
    fetchSSOEntries(page, searchTerm);
  };

  const handleDelete = async (id: string) => {
    try {
      await adminApi.deleteSSO(id);
      message.success('SSO entry deleted successfully');
      
      // Refresh data after deletion
      await Promise.all([
        fetchSSOEntries(currentPage, searchTerm, false),
        fetchStats()
      ]);
    } catch (error: any) {
      console.error('Error deleting SSO entry:', error);
      const errorMessage = error.response?.data?.error || 'Failed to delete SSO entry';
      message.error(errorMessage);
    }
  };

  const handleRegenerateKey = async (id: string) => {
    try {
      await adminApi.regenerateSSORKey(id);
      message.success('SSO key regenerated successfully');
      
      // Refresh SSO entries to show the new key
      await fetchSSOEntries(currentPage, searchTerm, false);
    } catch (error: any) {
      console.error('Error regenerating key:', error);
      const errorMessage = error.response?.data?.error || 'Failed to regenerate key';
      message.error(errorMessage);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success(`${label} copied to clipboard`);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      message.error('Failed to copy to clipboard');
    }
  };

  const openSSOLoginWindow = (ssoEntry: SSOEntry) => {
    // Block direct SSO login if entry is inactive or expired
    if (!ssoEntry.isActive) {
      message.error('Cannot login: SSO entry is inactive.');
      return;
    }
    if (isExpired(ssoEntry.expiresAt)) {
      message.error('Cannot login: SSO entry is expired.');
      return;
    }
    try {
      const ssoKey = ssoEntry.ssoKey || ssoEntry.key;
      const baseUrl = window.location.origin;
      // Construct SSO login URL with Gmail and key
      const ssoLoginUrl = `${baseUrl}/sso/login?key=${encodeURIComponent(ssoKey)}&gmail=${encodeURIComponent(ssoEntry.user.email)}&redirect=${encodeURIComponent(ssoEntry.url)}`;
      // Open in new private/incognito window
      const newWindow = window.open(
        ssoLoginUrl,
        '_blank',
        'width=500,height=800,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,directories=no,status=no'
      );
      if (newWindow) {
        message.success(`SSO login window opened for ${ssoEntry.user.email}`);
        // Optional: Listen for window close to refresh stats
        const checkClosed = setInterval(() => {
          if (newWindow.closed) {
            clearInterval(checkClosed);
            // Refresh stats after window is closed
            fetchStats();
            fetchSSOEntries(currentPage, searchTerm, false);
          }
        }, 1000);
        // Clear interval after 5 minutes to prevent memory leaks
        setTimeout(() => {
          clearInterval(checkClosed);
        }, 5 * 60 * 1000);
      } else {
        message.error('Unable to open new window. Please check your popup blocker settings.');
      }
    } catch (error: any) {
      console.error('Error opening SSO login window:', error);
      message.error('Failed to open SSO login window');
    }
  };

  const handleCreateSuccess = async () => {
    setShowCreateModal(false);
    
    // Show loading state while refreshing
    setLoading(true);
    
    try {
      // Refresh both SSO entries and stats in parallel
      // Reset to first page to ensure new entry is visible (newest entries are typically first)
      await Promise.all([
        fetchSSOEntries(1, searchTerm, false),
        fetchStats()
      ]);
      
      // Update current page to 1 if we moved there
      if (currentPage !== 1) {
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error refreshing data after SSO creation:', error);
      message.error('Failed to refresh data after creating SSO entry');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      render: (url: string) => (
        <code style={{ fontSize: '12px', background: '#f5f5f5', padding: '2px 4px', borderRadius: '3px' }}>
          {url}
        </code>
      ),
    },
    {
      title: 'SSO Key',
      key: 'ssoKey',
      render: (record: SSOEntry) => {
        const displayKey = record.ssoKey || record.key;
        const truncatedKey = displayKey.length > 16 ? `${displayKey.substring(0, 8)}...${displayKey.substring(-8)}` : displayKey;
        
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <code style={{ fontSize: '11px', background: '#f0f0f0', padding: '2px 6px', borderRadius: '3px' }}>
              {truncatedKey}
            </code>
            <Tooltip title="Copy SSO Key">
              <Button
                type="text"
                size="small"
                icon={<CopyOutlined />}
                onClick={() => copyToClipboard(displayKey, 'SSO Key')}
              />
            </Tooltip>
          </div>
        );
      },
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      render: (user: any) => (
        <div>
          <div style={{ fontWeight: 500 }}>{user.email}</div>
          {user.nickname && <div style={{ color: '#666', fontSize: '12px' }}>{user.nickname}</div>}
        </div>
      ),
    },
    {
      title: 'Device IP',
      dataIndex: 'deviceIP',
      key: 'deviceIP',
      render: (ip: string) => (
        <code style={{ fontSize: '12px' }}>{ip || 'N/A'}</code>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: SSOEntry) => (
        <Space>
          <Tag color={record.isActive ? 'green' : 'default'}>
            {record.isActive ? 'Active' : 'Inactive'}
          </Tag>
          {record.expiresAt && isExpired(record.expiresAt) && (
            <Tag color="red">Expired</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Logins',
      dataIndex: ['_count', 'loginHistory'],
      key: 'logins',
      render: (count: number) => <Tag>{count}</Tag>,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right' as const,
      width: 200,
      render: (record: SSOEntry) => (
        <Space>
          <Tooltip title="Generate Login Link">
            <Button
              type="text"
              icon={<LinkOutlined />}
              style={{ color: '#52c41a' }}
              onClick={() => {
                setSelectedSSO(record);
                setShowLoginLinkModal(true);
              }}
              disabled={!record.isActive || isExpired(record.expiresAt)}
            />
          </Tooltip>
          <Tooltip title="Open SSO Login">
            <Button
              type="text"
              icon={<PlayCircleOutlined />}
              style={{ color: '#1890ff' }}
              onClick={() => openSSOLoginWindow(record)}
              disabled={!record.isActive || isExpired(record.expiresAt)}
            />
          </Tooltip>
          <Tooltip title="Edit SSO Entry">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedSSO(record);
                setShowEditModal(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Regenerate Key">
            <Popconfirm
              title="Are you sure you want to regenerate the SSO key?"
              onConfirm={() => handleRegenerateKey(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="text" icon={<SyncOutlined />} />
            </Popconfirm>
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this SSO entry?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2}>SSO Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowCreateModal(true)}>
          Create SSO Entry
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Card>
              <Statistic
                title="Total SSO"
                value={stats.totalSSO}
                prefix={<KeyOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Card>
              <Statistic
                title="Active"
                value={stats.activeSSO}
                valueStyle={{ color: '#3f8600' }}
                prefix={<MonitorOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Card>
              <Statistic
                title="Inactive"
                value={stats.inactiveSSO}
                valueStyle={{ color: '#666' }}
                prefix={<MonitorOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Card>
              <Statistic
                title="Expired"
                value={stats.expiredSSO}
                valueStyle={{ color: '#cf1322' }}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Card>
              <Statistic
                title="Total Logins"
                value={stats.totalLogins}
                valueStyle={{ color: '#1890ff' }}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Search */}
      <CommonSearch
        searchPlaceholder="Search by URL, key, user email, or device IP..."
        searchValue={searchTerm}
        onSearch={handleSearch}
        onRefresh={async () => {
          try {
            await Promise.all([
              fetchSSOEntries(currentPage, searchTerm),
              fetchStats()
            ]);
          } catch (error) {
            console.error('Error refreshing data:', error);
          }
        }}
        loading={loading}
      />

      {/* SSO Entries Table */}
      <Card title="SSO Entries">
        <Table
          columns={columns}
          dataSource={ssoEntries}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            total: totalPages * 10,
            pageSize: 10,
            onChange: handlePageChange,
            showSizeChanger: false,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Edit SSO Modal */}
      <EditSSOModal
        visible={showEditModal}
        ssoEntry={selectedSSO}
        onCancel={() => {
          setShowEditModal(false);
          setSelectedSSO(null);
        }}
        onSuccess={async () => {
          // Refresh data after successful edit
          try {
            await Promise.all([
              fetchSSOEntries(currentPage, searchTerm, false),
              fetchStats()
            ]);
          } catch (error) {
            console.error('Error refreshing data after SSO edit:', error);
          }
        }}
      />

      {/* Create SSO Modal */}
      <CreateSSOModal
        visible={showCreateModal}
        onCancel={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* SSO Login Link Modal */}
      {selectedSSO && (
        <SSOLoginLinkModal
          visible={showLoginLinkModal}
          onCancel={() => {
            setShowLoginLinkModal(false);
            setSelectedSSO(null);
          }}
          ssoKey={selectedSSO.ssoKey || selectedSSO.key}
          userEmail={selectedSSO.user.email}
          appUrl={selectedSSO.url}
        />
      )}
    </div>
  );
};

export default AdminSSOPage;