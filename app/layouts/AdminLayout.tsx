import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography } from 'antd';
import {
  DatabaseOutlined,
  SettingOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import {Outlet} from 'react-router-dom'
const { Sider, Content } = Layout;
const { Title } = Typography;

const adminLinks = [
  { path: '/admin', label: 'Dashboard', icon: <HomeOutlined /> },
  { path: '/admin/system', label: 'System Management', icon: <DatabaseOutlined /> },
  { path: '/admin/settings', label: 'Settings Management', icon: <SettingOutlined /> },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  
  // Determine selected keys based on current path
  const selectedKeys = [pathname];
  if (pathname.startsWith('/admin/system')) {
    selectedKeys.push('/admin/system');
  } else if (pathname.startsWith('/admin/settings')) {
    selectedKeys.push('/admin/settings');
  }
  
  return (
    <Layout style={{ minHeight: '100vh', background: '#f6f8fa' }}>
      <Sider
        breakpoint="md"
        collapsedWidth="0"
        style={{ background: '#fff', borderRight: '1px solid #eee', minWidth: 0 }}
        width={80}
        collapsed={true}
      >
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          style={{ borderRight: 0, height: '100%' }}
          items={adminLinks.map(link => ({
            key: link.path,
            icon: <Link to={link.path}>{link.icon}</Link>,
            title: link.label
          }))}
        />
      </Sider>
      <Layout>
        <Content style={{ padding: '24px', minWidth: 0, background: '#f6f8fa' }}>
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
