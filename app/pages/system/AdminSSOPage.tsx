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
  UserOutlined
} from '@ant-design/icons';
import CommonSearch from '../../components/CommonSearch.tsx';

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
        message.error(`Failed to fetch SSO entries: ${data.error}`);
      }
    } catch (error) {
      console.error('Error fetching SSO entries:', error);
      message.error('Failed to fetch SSO entries');
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
        message.error(`Failed to fetch SSO stats: ${data.error}`);
      }
    } catch (error) {
      console.error('Error fetching SSO stats:', error);
      message.error('Failed to fetch SSO stats');
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
      const response = await fetch(`/api/admin/sso/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        message.success('SSO entry deleted successfully');
        fetchSSOEntries(currentPage, searchTerm);
        fetchStats();
      } else {
        const data = await response.json();
        message.error(`Failed to delete SSO entry: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting SSO entry:', error);
      message.error('Failed to delete SSO entry');
    }
  };

  const handleRegenerateKey = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/sso/${id}/regenerate-key`, {
        method: 'PATCH',
      });

      if (response.ok) {
        message.success('SSO key regenerated successfully');
        fetchSSOEntries(currentPage, searchTerm);
      } else {
        const data = await response.json();
        message.error(`Failed to regenerate key: ${data.error}`);
      }
    } catch (error) {
      console.error('Error regenerating key:', error);
      message.error('Failed to regenerate key');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
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
      render: (record: SSOEntry) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
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
        onRefresh={() => {
          fetchSSOEntries(currentPage, searchTerm);
          fetchStats();
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
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default AdminSSOPage;