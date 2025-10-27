import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Button } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  SafetyOutlined,
  KeyOutlined,
  DatabaseOutlined,
  ReloadOutlined,
  LinkOutlined,
  HistoryOutlined,
  AuditOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { adminApi } from '../../../apis/admin.api.ts';

const { Title, Paragraph } = Typography;

export default function AdminSystemIndexPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: 0,
    roles: 0,
    permissions: 0,
    tokens: 0,
    sso: 0,
    loginHistory: 0,
    logicHistory: 0,
    logs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes, permissionsRes, tokensRes] = await Promise.allSettled([
        adminApi.getUsers(),
        adminApi.getRoles(),
        adminApi.getPermissions(),
        adminApi.getTokens(),
      ]);

      // Fetch additional stats for SSO, History, and Logs (with fallbacks)
      let ssoCount = 0;
      let loginHistoryCount = 0;
      let logicHistoryCount = 0;
      let logsCount = 0;

      try {
        const ssoResponse = await fetch('/api/admin/sso/stats');
        if (ssoResponse.ok) {
          const ssoStats = await ssoResponse.json();
          ssoCount = ssoStats.totalSSO || 0;
        }
      } catch (error) {
        console.warn('Failed to fetch SSO stats:', error);
      }

      try {
        const loginHistoryResponse = await fetch('/api/admin/login-history/stats');
        if (loginHistoryResponse.ok) {
          const loginStats = await loginHistoryResponse.json();
          loginHistoryCount = loginStats.totalLogins || 0;
        }
      } catch (error) {
        console.warn('Failed to fetch login history stats:', error);
      }

      try {
        const logicHistoryResponse = await fetch('/api/admin/logic-history/stats');
        if (logicHistoryResponse.ok) {
          const logicStats = await logicHistoryResponse.json();
          logicHistoryCount = logicStats.totalEntries || 0;
        }
      } catch (error) {
        console.warn('Failed to fetch logic history stats:', error);
      }

      try {
        const logsResponse = await adminApi.getLogStats();
        if (logsResponse.data.success) {
          logsCount = logsResponse.data.data.totalLogs || 0;
        }
      } catch (error) {
        console.warn('Failed to fetch logs stats:', error);
      }

      setStats({
        users: usersRes.status === 'fulfilled' ? usersRes.value.data.data?.length || 0 : 0,
        roles: rolesRes.status === 'fulfilled' ? rolesRes.value.data.data?.length || 0 : 0,
        permissions:
          permissionsRes.status === 'fulfilled' ? permissionsRes.value.data.data?.length || 0 : 0,
        tokens: tokensRes.status === 'fulfilled' ? tokensRes.value.data.data?.length || 0 : 0,
        sso: ssoCount,
        loginHistory: loginHistoryCount,
        logicHistory: logicHistoryCount,
        logs: logsCount,
      });
    } catch (error) {
      console.error('Failed to fetch system statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const systemCards = [
    {
      title: 'Users',
      count: stats.users,
      icon: <UserOutlined />,
      color: '#1890ff',
      path: '/admin/system/users',
      description: 'Manage user accounts and profiles',
    },
    {
      title: 'Roles',
      count: stats.roles,
      icon: <TeamOutlined />,
      color: '#52c41a',
      path: '/admin/system/roles',
      description: 'Configure user roles and access levels',
    },
    {
      title: 'Permissions',
      count: stats.permissions,
      icon: <SafetyOutlined />,
      color: '#722ed1',
      path: '/admin/system/permissions',
      description: 'Define system permissions and capabilities',
    },
    {
      title: 'Tokens',
      count: stats.tokens,
      icon: <KeyOutlined />,
      color: '#fa541c',
      path: '/admin/system/tokens',
      description: 'Monitor active authentication tokens',
    },
    {
      title: 'SSO Entries',
      count: stats.sso,
      icon: <LinkOutlined />,
      color: '#13c2c2',
      path: '/admin/system/sso',
      description: 'Manage Single Sign-On configurations',
    },
    {
      title: 'Login History',
      count: stats.loginHistory,
      icon: <HistoryOutlined />,
      color: '#eb2f96',
      path: '/admin/system/login-history',
      description: 'View user login and session history',
    },
    {
      title: 'Logic History',
      count: stats.logicHistory,
      icon: <AuditOutlined />,
      color: '#f5222d',
      path: '/admin/system/logic-history',
      description: 'Audit trail of system changes and actions',
    },
    {
      title: 'Application Logs',
      count: stats.logs,
      icon: <FileTextOutlined />,
      color: '#faad14',
      path: '/admin/system/logs',
      description: 'Monitor application logs and system events',
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <DatabaseOutlined style={{ marginRight: 8 }} />
              System Management
            </Title>
            <Paragraph type="secondary" style={{ margin: '8px 0 0 0' }}>
              Monitor and manage system users, roles, permissions, and authentication
            </Paragraph>
          </div>
          <Button icon={<ReloadOutlined />} onClick={fetchStats} loading={loading}>
            Refresh
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        {systemCards.map((card) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={card.title}>
            <Card
              hoverable
              onClick={() => navigate(card.path)}
              style={{
                cursor: 'pointer',
                borderLeft: `4px solid ${card.color}`,
              }}
              styles={{ body: { padding: '20px' } }}
            >
              <Statistic
                title={card.title}
                value={card.count}
                prefix={React.cloneElement(card.icon, {
                  style: { color: card.color, fontSize: '20px' },
                })}
                loading={loading}
                valueStyle={{ color: card.color }}
              />
              <Paragraph
                type="secondary"
                style={{
                  margin: '12px 0 0 0',
                  fontSize: '12px',
                  minHeight: '32px',
                }}
              >
                {card.description}
              </Paragraph>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="System Health" style={{ borderTop: '3px solid #1890ff' }}>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Database Status"
                  value="Online"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={8}>
                <Statistic title="Cache Status" value="Active" valueStyle={{ color: '#52c41a' }} />
              </Col>
              <Col span={8}>
                <Statistic title="API Status" value="Running" valueStyle={{ color: '#52c41a' }} />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
