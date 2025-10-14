import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  UserOutlined,
  KeyOutlined,
  SafetyOutlined,
  SettingOutlined,
  MailOutlined,
  NotificationOutlined,
  DatabaseOutlined,
  CloudServerOutlined,
} from '@ant-design/icons';
import {Outlet} from 'react-router-dom'
const { Sider, Content } = Layout;

const adminLinks = [
  { path: '/admin/users', label: 'Users', icon: <UserOutlined /> },
  { path: '/admin/tokens', label: 'Tokens', icon: <KeyOutlined /> },
  { path: '/admin/roles', label: 'Roles', icon: <SafetyOutlined /> },
  { path: '/admin/permissions', label: 'Permissions', icon: <SettingOutlined /> },
  { path: '/admin/mail', label: 'Mail', icon: <MailOutlined /> },
  { path: '/admin/notifications', label: 'Notifications', icon: <NotificationOutlined /> },
  { path: '/admin/config', label: 'Config', icon: <DatabaseOutlined /> },
  { path: '/admin/cache', label: 'Cache', icon: <CloudServerOutlined /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  return (
    <Layout style={{ minHeight: '100vh', background: '#f6f8fa' }}>
      <Sider
        breakpoint="md"
        collapsedWidth="0"
        style={{ background: '#fff', borderRight: '1px solid #eee', minWidth: 0 }}
        width={220}
      >
        <div style={{ textAlign: 'center', margin: '1em 0', fontSize: '1.3em', fontWeight: 600 }}>Admin</div>
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          style={{ borderRight: 0 }}
        >
          {adminLinks.map(link => (
            <Menu.Item key={link.path} icon={link.icon}>
              <Link to={link.path}>{link.label}</Link>
            </Menu.Item>
          ))}
        </Menu>
      </Sider>
      <Layout>
        <Content style={{ padding: '2em', minWidth: 0 }}>
          <Outlet/>
        </Content>
      </Layout>
    </Layout>
  );
}
