import React, { useEffect, useState } from 'react';
import {
  Card,
  Button,
  Space,
  Typography,
  Statistic,
  Row,
  Col,
  Alert,
  Modal,
  message,
  Divider,
  Spin,
  Tag,
  Table,
  Form,
  Input,
  Select,
  Switch,
  InputNumber,
  Drawer,
  Descriptions,
  Badge,
  Tooltip,
  Popconfirm,
} from 'antd';
import {
  DatabaseOutlined,
  ReloadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  PlayCircleOutlined,
  SafetyCertificateOutlined,
  CloudDownloadOutlined,
  InfoCircleOutlined,
  EyeOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { adminApi } from '../../../../apis/admin.api.ts';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Database connection types
const DATABASE_TYPES = {
  mysql: { label: 'MySQL', color: 'orange', defaultPort: 3306 },
  postgresql: { label: 'PostgreSQL', color: 'blue', defaultPort: 5432 },
  mongodb: { label: 'MongoDB', color: 'green', defaultPort: 27017 },
  sqlite: { label: 'SQLite', color: 'purple', defaultPort: 0 },
};

const STATUS_COLORS: Record<string, 'success' | 'error' | 'warning' | 'default'> = {
  success: 'success',
  failed: 'error',
  pending: 'warning',
  unknown: 'default',
};

interface DatabaseConnection {
  id: string;
  name: string;
  description?: string;
  type: 'mysql' | 'postgresql' | 'mongodb' | 'sqlite';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  timeout: number;
  options?: string;
  isActive: boolean;
  lastTested?: string;
  testStatus?: 'success' | 'failed' | 'pending';
  testError?: string;
  backupEnabled: boolean;
  backupPath?: string;
  lastBackup?: string;
  createdAt: string;
  updatedAt: string;
}

interface DatabaseStats {
  total: number;
  active: number;
  inactive: number;
  byType: Record<string, number>;
  recentTests: number;
}

interface ConnectionTest {
  success: boolean;
  message: string;
  responseTime?: number;
  error?: string;
  details?: Record<string, unknown>;
}

export default function AdminDatabasePage() {
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<DatabaseConnection | null>(null);
  const [testResults, setTestResults] = useState<Record<string, ConnectionTest>>({});
  const [testingConnections, setTestingConnections] = useState<Set<string>>(new Set());
  const [form] = Form.useForm();

  useEffect(() => {
    fetchConnections();
    fetchStats();
  }, []);

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getDatabaseConnections();
      // Updated to match the new controller response format: { data: T[], total: number }
      if (response.data && Array.isArray(response.data.data.data)) {
        setConnections(response.data.data.data);
      } else {
        console.error('Invalid response format:', response.data.data.data);
        setConnections([]);
        message.error('Failed to fetch database connections');
      }
    } catch (error) {
      console.error('Failed to fetch database connections:', error);
      setConnections([]);
      message.error('Failed to fetch database connections');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminApi.getDatabaseConnectionStats();
      // Updated to match the new controller response format
      if (response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch database connection stats:', error);
    }
  };

  const handleCreateConnection = async (values: any) => {
    try {
      const response = await adminApi.createDatabaseConnection(values);
      // Updated to match the new controller response format
      if (response.data) {
        message.success('Database connection created successfully');
        setCreateModalVisible(false);
        form.resetFields();
        fetchConnections();
        fetchStats();
      } else {
        message.error('Failed to create connection');
      }
    } catch (error) {
      console.error('Failed to create database connection:', error);
      message.error('Failed to create database connection');
    }
  };

  const handleUpdateConnection = async (values: any) => {
    if (!selectedConnection) return;

    try {
      const response = await adminApi.updateDatabaseConnection(selectedConnection.id, values);
      // Updated to match the new controller response format
      if (response.data) {
        message.success('Database connection updated successfully');
        setEditModalVisible(false);
        setSelectedConnection(null);
        form.resetFields();
        fetchConnections();
        fetchStats();
      } else {
        message.error('Failed to update connection');
      }
    } catch (error) {
      console.error('Failed to update database connection:', error);
      message.error('Failed to update database connection');
    }
  };

  const handleDeleteConnection = async (id: string, name: string) => {
    try {
      const response = await adminApi.deleteDatabaseConnection(id);
      // Updated to match the new controller response format
      if (response.data && response.data.message) {
        message.success(`Database connection "${name}" deleted successfully`);
        fetchConnections();
        fetchStats();
      } else {
        message.error('Failed to delete connection');
      }
    } catch (error) {
      console.error('Failed to delete database connection:', error);
      message.error('Failed to delete database connection');
    }
  };

  const handleTestConnection = async (id: string, name: string) => {
    setTestingConnections((prev) => new Set(prev).add(id));

    try {
      const response = await adminApi.testDatabaseConnection(id);
      // Updated to match the new controller response format
      if (response.data) {
        const testResult = response.data;
        setTestResults((prev) => ({
          ...prev,
          [id]: testResult,
        }));

        if (testResult.success) {
          message.success(
            `Connection "${name}" tested successfully (${testResult.responseTime}ms)`
          );
        } else {
          message.error(`Connection "${name}" test failed: ${testResult.message}`);
        }

        fetchConnections(); // Refresh to get updated test status
      } else {
        message.error('Test failed');
      }
    } catch (error) {
      console.error('Failed to test database connection:', error);
      message.error('Failed to test database connection');
    } finally {
      setTestingConnections((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleCheckConnection = async (id: string, name: string) => {
    try {
      const response = await adminApi.checkDatabaseConnection(id);
      // Updated to match the new controller response format
      if (response.data) {
        const check = response.data;

        if (check.success) {
          message.success(`✅ Connection "${name}" configuration is valid!`);
        } else {
          const issues = Object.entries(check.details || {}).filter(([, valid]) => !valid);
          const issueList = issues
            .map(([key]) => `• ${key.replace('has', '').replace(/([A-Z])/g, ' $1')}`)
            .join('\n');

          Modal.warning({
            title: 'Configuration Issues Found',
            content: (
              <div>
                <p>Configuration issues found for "{name}":</p>
                <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
                  {issueList}
                </pre>
              </div>
            ),
          });
        }
      } else {
        message.error('Check failed');
      }
    } catch (error) {
      console.error('Failed to check database connection:', error);
      message.error('Failed to check database connection');
    }
  };

  const handleCreateBackup = async (id: string, name: string) => {
    const connection = connections.find((c) => c.id === id);
    if (!connection?.backupEnabled) {
      Modal.warning({
        title: 'Backup Not Enabled',
        content: `Backup is not enabled for connection "${name}". Please enable it in the connection settings.`,
      });
      return;
    }

    try {
      const response = await adminApi.createDatabaseBackup(id);
      // Updated to match the new controller response format
      if (response.data) {
        const backup = response.data;
        if (backup.success) {
          message.success(`✅ Backup created successfully for "${name}"!`);
          fetchConnections(); // Refresh to get updated backup status
        } else {
          message.error(`❌ Backup failed for "${name}": ${backup.message || backup.error}`);
        }
      } else {
        message.error('Backup failed');
      }
    } catch (error) {
      console.error('Failed to create database backup:', error);
      message.error('Failed to create database backup');
    }
  };

  const openEditModal = (connection: DatabaseConnection) => {
    setSelectedConnection(connection);
    form.setFieldsValue({
      ...connection,
      password: '', // Don't show encrypted password
    });
    setEditModalVisible(true);
  };

  const openDetailDrawer = (connection: DatabaseConnection) => {
    setSelectedConnection(connection);
    setDetailDrawerVisible(true);
  };

  const handleTypeChange = (type: keyof typeof DATABASE_TYPES) => {
    form.setFieldsValue({
      port: DATABASE_TYPES[type].defaultPort,
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const columns = [
    {
      title: 'Connection',
      key: 'connection',
      render: (record: DatabaseConnection) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>
            <Space>
              {record.name}
              <Tag color={DATABASE_TYPES[record.type].color}>
                {DATABASE_TYPES[record.type].label}
              </Tag>
            </Space>
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.host}:{record.port}/{record.database}
          </div>
          {record.description && (
            <div style={{ fontSize: '12px', color: '#999', marginTop: 2 }}>
              {record.description}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: DatabaseConnection) => (
        <Badge
          status={record.isActive ? 'success' : 'error'}
          text={record.isActive ? 'Active' : 'Inactive'}
        />
      ),
    },
    {
      title: 'Test Status',
      key: 'testStatus',
      render: (record: DatabaseConnection) => (
        <div>
          <Badge
            status={STATUS_COLORS[record.testStatus || 'unknown']}
            text={record.testStatus || 'Unknown'}
          />
          {testResults[record.id] && (
            <div style={{ fontSize: '11px', color: '#666', marginTop: 2 }}>
              {testResults[record.id].responseTime}ms
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Last Tested',
      dataIndex: 'lastTested',
      key: 'lastTested',
      render: (date: string) => <span style={{ fontSize: '12px' }}>{formatDate(date)}</span>,
    },
    {
      title: 'Backup',
      key: 'backup',
      render: (record: DatabaseConnection) => (
        <div>
          <Badge
            status={record.backupEnabled ? 'success' : 'default'}
            text={record.backupEnabled ? 'Enabled' : 'Disabled'}
          />
          {record.lastBackup && (
            <div style={{ fontSize: '11px', color: '#666', marginTop: 2 }}>
              Last: {formatDate(record.lastBackup)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: DatabaseConnection) => (
        <Space>
          <Tooltip title="Test Connection">
            <Button
              type="text"
              icon={<PlayCircleOutlined />}
              loading={testingConnections.has(record.id)}
              onClick={() => handleTestConnection(record.id, record.name)}
              style={{ color: '#1890ff' }}
            />
          </Tooltip>
          <Tooltip title="Check Configuration">
            <Button
              type="text"
              icon={<SafetyCertificateOutlined />}
              onClick={() => handleCheckConnection(record.id, record.name)}
              style={{ color: '#52c41a' }}
            />
          </Tooltip>
          <Tooltip title="Create Backup">
            <Button
              type="text"
              icon={<CloudDownloadOutlined />}
              disabled={!record.backupEnabled}
              onClick={() => handleCreateBackup(record.id, record.name)}
              style={{ color: '#722ed1' }}
            />
          </Tooltip>
          <Tooltip title="View Details">
            <Button type="text" icon={<EyeOutlined />} onClick={() => openDetailDrawer(record)} />
          </Tooltip>
          <Tooltip title="Edit">
            <Button type="text" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          </Tooltip>
          <Popconfirm
            title={`Delete connection "${record.name}"?`}
            description="This action cannot be undone."
            onConfirm={() => handleDeleteConnection(record.id, record.name)}
            okText="Delete"
            cancelText="Cancel"
            okType="danger"
          >
            <Button type="text" icon={<DeleteOutlined />} style={{ color: '#ff4d4f' }} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const ConnectionForm = ({ isEdit = false }) => (
    <Form
      form={form}
      layout="vertical"
      onFinish={isEdit ? handleUpdateConnection : handleCreateConnection}
      initialValues={{
        type: 'mysql',
        port: 3306,
        ssl: false,
        timeout: 30000,
        isActive: true,
        backupEnabled: false,
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="name"
            label="Connection Name"
            rules={[{ required: true, message: 'Please enter connection name' }]}
          >
            <Input placeholder="My Database Connection" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="type" label="Database Type" rules={[{ required: true }]}>
            <Select onChange={handleTypeChange}>
              {Object.entries(DATABASE_TYPES).map(([key, value]) => (
                <Option key={key} value={key}>
                  {value.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="description" label="Description">
        <TextArea rows={2} placeholder="Optional description" />
      </Form.Item>

      <Row gutter={16}>
        <Col span={16}>
          <Form.Item
            name="host"
            label="Host"
            rules={[{ required: true, message: 'Please enter host' }]}
          >
            <Input placeholder="localhost" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="port"
            label="Port"
            rules={[{ required: true, message: 'Please enter port' }]}
          >
            <InputNumber min={1} max={65535} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="database"
        label="Database"
        rules={[{ required: true, message: 'Please enter database name' }]}
      >
        <Input placeholder="database_name" />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please enter username' }]}
          >
            <Input placeholder="username" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="password"
            label="Password"
            rules={isEdit ? [] : [{ required: true, message: 'Please enter password' }]}
          >
            <Input.Password
              placeholder={isEdit ? 'Leave blank to keep current password' : 'password'}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name="ssl" label="Use SSL" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="backupEnabled" label="Enable Backup" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.backupEnabled !== currentValues.backupEnabled
        }
      >
        {({ getFieldValue }) =>
          getFieldValue('backupEnabled') ? (
            <Form.Item name="backupPath" label="Backup Path">
              <Input placeholder="Optional backup path (defaults to ./backups)" />
            </Form.Item>
          ) : null
        }
      </Form.Item>

      <Form.Item name="timeout" label="Connection Timeout (ms)">
        <InputNumber min={1000} max={300000} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item name="options" label="Additional Options">
        <TextArea rows={2} placeholder="JSON string for additional connection options" />
      </Form.Item>
    </Form>
  );

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <DatabaseOutlined style={{ marginRight: '12px' }} />
          Database Connections
        </Title>
        <Paragraph type="secondary">
          Manage database connections for testing, backup, and administration. Test connectivity,
          validate configurations, and create backups.
        </Paragraph>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Connections"
                value={stats.total}
                prefix={<DatabaseOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Active"
                value={stats.active}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Inactive"
                value={stats.inactive}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Recent Tests"
                value={stats.recentTests}
                prefix={<PlayCircleOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Database Type Distribution */}
      {stats && stats.byType && Object.keys(stats.byType).length > 0 && (
        <Card title="Database Types" style={{ marginBottom: '24px' }}>
          <Space wrap>
            {Object.entries(stats.byType).map(([type, count]) => (
              <Tag
                key={type}
                color={(DATABASE_TYPES as any)[type]?.color || 'default'}
                style={{ fontSize: '14px', padding: '4px 8px' }}
              >
                {(DATABASE_TYPES as any)[type]?.label || type}: {count}
              </Tag>
            ))}
          </Space>
        </Card>
      )}

      {/* Action Buttons */}
      <Card style={{ marginBottom: '24px' }}>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            Add Connection
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              fetchConnections();
              fetchStats();
            }}
            loading={loading}
          >
            Refresh
          </Button>
        </Space>
      </Card>

      {/* Connections Table */}
      <Card title="Database Connections">
        <Table
          columns={columns}
          dataSource={connections}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} connections`,
          }}
          locale={{
            emptyText: (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <DatabaseOutlined
                  style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }}
                />
                <div style={{ fontSize: '16px', color: '#999' }}>No database connections found</div>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setCreateModalVisible(true)}
                  style={{ marginTop: '12px' }}
                >
                  Create Your First Connection
                </Button>
              </div>
            ),
          }}
        />
      </Card>

      {/* Create Connection Modal */}
      <Modal
        title="Create Database Connection"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        width={800}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setCreateModalVisible(false);
              form.resetFields();
            }}
          >
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()}>
            Create Connection
          </Button>,
        ]}
      >
        <ConnectionForm />
      </Modal>

      {/* Edit Connection Modal */}
      <Modal
        title="Edit Database Connection"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedConnection(null);
          form.resetFields();
        }}
        width={800}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setEditModalVisible(false);
              setSelectedConnection(null);
              form.resetFields();
            }}
          >
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()}>
            Update Connection
          </Button>,
        ]}
      >
        <ConnectionForm isEdit />
      </Modal>

      {/* Connection Details Drawer */}
      <Drawer
        title="Connection Details"
        placement="right"
        width={600}
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
      >
        {selectedConnection && (
          <div>
            <Descriptions title="Basic Information" bordered column={1}>
              <Descriptions.Item label="Name">{selectedConnection.name}</Descriptions.Item>
              <Descriptions.Item label="Description">
                {selectedConnection.description || 'No description'}
              </Descriptions.Item>
              <Descriptions.Item label="Type">
                <Tag color={DATABASE_TYPES[selectedConnection.type].color}>
                  {DATABASE_TYPES[selectedConnection.type].label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Host">{selectedConnection.host}</Descriptions.Item>
              <Descriptions.Item label="Port">{selectedConnection.port}</Descriptions.Item>
              <Descriptions.Item label="Database">{selectedConnection.database}</Descriptions.Item>
              <Descriptions.Item label="Username">{selectedConnection.username}</Descriptions.Item>
              <Descriptions.Item label="SSL">
                <Badge
                  status={selectedConnection.ssl ? 'success' : 'default'}
                  text={selectedConnection.ssl ? 'Enabled' : 'Disabled'}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Timeout">{selectedConnection.timeout}ms</Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="Status Information" bordered column={1}>
              <Descriptions.Item label="Status">
                <Badge
                  status={selectedConnection.isActive ? 'success' : 'error'}
                  text={selectedConnection.isActive ? 'Active' : 'Inactive'}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Test Status">
                <Badge
                  status={STATUS_COLORS[selectedConnection.testStatus || 'unknown']}
                  text={selectedConnection.testStatus || 'Unknown'}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Last Tested">
                {formatDate(selectedConnection.lastTested)}
              </Descriptions.Item>
              {selectedConnection.testError && (
                <Descriptions.Item label="Test Error">
                  <Text type="danger">{selectedConnection.testError}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider />

            <Descriptions title="Backup Information" bordered column={1}>
              <Descriptions.Item label="Backup Enabled">
                <Badge
                  status={selectedConnection.backupEnabled ? 'success' : 'default'}
                  text={selectedConnection.backupEnabled ? 'Yes' : 'No'}
                />
              </Descriptions.Item>
              {selectedConnection.backupPath && (
                <Descriptions.Item label="Backup Path">
                  {selectedConnection.backupPath}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Last Backup">
                {formatDate(selectedConnection.lastBackup)}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="Metadata" bordered column={1}>
              <Descriptions.Item label="Created">
                {formatDate(selectedConnection.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Updated">
                {formatDate(selectedConnection.updatedAt)}
              </Descriptions.Item>
            </Descriptions>

            {testResults[selectedConnection.id] && (
              <>
                <Divider />
                <Descriptions title="Last Test Results" bordered column={1}>
                  <Descriptions.Item label="Success">
                    <Badge
                      status={testResults[selectedConnection.id].success ? 'success' : 'error'}
                      text={testResults[selectedConnection.id].success ? 'Yes' : 'No'}
                    />
                  </Descriptions.Item>
                  <Descriptions.Item label="Message">
                    {testResults[selectedConnection.id].message}
                  </Descriptions.Item>
                  {testResults[selectedConnection.id].responseTime && (
                    <Descriptions.Item label="Response Time">
                      {testResults[selectedConnection.id].responseTime}ms
                    </Descriptions.Item>
                  )}
                  {testResults[selectedConnection.id].error && (
                    <Descriptions.Item label="Error">
                      <Text type="danger">{testResults[selectedConnection.id].error}</Text>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
