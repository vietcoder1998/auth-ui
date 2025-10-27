import { Breadcrumb } from 'antd';
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { UpOutlined, DownOutlined } from '@ant-design/icons';
import AdminTopBar from './AdminTopBar.tsx';

export default function AdminHeader({ profileMenuItems, generateBreadcrumb }: any) {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <>
      <AdminTopBar profileMenuItems={profileMenuItems} />
      <div
        style={{
          background: '#fff',
          borderBottom: '1px solid #eee',
          padding: collapsed ? '5px 24px' : '10px 24px',
          height: collapsed ? 30 : 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 999,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
        onClick={toggleCollapse}
      >
        {!collapsed && <Breadcrumb items={generateBreadcrumb()} style={{ fontSize: '14px' }} />}
        {collapsed && (
          <span style={{ fontSize: '12px', color: '#999' }}>Click to expand breadcrumb</span>
        )}
        <span style={{ fontSize: '12px', color: '#999', marginLeft: 'auto' }}>
          {collapsed ? <DownOutlined /> : <UpOutlined />}
        </span>
      </div>
    </>
  );
}
