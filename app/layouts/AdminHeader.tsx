import { Breadcrumb } from 'antd';
import React from 'react';
import { useLocation } from 'react-router-dom';
import AdminTopBar from './AdminTopBar.tsx';

export default function AdminHeader({ profileMenuItems, generateBreadcrumb }: any) {
  const { pathname } = useLocation();

  return (
    <>
      <AdminTopBar profileMenuItems={profileMenuItems} />
      <div
        style={{
          background: '#fff',
          borderBottom: '1px solid #eee',
          padding: '10px 24px',
          height: 40,
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          zIndex: 999,
        }}
      >
        <Breadcrumb items={generateBreadcrumb()} style={{ fontSize: '14px' }} />
      </div>
    </>
  );
}
