import {
  DatabaseOutlined,
  KeyOutlined,
  ReloadOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Divider, Row, Space, Statistic, Tag, Typography } from 'antd';
import React from 'react';

const { Text } = Typography;

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

interface Props {
  stats: DatabaseStats;
  loading: boolean;
  fetchStats: () => void;
}

const DatabaseStatsCard: React.FC<Props> = ({ stats, loading, fetchStats }) => {
  const totalItems = Object.values(stats).reduce((sum, count) => sum + (count || 0), 0);

  return (
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
            <Statistic title="Messages" value={stats.messages} valueStyle={{ color: '#389e0d' }} />
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
  );
};

export default DatabaseStatsCard;
