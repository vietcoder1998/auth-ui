import { HomeOutlined, LogoutOutlined, ProfileOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Layout } from 'antd';
import React, { useState } from 'react';
import { DropResult } from 'react-beautiful-dnd';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ResponsiveProvider, useResponsive } from '~/hooks/useResponsive.tsx';
import { AIGenerateProvider } from '~/providers/AIGenerateProvider.tsx';
import AdminChatWidget from '../components/AdminChatWidget.tsx';
import { useAuth } from '../hooks/useAuth.tsx';
import useCookie, { useBooleanCookie, useStringCookie } from '../hooks/useCookie.tsx';
import AdminHeader from './AdminHeader.tsx';
import AdminSidebar from './AdminSidebar.tsx';

const { Content } = Layout;

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
  const handlePositionChange = (
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  ) => {
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

  // Generate breadcrumb items based on current path
  const generateBreadcrumb = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbItems: { title: React.ReactNode }[] = [
      {
        title: (
          <Link to="/admin">
            <HomeOutlined /> Admin
          </Link>
        ),
      },
    ];

    const { sidebarOpen, isMobile } = useResponsive();
    if (pathSegments.length > 1) {
      if (pathSegments[1] === 'system') {
        breadcrumbItems.push({
          title: <Link to="/admin/system">System Management</Link>,
        });
        if (pathSegments[2]) {
          const pageTitle = pathSegments[2]
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          breadcrumbItems.push({
            title: <span>{pageTitle}</span>,
          });
        }
      } else if (pathSegments[1] === 'settings') {
        breadcrumbItems.push({
          title: <Link to="/admin/settings">Settings Management</Link>,
        });
        if (pathSegments[2]) {
          const pageTitle = pathSegments[2]
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          breadcrumbItems.push({
            title: <span>{pageTitle}</span>,
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
      onClick: () => navigate('/profile'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
      danger: true,
    },
  ];

  // Use cookie for sidebar order
  const [sidebarItems, setSidebarItems] = useCookie<any[]>('admin_sidebar_order', []);

  // Filter sidebar items by search
  const filteredSidebarItems = sidebarItems
    .map((item) => {
      if (item.type === 'group') {
        return {
          ...item,
          children:
            item.children?.filter((child: any) =>
              child.label.toLowerCase().includes(search.toLowerCase())
            ) || [],
        };
      }
      if (item.label && typeof item.label === 'string') {
        return item.label.toLowerCase().includes(search.toLowerCase()) ? item : null;
      }
      return item;
    })
    .filter(Boolean);

  // Drag and drop handler
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(sidebarItems);
    const [removed] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, removed);
    setSidebarItems(items);
  };

  return (
    <ResponsiveProvider>
      <ResponsiveContent
        {...{
          sidebarItems,
          editSidebar,
          setEditSidebar,
          search,
          setSearch,
          onDragEnd,
          filteredSidebarItems,
          pathname,
          navigate,
          handleLogout,
          profileMenuItems,
          generateBreadcrumb,
          isMainAdmin,
          isChatCollapsed,
          setIsChatCollapsed,
          chatPosition,
          handlePositionChange,
        }}
      />
    </ResponsiveProvider>
  );

  function ResponsiveContent(props: any) {
    const { sidebarOpen } = useResponsive();
    const isMobile = window.innerWidth <= 768;
    const isDesktop = !isMobile;
    const {
      sidebarItems,
      editSidebar,
      setEditSidebar,
      search,
      setSearch,
      onDragEnd,
      filteredSidebarItems,
      pathname,
      navigate,
      handleLogout,
      profileMenuItems,
      generateBreadcrumb,
      isMainAdmin,
      isChatCollapsed,
      setIsChatCollapsed,
      chatPosition,
      handlePositionChange,
    } = props;
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
        <Layout
          style={{
            marginLeft: isDesktop && sidebarOpen ? 250 : 50,
          }}
        >
          <AdminHeader
            profileMenuItems={profileMenuItems}
            generateBreadcrumb={generateBreadcrumb}
          />
          <Content
            style={{
              minWidth: 0,
              background: isMainAdmin ? '#f6f8fa' : '#f5f5f5',
              position: 'relative',
            }}
          >
            <div
              style={{
                background: '#fff',
                height: '100%',
                overflowY: 'auto',
                minHeight: 360,
                padding: '24px',
              }}
            >
              <AIGenerateProvider>
                <Outlet />
              </AIGenerateProvider>
            </div>
            <AdminChatWidget
              isChatCollapsed={isChatCollapsed}
              setIsChatCollapsed={setIsChatCollapsed}
              chatPosition={chatPosition}
              handlePositionChange={handlePositionChange}
            />
          </Content>
        </Layout>
      </Layout>
    );
  }
}
