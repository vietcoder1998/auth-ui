import React from 'react';
import { Layout, Menu, Typography } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router';
import {
  MailOutlined,
  BellOutlined,
  SettingOutlined,
  KeyOutlined,
} from '@ant-design/icons';

const { Content, Sider } = Layout;
const { Title } = Typography;

export default function AdminSettingsLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const settingsMenuItems = [
    {
      key: '/admin/settings',
      icon: <SettingOutlined />,
      label: 'Settings Overview',
      onClick: () => navigate('/admin/settings'),
    },
    {
      key: '/admin/settings/api-keys',
      icon: <KeyOutlined />,
      label: 'API Keys',
      onClick: () => navigate('/admin/settings/api-keys'),
    },
    {
      key: '/admin/settings/mail',
      icon: <MailOutlined />,
      label: 'Mail Templates',
      onClick: () => navigate('/admin/settings/mail'),
    },
    {
      key: '/admin/settings/notifications',
      icon: <BellOutlined />,
      label: 'Notifications',
      onClick: () => navigate('/admin/settings/notifications'),
    },
    {
      key: '/admin/settings/config',
      icon: <SettingOutlined />,
      label: 'Configuration',
      onClick: () => navigate('/admin/settings/config'),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Sider
        width={250}
        style={{
          background: '#fff',
          borderRight: '1px solid #f0f0f0',
        }}
        collapsed={false}
      >
        <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
          <Title level={4} style={{ margin: 0, color: '#52c41a' }}>
            Settings Management
          </Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={settingsMenuItems}
          style={{ borderRight: 0, height: 'calc(100% - 64px)' }}
        />
      </Sider>
      <Layout>
        <Content style={{ padding: '24px', background: '#f5f5f5' }}>
          <div
            style={{
              padding: 12,
              background: '#fff',
              borderRadius: 8,
              minHeight: 360,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}