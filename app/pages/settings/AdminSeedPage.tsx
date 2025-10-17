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
  Progress,
  Table,
  Tabs,
  Descriptions,
  Drawer
} from 'antd';
import { 
  DatabaseOutlined, 
  ReloadOutlined, 
  WarningOutlined,
  CheckCircleOutlined,
  UserOutlined,
  KeyOutlined,
  SettingOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { adminApi } from '../../apis/admin.api.ts';

const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;

interface DatabaseStats {
  users: number;
  roles: number;
  permissions: number;
  configs: number;
  agents: number;
  apiKeys: number;
  conversations?: number;
  messages?: number;
}

interface SeedResult {
  success: boolean;
  message: string;
  data?: DatabaseStats;
  errors?: string[];
}

interface SeedData {
  [key: string]: any[];
}

export default function AdminSeedPage() {
  const [stats, setStats] = useState<DatabaseStats>({
    users: 0,
    roles: 0,
    permissions: 0,
    configs: 0,
    agents: 0,
    apiKeys: 0,
    conversations: 0,
    messages: 0
  });
  const [loading, setLoading] = useState(false);
  const [seedLoading, setSeedLoading] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<SeedResult | null>(null);
  const [viewSeedVisible, setViewSeedVisible] = useState(false);
  const [seedData, setSeedData] = useState<SeedData>({});
  const [seedDataLoading, setSeedDataLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getSeedStats();
      if (response.data.success) {
        setStats(response.data.data || {});
      }
    } catch (error) {
      console.error('Failed to fetch database stats:', error);
      message.error('Failed to fetch database statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchSeedData = async () => {
    setSeedDataLoading(true);
    try {
      const response = await adminApi.getSeedData();
      if (response.data.success) {
        setSeedData(response.data.data || {});
      } else {
        message.error('Failed to fetch seed data');
      }
    } catch (error) {
      console.error('Failed to fetch seed data:', error);
      message.error('Failed to fetch seed data');
    } finally {
      setSeedDataLoading(false);
    }
  };

  const handleViewSeedData = async () => {
    setViewSeedVisible(true);
    await fetchSeedData();
  };

  const handleSeedOperation = async (operation: string, apiCall: () => Promise<any>) => {
    setSeedLoading(operation);
    try {
      const response = await apiCall();
      const result = response.data;
      setLastResult(result);
      
      if (result.success) {
        message.success(result.message);
        await fetchStats(); // Refresh stats
      } else {
        message.error(result.message);
      }
    } catch (error) {
      console.error(`Seed operation ${operation} failed:`, error);
      message.error(`Failed to ${operation.toLowerCase()}`);
    } finally {
      setSeedLoading(null);
    }
  };

  const handleClearAll = () => {
    confirm({
      title: 'Dangerous Operation: Clear All Data',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: (
        <div>
          <Alert
            message="Warning: This will permanently delete ALL data from the database!"
            description="This action cannot be undone. All users, roles, permissions, configurations, agents, conversations, and messages will be permanently deleted."
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Paragraph strong>
            Are you absolutely sure you want to proceed?
          </Paragraph>
        </div>
      ),
      okText: 'Yes, Delete Everything',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        handleSeedOperation('Clear All Data', () => adminApi.clearAllData());
      },
    });
  };

  const seedOperations = [
    {
      key: 'permissions',
      title: 'Permissions',
      description: 'Seed system permissions and API routes',
      icon: <SafetyCertificateOutlined style={{ color: '#1890ff' }} />,
      action: () => adminApi.seedPermissions(),
      count: stats.permissions
    },
    {
      key: 'roles',
      title: 'Roles',
      description: 'Seed default roles (superadmin, admin, user)',
      icon: <TeamOutlined style={{ color: '#52c41a' }} />,
      action: () => adminApi.seedRoles(),
      count: stats.roles
    },
    {
      key: 'users',
      title: 'Users',
      description: 'Seed default admin and test users',
      icon: <UserOutlined style={{ color: '#722ed1' }} />,
      action: () => adminApi.seedUsers(),
      count: stats.users
    },
    {
      key: 'configs',
      title: 'Configurations',
      description: 'Seed system configuration values',
      icon: <SettingOutlined style={{ color: '#fa8c16' }} />,
      action: () => adminApi.seedConfigs(),
      count: stats.configs
    },
    {
      key: 'agents',
      title: 'AI Agents',
      description: 'Seed default AI agents and assistants',
      icon: <RobotOutlined style={{ color: '#eb2f96' }} />,
      action: () => adminApi.seedAgents(),
      count: stats.agents
    },
    {
      key: 'apiKeys',
      title: 'API Keys',
      description: 'Seed development API keys',
      icon: <KeyOutlined style={{ color: '#13c2c2' }} />,
      action: () => adminApi.seedApiKeys(),
      count: stats.apiKeys
    }
  ];

  const totalItems = Object.values(stats).reduce((sum, count) => sum + (count || 0), 0);

  return (
    <div style={{  }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <DatabaseOutlined style={{ marginRight: '12px' }} />
          Database Seed Management
        </Title>
        <Paragraph type="secondary">
          Manage database seeding operations and view current data statistics.
          Use these tools to populate the database with default data for development and testing.
        </Paragraph>
      </div>

      {/* Database Statistics */}
      <Card 
        title={
          <Space>
            <DatabaseOutlined />
            <span>Current Database Statistics</span>
            <Button 
              type="text" 
              icon={<ReloadOutlined />} 
              onClick={fetchStats}
              loading={loading}
              size="small"
            >
              Refresh
            </Button>
          </Space>
        }
        style={{ marginBottom: '24px' }}
        loading={loading}
      >
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={8} md={6} lg={4}>
            <Statistic
              title="Users"
              value={stats.users}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Col>
          <Col xs={12} sm={8} md={6} lg={4}>
            <Statistic
              title="Roles"
              value={stats.roles}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col xs={12} sm={8} md={6} lg={4}>
            <Statistic
              title="Permissions"
              value={stats.permissions}
              prefix={<SafetyCertificateOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col xs={12} sm={8} md={6} lg={4}>
            <Statistic
              title="Configurations"
              value={stats.configs}
              prefix={<SettingOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Col>
          <Col xs={12} sm={8} md={6} lg={4}>
            <Statistic
              title="AI Agents"
              value={stats.agents}
              prefix={<RobotOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Col>
          <Col xs={12} sm={8} md={6} lg={4}>
            <Statistic
              title="API Keys"
              value={stats.apiKeys}
              prefix={<KeyOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Col>
          {stats.conversations !== undefined && (
            <Col xs={12} sm={8} md={6} lg={4}>
              <Statistic
                title="Conversations"
                value={stats.conversations}
                valueStyle={{ color: '#096dd9' }}
              />
            </Col>
          )}
          {stats.messages !== undefined && (
            <Col xs={12} sm={8} md={6} lg={4}>
              <Statistic
                title="Messages"
                value={stats.messages}
                valueStyle={{ color: '#389e0d' }}
              />
            </Col>
          )}
        </Row>
        
        <Divider />
        
        <div style={{ textAlign: 'center' }}>
          <Text strong>Total Database Items: </Text>
          <Tag color="blue" style={{ fontSize: '14px', padding: '4px 8px' }}>
            {totalItems.toLocaleString()}
          </Tag>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card 
        title="Quick Actions"
        style={{ marginBottom: '24px' }}
      >
        <Space wrap>
          <Button
            type="primary"
            icon={<DatabaseOutlined />}
            size="large"
            loading={seedLoading === 'Seed All'}
            onClick={() => handleSeedOperation('Seed All', () => adminApi.seedAll())}
          >
            Seed All Data
          </Button>
          <Button
            icon={<EyeOutlined />}
            onClick={handleViewSeedData}
            loading={seedDataLoading}
          >
            View Seed Data
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchStats}
            loading={loading}
          >
            Refresh Statistics
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={handleClearAll}
            disabled={totalItems === 0}
          >
            Clear All Data
          </Button>
        </Space>
      </Card>

      {/* Individual Seed Operations */}
      <Card title="Individual Seed Operations">
        <Row gutter={[16, 16]}>
          {seedOperations.map((operation) => (
            <Col xs={24} sm={12} lg={8} key={operation.key}>
              <Card
                size="small"
                hoverable
                style={{ height: '100%' }}
                actions={[
                  <Button
                    key="seed"
                    type="primary"
                    size="small"
                    loading={seedLoading === operation.title}
                    onClick={() => handleSeedOperation(operation.title, operation.action)}
                    style={{ width: '80%' }}
                  >
                    Seed {operation.title}
                  </Button>
                ]}
              >
                <Card.Meta
                  avatar={operation.icon}
                  title={
                    <Space>
                      <span>{operation.title}</span>
                      <Tag color={operation.count > 0 ? 'green' : 'default'}>
                        {operation.count}
                      </Tag>
                    </Space>
                  }
                  description={operation.description}
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Last Operation Result */}
      {lastResult && (
        <Card 
          title="Last Operation Result" 
          style={{ marginTop: '24px' }}
        >
          <Alert
            message={lastResult.message}
            type={lastResult.success ? 'success' : 'error'}
            showIcon
            icon={lastResult.success ? <CheckCircleOutlined /> : <WarningOutlined />}
            style={{ marginBottom: lastResult.errors ? '16px' : 0 }}
          />
          
          {lastResult.errors && lastResult.errors.length > 0 && (
            <Alert
              message="Errors encountered:"
              description={
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {lastResult.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              }
              type="error"
              showIcon
            />
          )}
          
          {lastResult.data && (
            <div style={{ marginTop: '16px' }}>
              <Text strong>Operation Results:</Text>
              <div style={{ marginTop: '8px' }}>
                {Object.entries(lastResult.data).map(([key, value]) => (
                  <Tag key={key} style={{ margin: '2px' }}>
                    {key}: {value}
                  </Tag>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Seed Data Viewer Drawer */}
      <Drawer
        title="Seed Data Viewer"
        placement="right"
        size="large"
        open={viewSeedVisible}
        onClose={() => setViewSeedVisible(false)}
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchSeedData}
            loading={seedDataLoading}
          >
            Refresh
          </Button>
        }
      >
        {seedDataLoading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>Loading seed data...</div>
          </div>
        ) : (
          <Tabs
            defaultActiveKey="users"
            items={Object.keys(seedData).map((key) => ({
              key,
              label: (
                <span>
                  {key === 'users' && <UserOutlined />}
                  {key === 'roles' && <TeamOutlined />}
                  {key === 'permissions' && <SafetyCertificateOutlined />}
                  {key === 'configs' && <SettingOutlined />}
                  {key === 'agents' && <RobotOutlined />}
                  {key === 'apiKeys' && <KeyOutlined />}
                  {' '}{key.charAt(0).toUpperCase() + key.slice(1)} ({seedData[key]?.length || 0})
                </span>
              ),
              children: (
                <div>
                  {seedData[key] && seedData[key].length > 0 ? (
                    <Table
                      dataSource={seedData[key]}
                      columns={generateTableColumns(key, seedData[key][0])}
                      pagination={{ pageSize: 10 }}
                      scroll={{ x: true }}
                      size="small"
                      rowKey={(record) => record.id || record.email || record.name || record.key || record.code}
                    />
                  ) : (
                    <Alert
                      message="No Data"
                      description={`No ${key} data available to display.`}
                      type="info"
                      showIcon
                    />
                  )}
                </div>
              ),
            }))}
          />
        )}
      </Drawer>
    </div>
  );

  // Helper function to generate table columns based on data structure
  function generateTableColumns(dataType: string, sampleData: any) {
    if (!sampleData) return [];

    const columns = Object.keys(sampleData).map((key) => ({
      title: key.charAt(0).toUpperCase() + key.slice(1),
      dataIndex: key,
      key,
      render: (value: any) => {
        if (value === null || value === undefined) return '-';
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (typeof value === 'object') return JSON.stringify(value, null, 2);
        if (typeof value === 'string' && value.length > 50) {
          return (
            <span title={value}>
              {value.substring(0, 50)}...
            </span>
          );
        }
        return value;
      },
      width: key === 'id' ? 80 : key.includes('email') ? 200 : 150,
    }));

    // Sort columns to put important ones first
    const importantColumns = ['id', 'name', 'email', 'title', 'key', 'code', 'type'];
    return columns.sort((a, b) => {
      const aIndex = importantColumns.indexOf(a.dataIndex as string);
      const bIndex = importantColumns.indexOf(b.dataIndex as string);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return 0;
    });
  }
}