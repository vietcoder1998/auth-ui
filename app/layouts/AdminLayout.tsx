import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Typography, Button, Tooltip } from 'antd';
import {
  DatabaseOutlined,
  SettingOutlined,
  HomeOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import {Outlet} from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.tsx';
const { Sider, Content } = Layout;
const { Title } = Typography;

const adminLinks = [
  { path: '/admin', label: 'Dashboard', icon: <HomeOutlined /> },
  { path: '/admin/system', label: 'System Management', icon: <DatabaseOutlined /> },
  { path: '/admin/settings', label: 'Settings Management', icon: <SettingOutlined /> },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  // Determine selected keys based on current path
  const selectedKeys = [pathname];
  if (pathname.startsWith('/admin/system')) {
    selectedKeys.push('/admin/system');
  } else if (pathname.startsWith('/admin/settings')) {
    selectedKeys.push('/admin/settings');
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <Layout style={{ minHeight: '100vh', background: '#f6f8fa' }}>
      <Sider
        breakpoint="md"
        collapsedWidth="0"
        style={{ 
          background: '#fff', 
          borderRight: '1px solid #eee', 
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column'
        }}
        width={80}
        // collapsed={true}
      >
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          style={{ borderRight: 0, flex: 1 }}
          items={adminLinks.map(link => ({
            key: link.path,
            icon: <Link to={link.path}>{link.icon}</Link>,
            title: link.label
          }))}
        />
        <div style={{ padding: '16px 8px', borderTop: '1px solid #eee' }}>
          <Tooltip title="Logout" placement="right">
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              style={{ width: '100%', height: '40px' }}
              danger
            />
          </Tooltip>
        </div>
      </Sider>
      <Layout>
        <Content style={{ minWidth: 0, background: '#f6f8fa' }}>
          <div
            style={{
              background: '#fff',
              borderRadius: 8,
              minHeight: 'calc(100vh - 48px)',
            }}
          >
            <Outlet/>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
