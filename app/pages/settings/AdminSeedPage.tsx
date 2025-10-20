import React, { useEffect, useState } from 'react';
import { Modal, message, Typography, Alert } from 'antd';
import { DatabaseOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import DatabaseStatsCard from '../../components/seed/DatabaseStatsCard.tsx';
import SeedQuickActions from '../../components/seed/SeedQuickActions.tsx';
import SeedOperationsList from '../../components/seed/SeedOperationsList.tsx';
import LastOperationResult from '../../components/seed/LastOperationResult.tsx';
import SeedDataViewerDrawer from '../../components/seed/SeedDataViewerDrawer.tsx';
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
    messages: 0,
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
          <Paragraph strong>Are you absolutely sure you want to proceed?</Paragraph>
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
      icon: null,
      action: () => adminApi.seedPermissions(),
      count: stats.permissions,
    },
    {
      key: 'roles',
      title: 'Roles',
      description: 'Seed default roles (superadmin, admin, user)',
      icon: null,
      action: () => adminApi.seedRoles(),
      count: stats.roles,
    },
    {
      key: 'users',
      title: 'Users',
      description: 'Seed default admin and test users',
      icon: null,
      action: () => adminApi.seedUsers(),
      count: stats.users,
    },
    {
      key: 'configs',
      title: 'Configurations',
      description: 'Seed system configuration values',
      icon: null,
      action: () => adminApi.seedConfigs(),
      count: stats.configs,
    },
    {
      key: 'agents',
      title: 'AI Agents',
      description: 'Seed default AI agents and assistants',
      icon: null,
      action: () => adminApi.seedAgents(),
      count: stats.agents,
    },
    {
      key: 'apiKeys',
      title: 'API Keys',
      description: 'Seed development API keys',
      icon: null,
      action: () => adminApi.seedApiKeys(),
      count: stats.apiKeys,
    },
  ];

  const totalItems = Object.values(stats).reduce((sum, count) => sum + (count || 0), 0);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Typography.Title level={2}>
          <DatabaseOutlined style={{ marginRight: '12px' }} />
          Database Seed Management
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          Manage database seeding operations and view current data statistics. Use these tools to
          populate the database with default data for development and testing.
        </Typography.Paragraph>
      </div>
      <DatabaseStatsCard stats={stats} loading={loading} fetchStats={fetchStats} />
      <SeedQuickActions
        seedLoading={seedLoading}
        seedDataLoading={seedDataLoading}
        loading={loading}
        totalItems={totalItems}
        onSeedAll={() => handleSeedOperation('Seed All', () => adminApi.seedAll())}
        onViewSeedData={handleViewSeedData}
        onRefreshStats={fetchStats}
        onClearAll={handleClearAll}
      />
      <SeedOperationsList
        seedOperations={seedOperations}
        seedLoading={seedLoading}
        handleSeedOperation={handleSeedOperation}
      />
      <LastOperationResult lastResult={lastResult} />
      <SeedDataViewerDrawer
        viewSeedVisible={viewSeedVisible}
        setViewSeedVisible={setViewSeedVisible}
        seedData={seedData}
        seedDataLoading={seedDataLoading}
        fetchSeedData={fetchSeedData}
      />
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
          return <span title={value}>{value.substring(0, 50)}...</span>;
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
