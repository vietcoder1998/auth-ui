import React from 'react';
import { Breadcrumb, Avatar, Dropdown, Button, Tooltip, Typography, Input, Tag, List, InputRef } from 'antd';
import { HomeOutlined, UserOutlined, LogoutOutlined, ProfileOutlined, SearchOutlined } from '@ant-design/icons';
import StatusIndicator from '../components/StatusIndicator.tsx';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.tsx';
import { adminApi } from '../apis/admin.api.ts';

const { Title } = Typography;

export default function AdminHeader({ profileMenuItems, generateBreadcrumb }: any) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  let auth;
  try {
    auth = useAuth();
  } catch (error) {
    return null;
  }
  const { user } = auth;

  const [search, setSearch] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [searchVisible, setSearchVisible] = React.useState(false);
  const searchRef = React.useRef<InputRef>(null);
  React.useEffect(() => {
    if (search.length < 2) {
      setSearchResults([]);
      return;
    }
    const handler = setTimeout(async () => {
      try {
        const res = await adminApi.searchAll(search);
        setSearchResults(res.data.results || []);
      } catch {
        setSearchResults([]);
      }
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  return (
    <div style={{
      background: '#fff',
      borderBottom: '1px solid #eee',
      padding: '0 24px',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <Breadcrumb
        items={generateBreadcrumb()}
        style={{ fontSize: '14px' }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Dropdown
          open={searchVisible && searchResults.length > 0}
          onOpenChange={setSearchVisible}
          dropdownRender={() => (
            <List
              bordered
              dataSource={searchResults}
              style={{ width: 400, maxHeight: 350, overflowY: 'auto' }}
              renderItem={item => (
                <List.Item style={{ cursor: 'pointer' }}>
                  <Tag color="blue" style={{ marginRight: 8 }}>{item.type}</Tag>
                  <span style={{ fontWeight: 500 }}>{item.name}</span>
                  <span style={{ color: '#888', marginLeft: 8 }}>{item.description}</span>
                </List.Item>
              )}
            />
          )}
        >
          <Input
            ref={searchRef}
            prefix={<SearchOutlined />}
            placeholder="Search all..."
            allowClear
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setSearchVisible(true);
            }}
            onBlur={() => setTimeout(() => setSearchVisible(false), 200)}
            style={{ width: 260, marginRight: 16 }}
          />
        </Dropdown>
        <StatusIndicator />
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
            style={{ backgroundColor: '#1890ff', cursor: 'pointer' }}
          />
        </Dropdown>
      </div>
    </div>
  );
}
