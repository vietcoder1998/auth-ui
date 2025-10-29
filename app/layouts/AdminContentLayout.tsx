import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ResponsiveProvider } from '~/hooks/useResponsive.tsx';
import ResponsiveContent from './ResponsiveContent.tsx';
import AdminBreadcrumb from './AdminBreadcrumb.tsx';
import { useAuth } from '../hooks/useAuth.tsx';
import { Layout } from 'antd';

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
  const [editSidebar, setEditSidebar] = useState(false);

  // Handle chat position change via buttons
  // Responsive state will be handled inside ResponsiveContent

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

  // Use AdminBreadcrumb component for breadcrumbs
  const generateBreadcrumb = () => AdminBreadcrumb({ pathname });

  // Profile menu logic can be moved to a separate component if needed
  const profileMenuItems = undefined; // Placeholder, can use AdminProfileMenu if needed

  // Use cookie for sidebar order

  // Filter sidebar items by search
  // filteredSidebarItems will be handled inside ResponsiveContent

  // Drag and drop handler
  // onDragEnd will be handled inside ResponsiveContent

  return (
    <ResponsiveProvider>
      <ResponsiveContent
        editSidebar={editSidebar}
        setEditSidebar={setEditSidebar}
        pathname={pathname}
        navigate={navigate}
        handleLogout={handleLogout}
        profileMenuItems={profileMenuItems}
        generateBreadcrumb={generateBreadcrumb}
        isMainAdmin={isMainAdmin}
      />
    </ResponsiveProvider>
  );

  // ResponsiveContent is now imported from a separate file
}
