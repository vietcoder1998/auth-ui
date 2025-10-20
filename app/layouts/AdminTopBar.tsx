import React from 'react';
import { Input, Dropdown, Avatar, Tag, List, Spin, Button } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import StatusIndicator from '../components/StatusIndicator.tsx';
import { useAuth } from '../hooks/useAuth.tsx';
import AdminNotificationDropdown from '../components/AdminNotificationDropdown.tsx';
import { adminApi } from '../apis/admin.api.ts';

export default function AdminTopBar({ profileMenuItems }: any) {
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
  const [searchLoading, setSearchLoading] = React.useState(false);

  React.useEffect(() => {
    if (search.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    const handler = setTimeout(async () => {
      try {
        const res = await adminApi.searchAll(search);
        setSearchResults(res.data.data.results || []);
      } catch {
        setSearchResults([]);
      }
      setSearchLoading(false);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  return (
    <div style={{
      background: '#fff',
      borderBottom: '1px solid #eee',
      paddingLeft: 24,
      paddingRight: 24,
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        <Dropdown
          open={searchVisible && (searchResults.length > 0 || searchLoading)}
          onOpenChange={setSearchVisible}
          dropdownRender={() => (
            <div style={{ background: 'white', padding: 0, minWidth: 350, maxWidth: 600 }}>
              {searchLoading ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <Spin />
                </div>
              ) : (
                <List
                  bordered
                  dataSource={searchResults}
                  style={{ width: '100%', maxHeight: 350, overflowY: 'auto', background: 'white' }}
                  renderItem={item => (
                    <List.Item style={{ cursor: 'pointer', background: 'white' }}>
                      <Tag color="blue" style={{ marginRight: 8 }}>{item.type}</Tag>
                      <span style={{ fontWeight: 500 }}>{item.name}</span>
                      <span style={{ color: '#888', marginLeft: 8 }}>{item.description}</span>
                    </List.Item>
                  )}
                />
              )}
            </div>
          )}
          placement="bottomLeft"
        >
          <Input
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
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <StatusIndicator />
        <AdminNotificationDropdown />
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
