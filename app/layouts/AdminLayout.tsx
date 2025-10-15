import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Typography, Button, Tooltip, Avatar, Dropdown, Breadcrumb } from 'antd';
import type { MenuProps } from 'antd';
import {
  DatabaseOutlined,
  SettingOutlined,
  HomeOutlined,
  LogoutOutlined,
  UserOutlined,
  ProfileOutlined,
  MessageOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.tsx';
import LLMChat from '../components/LLMChat.tsx';
const { Sider, Content, Header } = Layout;
const { Title } = Typography;

const adminLinks = [
  { path: '/admin', label: 'Dashboard', icon: <HomeOutlined /> },
  { path: '/admin/system', label: 'System Management', icon: <DatabaseOutlined /> },
  { path: '/admin/settings', label: 'Settings Management', icon: <SettingOutlined /> },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isChatVisible, setIsChatVisible] = useState(false);
  
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

  // Generate breadcrumb items based on current path
  const generateBreadcrumb = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbItems: { title: React.ReactNode }[] = [
      {
        title: <Link to="/admin"><HomeOutlined /> Admin</Link>,
      }
    ];

    if (pathSegments.length > 1) {
      if (pathSegments[1] === 'system') {
        breadcrumbItems.push({
          title: <Link to="/admin/system">System Management</Link>
        });
        if (pathSegments[2]) {
          const pageTitle = pathSegments[2]
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          breadcrumbItems.push({
            title: <span>{pageTitle}</span>
          });
        }
      } else if (pathSegments[1] === 'settings') {
        breadcrumbItems.push({
          title: <Link to="/admin/settings">Settings Management</Link>
        });
        if (pathSegments[2]) {
          const pageTitle = pathSegments[2]
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          breadcrumbItems.push({
            title: <span>{pageTitle}</span>
          });
        }
      }
    }

    return breadcrumbItems;
  };

  // Profile dropdown menu
  const profileMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <ProfileOutlined />,
      label: 'Profile',
      onClick: () => navigate('/profile')
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
      danger: true
    }
  ];
  
  return (
    <Layout style={{ height: '100vh', background: '#f6f8fa' }}>
      <Sider
        style={{ 
          background: '#fff', 
          borderRight: '1px solid #eee',
          display: 'flex',
          flexDirection: 'column'
        }}
        width={80}
        collapsed={false}
      >
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          style={{ borderRight: 0, flex: 1 }}
          items={adminLinks.map(link => ({
            key: link.path,
            icon: <Link to={link.path}>{link.icon}</Link>,
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
        <Header style={{ 
          background: '#fff', 
          borderBottom: '1px solid #eee',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: 64,
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}>
          <Breadcrumb
            items={generateBreadcrumb()}
            style={{ fontSize: '14px' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Tooltip title={isChatVisible ? "Hide AI Chat" : "Show AI Chat"}>
              <Button
                type={isChatVisible ? "primary" : "default"}
                icon={isChatVisible ? <CloseOutlined /> : <MessageOutlined />}
                onClick={() => setIsChatVisible(!isChatVisible)}
                style={{ marginRight: '8px' }}
              />
            </Tooltip>
            <div style={{ textAlign: 'right', lineHeight: 1.2 }}>
              <div style={{ color: '#333', fontSize: '14px', fontWeight: 500 }}>
                {user?.nickname || user?.email || 'Unknown User'}
              </div>
              {user?.role && (
                <div style={{ color: '#666', fontSize: '12px' }}>
                  {user.role.name || 'No Role'}
                </div>
              )}
            </div>
            <Dropdown
              menu={{ items: profileMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <Avatar
                size={32}
                icon={<UserOutlined />}
                style={{ 
                  backgroundColor: '#1890ff',
                  cursor: 'pointer'
                }}
              />
            </Dropdown>
          </div>
        </Header>
        <Content style={{ minWidth: 0, background: '#f6f8fa', display: 'flex', gap: '16px',height: 'calc(' }}>
          <div
            style={{
              background: '#fff',
              borderRadius: 8,
              minHeight: 'calc(100vh - 112px)',
              flex: isChatVisible ? '1' : '1',
              transition: 'all 0.3s ease',
            }}
          >
            <Outlet/>
          </div>
          
          {isChatVisible && (
            <div
              style={{
                width: '400px',
                height: '70vh',
                background: '#fff',
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <LLMChat />
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
}
