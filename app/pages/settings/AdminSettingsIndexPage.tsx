import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Space, Button, List, Badge } from 'antd';
import {
  MailOutlined,
  BellOutlined,
  SettingOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { adminApi } from '../../apis/admin.api.ts';

const { Title, Paragraph } = Typography;

export default function AdminSettingsIndexPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    mailTemplates: 0,
    notificationTemplates: 0,
    configItems: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [mailRes, notificationRes, configRes] = await Promise.allSettled([
        adminApi.getMailTemplates(),
        adminApi.getNotificationTemplates(),
        adminApi.getConfig(),
      ]);

      setStats({
        mailTemplates: mailRes.status === 'fulfilled' ? mailRes.value.data.data?.length || 0 : 0,
        notificationTemplates:
          notificationRes.status === 'fulfilled' ? notificationRes.value.data.data?.length || 0 : 0,
        configItems: configRes.status === 'fulfilled' ? configRes.value.data.data?.length || 0 : 0,
      });
    } catch (error) {
      console.error('Failed to fetch settings statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const settingsCards = [
    {
      title: 'Mail Templates',
      count: stats.mailTemplates,
      icon: <MailOutlined />,
      color: '#1890ff',
      path: '/admin/settings/mail',
      description: 'Configure email templates and notifications',
      status: 'active',
    },
    {
      title: 'Notifications',
      count: stats.notificationTemplates,
      icon: <BellOutlined />,
      color: '#52c41a',
      path: '/admin/settings/notifications',
      description: 'Manage notification templates and settings',
      status: 'active',
    },
    {
      title: 'Configuration',
      count: stats.configItems,
      icon: <SettingOutlined />,
      color: '#722ed1',
      path: '/admin/settings/config',
      description: 'System configuration and parameters',
      status: 'active',
    },
  ];

  const recentActivity = [
    { action: 'Mail template updated', time: '2 hours ago', type: 'mail' },
    { action: 'Notification setting changed', time: '1 day ago', type: 'notification' },
    { action: 'Configuration parameter added', time: '2 days ago', type: 'config' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <SettingOutlined style={{ marginRight: 8 }} />
              Settings Management
            </Title>
            <Paragraph type="secondary" style={{ margin: '8px 0 0 0' }}>
              Configure application settings, templates, and notifications
            </Paragraph>
          </div>
          <Button icon={<ReloadOutlined />} onClick={fetchStats} loading={loading}>
            Refresh
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        {settingsCards.map((card) => (
          <Col xs={24} sm={12} lg={8} key={card.title}>
            <Card
              hoverable
              onClick={() => navigate(card.path)}
              style={{
                cursor: 'pointer',
                borderLeft: `4px solid ${card.color}`,
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                {React.cloneElement(card.icon, {
                  style: { color: card.color, fontSize: '24px', marginRight: 12 },
                })}
                <div>
                  <Title level={4} style={{ margin: 0 }}>
                    {card.title}
                  </Title>
                  <Badge
                    status={card.status === 'active' ? 'success' : 'warning'}
                    text={card.status === 'active' ? 'Active' : 'Inactive'}
                  />
                </div>
              </div>
              <Paragraph
                type="secondary"
                style={{
                  margin: '0 0 12px 0',
                  fontSize: '13px',
                }}
              >
                {card.description}
              </Paragraph>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: card.color }}>
                {loading ? '-' : card.count} items
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card
            title="Recent Activity"
            style={{ borderTop: '3px solid #52c41a' }}
            extra={
              <Button type="link" size="small">
                View All
              </Button>
            }
          >
            <List
              dataSource={recentActivity}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      item.type === 'mail' ? (
                        <MailOutlined style={{ color: '#1890ff' }} />
                      ) : item.type === 'notification' ? (
                        <BellOutlined style={{ color: '#52c41a' }} />
                      ) : (
                        <SettingOutlined style={{ color: '#722ed1' }} />
                      )
                    }
                    title={item.action}
                    description={item.time}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="System Status" style={{ borderTop: '3px solid #1890ff' }}>
            <List
              dataSource={[
                { name: 'Email Service', status: 'online' },
                { name: 'Notification Service', status: 'online' },
                { name: 'Configuration Service', status: 'online' },
              ]}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      item.status === 'online' ? (
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      ) : (
                        <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                      )
                    }
                    title={item.name}
                    description={
                      item.status === 'online' ? 'Service running normally' : 'Service offline'
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
