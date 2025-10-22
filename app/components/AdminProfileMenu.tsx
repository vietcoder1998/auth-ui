import React from 'react';
import { Avatar, Dropdown } from 'antd';
import { UserOutlined } from '@ant-design/icons';

interface AdminProfileMenuProps {
  user: {
    nickname?: string;
    email?: string;
    role?: { name?: string };
  } | null;
  profileMenuItems: any[];
}

const AdminProfileMenu: React.FC<AdminProfileMenuProps> = ({ user, profileMenuItems }) => (
  <>
    <div style={{ textAlign: 'right', lineHeight: 1.2 }}>
      <div style={{ color: '#333', fontSize: '14px', fontWeight: 500 }}>
        {user?.nickname || user?.email || 'Unknown User'}
      </div>
      {user?.role && (
        <div style={{ color: '#666', fontSize: '12px' }}>{user.role.name || 'No Role'}</div>
      )}
    </div>
    <Dropdown menu={{ items: profileMenuItems }} placement="bottomRight" trigger={['click']}>
      <Avatar
        size={32}
        icon={<UserOutlined />}
        style={{ backgroundColor: '#1890ff', cursor: 'pointer' }}
      />
    </Dropdown>
  </>
);

export default AdminProfileMenu;
