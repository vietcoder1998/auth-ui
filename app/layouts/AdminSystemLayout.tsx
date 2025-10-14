import React from 'react';
import { Layout, Menu, Typography } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router';
import {
  UserOutlined,
  KeyOutlined,
  TeamOutlined,
  SafetyOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';

const { Content, Sider } = Layout;
const { Title } = Typography;

export default function AdminSystemLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const systemMenuItems = [
    {
      key: '/admin/system',
      icon: <DatabaseOutlined />,
      label: 'System Overview',
      onClick: () => navigate('/admin/system'),
    },
    {
      key: '/admin/system/users',
      icon: <UserOutlined />,
      label: 'Users',
      onClick: () => navigate('/admin/system/users'),
    },
    {
      key: '/admin/system/tokens',
      icon: <KeyOutlined />,
      label: 'Tokens',
      onClick: () => navigate('/admin/system/tokens'),
    },
    {
      key: '/admin/system/roles',
      icon: <TeamOutlined />,
      label: 'Roles',
      onClick: () => navigate('/admin/system/roles'),
    },
    {
      key: '/admin/system/permissions',
      icon: <SafetyOutlined />,
      label: 'Permissions',
      onClick: () => navigate('/admin/system/permissions'),
    },
    {
      key: '/admin/system/cache',
      icon: <DatabaseOutlined />,
      label: 'Cache',
      onClick: () => navigate('/admin/system/cache'),
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
        breakpoint="lg"
        collapsedWidth="0"
      >
        <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
          <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
            System Management
          </Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={systemMenuItems}
          style={{ borderRight: 0, height: 'calc(100% - 64px)' }}
        />
      </Sider>
      <Layout>
        <Content style={{ padding: '24px', background: '#f5f5f5' }}>
          <div
            style={{
              padding: 24,
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