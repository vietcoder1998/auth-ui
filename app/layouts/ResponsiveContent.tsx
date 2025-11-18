import React from 'react';
import { Layout } from 'antd';
import { DropResult } from 'react-beautiful-dnd';
import { Outlet } from 'react-router-dom';
import { useResponsive } from '~/hooks/useResponsive.tsx';
import { AIGenerateProvider } from '~/providers/AIGenerateProvider.tsx';
import AdminSidebar from './AdminSidebar.tsx';
import AdminHeader from './AdminHeader.tsx';
import AdminChatWidget from '../components/AdminChatWidget.tsx';

const { Content } = Layout;

export default function ResponsiveContent({
  editSidebar,
  setEditSidebar,
  pathname,
  navigate,
  handleLogout,
  profileMenuItems,
  generateBreadcrumb,
  isMainAdmin,
}: any) {
  const {
    sidebarItems,
    setSidebarItems,
    search,
    setSearch,
    sidebarOpen,
    isMobile,
    isDesktop,
    isChatCollapsed,
    setIsChatCollapsed,
    chatPosition,
    setChatPosition,
  } = useResponsive();

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
    <Layout style={{ height: '100vh', background: '#f6f8fa' }}>
      <AdminSidebar
        sidebarItems={sidebarItems}
        editSidebar={editSidebar}
        setEditSidebar={setEditSidebar}
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
        <AdminHeader profileMenuItems={profileMenuItems} generateBreadcrumb={generateBreadcrumb} />
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
          />
        </Content>
      </Layout>
    </Layout>
  );
}
