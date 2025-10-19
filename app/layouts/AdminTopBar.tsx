import React from 'react';
import { Input, Dropdown, Avatar, Tag, List, Spin, Badge, Button } from 'antd';
import { SearchOutlined, UserOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import StatusIndicator from '../components/StatusIndicator.tsx';
import { useAuth } from '../hooks/useAuth.tsx';
import { useUpdatePermissions } from '../hooks/useUpdatePermissions.ts';
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
  const { errors, notifOpen, setNotifOpen, dismissError, dismissAllErrors } = useUpdatePermissions();

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
      padding: '0 24px',
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
        <Dropdown
          open={notifOpen}
          onOpenChange={setNotifOpen}
          dropdownRender={() => (
            <div style={{ background: 'white', minWidth: 350, maxWidth: 500, boxShadow: '0 2px 8px #ccc', borderRadius: 8 }}>
              <List
                header={<div style={{ fontWeight: 600 }}>Notifications</div>}
                dataSource={errors}
                locale={{ emptyText: 'No notifications' }}
                style={{ maxHeight: 350, overflowY: 'auto', background: 'white' }}
                renderItem={error => (
                  <List.Item
                    style={{ background: 'white', borderBottom: '1px solid #f0f0f0', padding: '12px 16px' }}
                    actions={[
                      <Button size="small" type="text" onClick={() => dismissError(error.id)} key="close">Dismiss</Button>
                    ]}
                  >
                    <div style={{ fontWeight: 500, color: error.status >= 500 ? '#d4380d' : '#faad14' }}>
                      <ExclamationCircleOutlined style={{ marginRight: 8 }} />
                      {error.message}
                    </div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                      {error.details && typeof error.details === 'string'
                        ? error.details
                        : error.details && JSON.stringify(error.details)}
                    </div>
                  </List.Item>
                )}
              />
              {errors.length > 1 && (
                <div style={{ textAlign: 'right', padding: '8px 16px' }}>
                  <Button size="small" type="link" onClick={dismissAllErrors} style={{ fontSize: '11px' }}>
                    Dismiss All
                  </Button>
                </div>
              )}
            </div>
          )}
        >
          <Badge count={errors.length} size="small" offset={[0, 0]}>
            <Button
              type="text"
              icon={<ExclamationCircleOutlined style={{ fontSize: 22, color: errors.length ? '#d4380d' : '#aaa' }} />}
              style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}
              onClick={() => setNotifOpen(!notifOpen)}
            />
          </Badge>
        </Dropdown>
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
