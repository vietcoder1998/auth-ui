import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Tooltip,
  Popconfirm,
  message
} from 'antd';
import {
  UserOutlined,
  CheckCircleOutlined,
  MinusCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  LogoutOutlined,
  GlobalOutlined,
  DesktopOutlined
} from '@ant-design/icons';
import CommonSearch from '../../components/CommonSearch.tsx';
import { adminApi } from '../../apis/admin.api.ts';

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
      const params = {
        page: page.toString(),
        limit: '10',
        search,
        ...(status && { status }),
      };

      const response = await adminApi.getLoginHistory(params);
      console.log(response.data)
      const data = response.data;
      
      setLoginHistory(data.data);
      setTotalPages(data.pagination.totalPages);
      setCurrentPage(data.pagination.page);
    } catch (error) {
      console.error('Error fetching login history:', error);
      message.error('Failed to fetch login history');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminApi.getLoginStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching login stats:', error);
      message.error('Failed to fetch login statistics');
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
    try {
      await adminApi.logoutUser(id);
      message.success('User logged out successfully');
      fetchLoginHistory(currentPage, searchTerm, statusFilter);
      fetchStats();
    } catch (error) {
      console.error('Error logging out user:', error);
      message.error('Failed to log out user');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      active: 'success',
      logged_out: 'default',
      expired: 'error',
    };
    return statusColors[status] || 'default';
  };

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (record: LoginHistoryEntry) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.user.email}</div>
          {record.user.nickname && (
            <div style={{ color: '#666', fontSize: '12px' }}>{record.user.nickname}</div>
          )}
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
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      render: (location: string) => (
        <span style={{ fontSize: '12px' }}>{location || 'N/A'}</span>
      ),
    },
    {
      title: 'Login Time',
      dataIndex: 'loginAt',
      key: 'loginAt',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Logout Time',
      dataIndex: 'logoutAt',
      key: 'logoutAt',
      render: (date: string) => date ? formatDate(date) : 'N/A',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag 
          color={getStatusColor(status)}
          icon={status === 'active' ? <CheckCircleOutlined /> : status === 'expired' ? <ClockCircleOutlined /> : <MinusCircleOutlined />}
        >
          {status.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'SSO',
      key: 'sso',
      render: (record: LoginHistoryEntry) => (
        record.sso ? (
          <Tag color="blue" icon={<GlobalOutlined />}>SSO</Tag>
        ) : (
          <Tag color="default" icon={<DesktopOutlined />}>Direct</Tag>
        )
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: LoginHistoryEntry) => (
        <Space>
          {record.status === 'active' && (
            <Popconfirm
              title="Force Logout"
              description="Are you sure you want to log out this user?"
              onConfirm={() => handleLogout(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Force Logout">
                <Button type="text" danger icon={<LogoutOutlined />} />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Typography.Title level={2}>Login History</Typography.Title>
      </div>

      {/* Stats Cards */}
      {stats && (
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={5}>
            <Card>
              <Statistic
                title="Total Logins"
                value={stats.totalLogins}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={5}>
            <Card>
              <Statistic
                title="Active Sessions"
                value={stats.activeLogins}
                valueStyle={{ color: '#3f8600' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={5}>
            <Card>
              <Statistic
                title="Logged Out"
                value={stats.loggedOutLogins}
                valueStyle={{ color: '#666' }}
                prefix={<MinusCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={5}>
            <Card>
              <Statistic
                title="Expired"
                value={stats.expiredLogins}
                valueStyle={{ color: '#cf1322' }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card>
              <Statistic
                title="Unique Users"
                value={stats.uniqueUsers}
                valueStyle={{ color: '#1890ff' }}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
        </Row>
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
      <Card title="Login Sessions">
        <Table
          columns={columns}
          dataSource={loginHistory}
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

export default AdminLoginHistoryPage;