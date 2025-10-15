import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Typography,
  Row,
  Col,
  Statistic,
  Tooltip,
  message
} from 'antd';
import {
  EyeOutlined,
  CheckOutlined,
  FileTextOutlined,
  UserOutlined,
  ClockCircleOutlined,
  BellOutlined
} from '@ant-design/icons';
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
        message.success('Notification marked as sent successfully');
        fetchLogicHistory(currentPage, searchTerm, actionFilter, entityTypeFilter);
        fetchStats();
      } else {
        const data = await response.json();
        message.error(`Failed to mark notification as sent: ${data.error}`);
      }
    } catch (error) {
      console.error('Error marking notification as sent:', error);
      message.error('Failed to mark notification as sent');
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

  const getActionColor = (action: string) => {
    const actionColors: Record<string, string> = {
      login: 'blue',
      logout: 'default',
      password_change: 'orange',
      profile_update: 'green',
      permission_change: 'purple',
      role_change: 'magenta',
      sso_login: 'cyan',
      sso_logout: 'geekblue'
    };
    return actionColors[action] || 'default';
  };

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (record: LogicHistoryEntry) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.user.email}</div>
          {record.user.nickname && (
            <div style={{ color: '#666', fontSize: '12px' }}>{record.user.nickname}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => (
        <Tag color={getActionColor(action)}>
          {action.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Entity',
      key: 'entity',
      render: (record: LogicHistoryEntry) => (
        record.entityType ? (
          <div>
            <div style={{ fontWeight: 500 }}>{record.entityType}</div>
            {record.entityId && (
              <div style={{ color: '#666', fontSize: '11px', fontFamily: 'monospace' }}>
                {record.entityId.substring(0, 8)}...
              </div>
            )}
          </div>
        ) : (
          <span style={{ color: '#ccc' }}>N/A</span>
        )
      ),
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      render: (ip: string) => (
        <code style={{ fontSize: '12px' }}>{ip || 'N/A'}</code>
      ),
    },
    {
      title: 'Notification',
      key: 'notification',
      render: (record: LogicHistoryEntry) => (
        record.notificationTemplateId ? (
          <Space direction="vertical" size="small" style={{ fontSize: '12px' }}>
            <Tag 
              color={record.notificationSent ? 'success' : 'warning'} 
              icon={record.notificationSent ? <CheckOutlined /> : <ClockCircleOutlined />}
            >
              {record.notificationSent ? 'Sent' : 'Pending'}
            </Tag>
            {record.notificationTemplate && (
              <span style={{ color: '#666' }}>{record.notificationTemplate.name}</span>
            )}
          </Space>
        ) : (
          <Tag color="default">None</Tag>
        )
      ),
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
      render: (record: LogicHistoryEntry) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedEntry(record);
                setShowDetailsModal(true);
              }}
            />
          </Tooltip>
          {record.notificationTemplateId && !record.notificationSent && (
            <Tooltip title="Mark as Sent">
              <Button
                type="text"
                icon={<BellOutlined />}
                onClick={() => handleMarkNotificationSent(record.id)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Typography.Title level={2}>Logic History</Typography.Title>
      </div>

      {/* Stats Cards */}
      {stats && (
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Entries"
                value={stats.totalEntries}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Notifications Sent"
                value={stats.notificationsSent}
                valueStyle={{ color: '#3f8600' }}
                prefix={<CheckOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Pending Notifications"
                value={stats.pendingNotifications}
                valueStyle={{ color: '#fa8c16' }}
                prefix={<BellOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Action Breakdown */}
      {stats && stats.actionBreakdown.length > 0 && (
        <Card title="Action Breakdown" style={{ marginBottom: '24px' }}>
          <Row gutter={16}>
            {stats.actionBreakdown.map((item) => (
              <Col xs={12} sm={6} key={item.action}>
                <Statistic
                  title={item.action.replace('_', ' ')}
                  value={item.count}
                  valueStyle={{ fontSize: '18px' }}
                />
              </Col>
            ))}
          </Row>
        </Card>
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
      <Card title="Logic History Entries">
        <Table
          columns={columns}
          dataSource={logicHistory}
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

      {/* Details Modal */}
      <Modal
        title="Logic History Details"
        open={showDetailsModal}
        onCancel={() => setShowDetailsModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {selectedEntry && (
          <div>
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={12}>
                <Card size="small" title="Basic Information">
                  <div style={{ fontSize: '14px' }}>
                    <div style={{ marginBottom: '8px' }}><strong>User:</strong> {selectedEntry.user.email}</div>
                    <div style={{ marginBottom: '8px' }}><strong>Action:</strong> {selectedEntry.action}</div>
                    <div style={{ marginBottom: '8px' }}><strong>Entity Type:</strong> {selectedEntry.entityType || 'N/A'}</div>
                    <div style={{ marginBottom: '8px' }}><strong>Entity ID:</strong> {selectedEntry.entityId || 'N/A'}</div>
                    <div style={{ marginBottom: '8px' }}><strong>IP Address:</strong> {selectedEntry.ipAddress || 'N/A'}</div>
                    <div><strong>Created:</strong> {formatDate(selectedEntry.createdAt)}</div>
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="Notification">
                  <div style={{ fontSize: '14px' }}>
                    <div style={{ marginBottom: '8px' }}><strong>Template:</strong> {selectedEntry.notificationTemplate?.name || 'None'}</div>
                    <div><strong>Status:</strong> 
                      <Tag color={selectedEntry.notificationSent ? 'success' : 'warning'} style={{ marginLeft: '8px' }}>
                        {selectedEntry.notificationSent ? 'Sent' : 'Pending'}
                      </Tag>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            {selectedEntry.oldValues && (
              <Card size="small" title="Old Values" style={{ marginBottom: '16px' }}>
                <pre style={{ backgroundColor: '#f5f5f5', padding: '12px', borderRadius: '4px', fontSize: '12px', overflow: 'auto' }}>
                  {JSON.stringify(parseJsonSafely(selectedEntry.oldValues), null, 2)}
                </pre>
              </Card>
            )}

            {selectedEntry.newValues && (
              <Card size="small" title="New Values" style={{ marginBottom: '16px' }}>
                <pre style={{ backgroundColor: '#f5f5f5', padding: '12px', borderRadius: '4px', fontSize: '12px', overflow: 'auto' }}>
                  {JSON.stringify(parseJsonSafely(selectedEntry.newValues), null, 2)}
                </pre>
              </Card>
            )}

            {selectedEntry.userAgent && (
              <Card size="small" title="User Agent">
                <div style={{ backgroundColor: '#f5f5f5', padding: '12px', borderRadius: '4px', fontSize: '12px', wordBreak: 'break-all' }}>
                  {selectedEntry.userAgent}
                </div>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminLogicHistoryPage;