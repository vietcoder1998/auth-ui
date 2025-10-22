import { UserOutlined } from '@ant-design/icons';
import { Avatar, Dropdown } from 'antd';
import React from 'react';

import { LogoutOutlined, ProfileOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

interface AdminProfileMenuProps {
  user: {
    nickname?: string;
    email?: string;
    role?: { name?: string };
  } | null;
  onLogout?: () => void;
}

const AdminProfileMenu: React.FC<AdminProfileMenuProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const profileMenuItems = [
    {
      key: 'profile',
      icon: <ProfileOutlined />,
      label: 'Profile',
      onClick: () => navigate('/admin/profile'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: onLogout,
      danger: true,
    },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ textAlign: 'right', lineHeight: 1.2 }}>
        <div style={{ color: '#333', fontSize: '14px', fontWeight: 500 }}>
          {user?.nickname || user?.email || 'Unknown User'}
        </div>
        {user?.role && (
          <div style={{ color: '#666', fontSize: '12px' }}>{user.role.name || 'No Role'}</div>
        )}
      </div>
      <Dropdown
        menu={{ items: profileMenuItems as any }}
        placement="bottomRight"
        trigger={['click']}
      >
        <Avatar
          size={32}
          icon={<UserOutlined />}
          style={{ backgroundColor: '#1890ff', cursor: 'pointer' }}
        />
      </Dropdown>
    </div>
  );
};

export default AdminProfileMenu;
