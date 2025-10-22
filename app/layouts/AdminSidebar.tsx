import {
  EditOutlined,
  SearchOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import React, { useContext } from 'react';
import { Button, Input } from 'antd';
import AdminSidebarMenu from '~/components/AdminSidebarMenu.tsx';
import type { MenuItem } from '../components/AdminSidebarMenu.tsx';
import { useResponsive } from '~/hooks/useResponsive.tsx';

export interface AdminSidebarProps {
  sidebarItems: MenuItem[];
  editSidebar: boolean;
  setEditSidebar: (v: boolean) => void;
  onDragEnd: (result: any) => void;
  filteredSidebarItems: MenuItem[];
  pathname: string;
  navigate: (key: string) => void;
  handleLogout: () => void;
}

export default function AdminSidebar({
  editSidebar,
  setEditSidebar,
  onDragEnd,
  pathname,
  navigate,
  handleLogout,
}: AdminSidebarProps) {
  const { sidebarOpen, setSidebarOpen, isMobile, search, setSearch, lastNav, setLastNav } =
    useResponsive();

  // Sync state with context
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const handleSidebarToggle = () => {
    setEditSidebar(!editSidebar);
    setSidebarOpen(!editSidebar);
  };
  const handleMenuClick = (key: string) => {
    navigate(key);
    setLastNav(key);
  };

  return (
    <div
      style={{
        background: '#fff',
        borderRight: '1px solid #eee',
        position: isMobile ? 'fixed' : 'fixed',
        left: sidebarOpen ? 0 : isMobile ? '-100%' : 0,
        top: 0,
        bottom: 0,
        zIndex: 1001,
        overflowY: 'auto',
        width: sidebarOpen ? (isMobile ? '80vw' : 250) : 48,
        transition: 'left 0.3s, width 0.3s',
        boxShadow: isMobile && sidebarOpen ? '2px 0 8px rgba(0,0,0,0.08)' : undefined,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', gap: 8 }}>
        {sidebarOpen && (
          <>
            <Input
              placeholder="Search menu..."
              value={search}
              onChange={handleSearchChange}
              style={{
                flex: 1,
                border: '1px solid #eee',
                borderRadius: 4,
                padding: '4px 8px',
                fontSize: 14,
                minWidth: 0,
              }}
              prefix={<SearchOutlined />}
            />
            <Button
              icon={<EditOutlined />}
              type={editSidebar ? 'primary' : 'default'}
              size="small"
              onClick={handleSidebarToggle}
              style={{ marginLeft: 4 }}
            />
          </>
        )}
        <Button
          icon={sidebarOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
          type="text"
          size="small"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ marginLeft: 4 }}
        />
      </div>
      {sidebarOpen && <AdminSidebarMenu selectedKeys={[lastNav]} onMenuClick={handleMenuClick} />}
    </div>
  );
}
