import {
  DatabaseOutlined,
  DragOutlined,
  ExpandOutlined,
  HomeOutlined,
  LogoutOutlined,
  MessageOutlined,
  MinusOutlined,
  ProfileOutlined,
  SettingOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Dropdown, Layout, Tooltip, Typography } from 'antd';
import React, { useState } from 'react';
import { DropResult } from 'react-beautiful-dnd';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import ErrorDisplay from '../components/ErrorDisplay.tsx';
import LLMChat from '../components/LLMChat.tsx';
import { useAuth } from '../hooks/useAuth.tsx';
import useCookie, { useBooleanCookie, useStringCookie } from '../hooks/useCookie.tsx';
import AdminHeader from './AdminHeader.tsx';
import AdminSidebar from './AdminSidebar.tsx';

const { Sider, Content, Header } = Layout;
const { Title } = Typography;

const adminLinks = [
  { path: '/admin', label: 'Dashboard', icon: <HomeOutlined /> },
  { path: '/admin/system', label: 'System Management', icon: <DatabaseOutlined /> },
  { path: '/admin/settings', label: 'Settings Management', icon: <SettingOutlined /> },
];

export default function AdminContentLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Add error handling for useAuth
  let auth;
  try {
    auth = useAuth();
  } catch (error) {
    console.error('useAuth error in AdminContentLayout:', error);
    // Fallback UI when AuthProvider is not available
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Authentication Error</h2>
        <p>Please reload the page or contact support if the issue persists.</p>
        <button onClick={() => window.location.reload()}>Reload Page</button>
      </div>
    );
  }

  const { logout, user } = auth;
  const [isChatCollapsed, setIsChatCollapsed] = useBooleanCookie('admin_chat_collapsed', false);
  const [chatPosition, setChatPosition] = useStringCookie('admin_chat_position', 'bottom-right');
  const [editSidebar, setEditSidebar] = useState(false);
  const [search, setSearch] = useState('');


  // Handle chat position change via buttons
  const handlePositionChange = (position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left') => {
    setChatPosition(position);
  };

  // Determine which section we're in
  const isMainAdmin = pathname === '/admin';
  const isSystemSection = pathname.startsWith('/admin/system');
  const isSettingsSection = pathname.startsWith('/admin/settings');

  // Determine selected keys based on current path
  const selectedKeys = [pathname];
  if (isSystemSection) {
    selectedKeys.push('/admin/system');
  } else if (isSettingsSection) {
    selectedKeys.push('/admin/settings');
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMenuClick = (key: string) => {
    navigate(key);
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

  // Use cookie for sidebar order
  const [sidebarItems, setSidebarItems] = useCookie<any[]>('admin_sidebar_order', []);

  // Filter sidebar items by search
  const filteredSidebarItems = sidebarItems.map(item => {
    if (item.type === 'group') {
      return {
        ...item,
        children: item.children?.filter((child: any) =>
          child.label.toLowerCase().includes(search.toLowerCase())
        ) || [],
      };
    }
    if (item.label && typeof item.label === 'string') {
      return item.label.toLowerCase().includes(search.toLowerCase()) ? item : null;
    }
    return item;
  }).filter(Boolean);

  // Drag and drop handler
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(sidebarItems);
    const [removed] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, removed);
    setSidebarItems(items);
  };

  return (
    <Layout style={{ height: '100vh', background: '#f6f8fa' }}>
      <AdminSidebar
        sidebarItems={sidebarItems}
        editSidebar={editSidebar}
        setEditSidebar={setEditSidebar}
        search={search}
        setSearch={setSearch}
        onDragEnd={onDragEnd}
        filteredSidebarItems={filteredSidebarItems}
        pathname={pathname}
        navigate={navigate}
        handleLogout={handleLogout}
      />
      <Layout style={{ marginLeft: 250 }}>
        <AdminHeader
          profileMenuItems={profileMenuItems}
          generateBreadcrumb={generateBreadcrumb}
        />
        <Content style={{
          minWidth: 0,
          background: isMainAdmin ? '#f6f8fa' : '#f5f5f5',
          position: 'relative',
          padding: '0', // Remove section-based padding from Content
        }}>
          <div
            style={{
              background: '#fff',
              height: '100%',
              overflowY: 'auto',
              minHeight: 360,
              padding: '24px', // Always use 24px padding for header/content
            }}
          >
            <ErrorDisplay style={{
              position: 'sticky',
              top: 0,
              zIndex: 999,
              marginBottom: '0',
            }} />
            <Outlet />
          </div>
          {/* Floating Chat Box - With Position Buttons */}
          <div
            style={{
              position: 'fixed',
              width: '400px',
              height: isChatCollapsed ? '60px' : '500px',
              background: '#fff',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              zIndex: 1000,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              ...(chatPosition === 'bottom-right' && { bottom: '20px', right: '20px' }),
              ...(chatPosition === 'bottom-left' && { bottom: '20px', left: '20px' }),
              ...(chatPosition === 'top-right' && { top: '20px', right: '20px' }),
              ...(chatPosition === 'top-left' && { top: '20px', left: '20px' }),
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Chat Header with Collapse Button and Position Controls */}
            <div
              style={{
                padding: '12px 16px',
                borderBottom: isChatCollapsed ? 'none' : '1px solid #f0f0f0',
                background: '#fafafa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                minHeight: '48px',
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageOutlined style={{ color: '#1890ff' }} />
                <Typography.Text strong style={{ fontSize: '14px' }}>
                  AI Assistant
                </Typography.Text>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {/* Position Control Buttons */}
                <Tooltip title="Change Position" placement="bottom">
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: 'top-left',
                          label: 'Top Left',
                          onClick: () => handlePositionChange('top-left'),
                        },
                        {
                          key: 'top-right',
                          label: 'Top Right',
                          onClick: () => handlePositionChange('top-right'),
                        },
                        {
                          key: 'bottom-left',
                          label: 'Bottom Left',
                          onClick: () => handlePositionChange('bottom-left'),
                        },
                        {
                          key: 'bottom-right',
                          label: 'Bottom Right',
                          onClick: () => handlePositionChange('bottom-right'),
                        },
                      ]
                    }}
                    trigger={['click']}
                    placement="bottomRight"
                  >
                    <Button
                      type="text"
                      size="small"
                      icon={<DragOutlined />}
                      style={{
                        color: '#666',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    />
                  </Dropdown>
                </Tooltip>

                {/* Collapse Button */}
                <Button
                  type="text"
                  size="small"
                  icon={isChatCollapsed ? <ExpandOutlined /> : <MinusOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsChatCollapsed(!isChatCollapsed);
                  }}
                  style={{
                    color: '#666',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                />
              </div>
            </div>

            {/* Chat Content */}
            {!isChatCollapsed && (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <LLMChat />
              </div>
            )}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}