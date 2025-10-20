import React from 'react';
import { Card, Space, Button } from 'antd';
import { DatabaseOutlined, ReloadOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';

interface Props {
  seedLoading: string | null;
  seedDataLoading: boolean;
  loading: boolean;
  totalItems: number;
  onSeedAll: () => void;
  onViewSeedData: () => void;
  onRefreshStats: () => void;
  onClearAll: () => void;
}

const SeedQuickActions: React.FC<Props> = ({
  seedLoading,
  seedDataLoading,
  loading,
  totalItems,
  onSeedAll,
  onViewSeedData,
  onRefreshStats,
  onClearAll,
}) => (
  <Card title="Quick Actions" style={{ marginBottom: '24px' }}>
    <Space wrap>
      <Button
        type="primary"
        icon={<DatabaseOutlined />}
        size="large"
        loading={seedLoading === 'Seed All'}
        onClick={onSeedAll}
      >
        Seed All Data
      </Button>
      <Button icon={<EyeOutlined />} onClick={onViewSeedData} loading={seedDataLoading}>
        View Seed Data
      </Button>
      <Button icon={<ReloadOutlined />} onClick={onRefreshStats} loading={loading}>
        Refresh Statistics
      </Button>
      <Button danger icon={<DeleteOutlined />} onClick={onClearAll} disabled={totalItems === 0}>
        Clear All Data
      </Button>
    </Space>
  </Card>
);

export default SeedQuickActions;
