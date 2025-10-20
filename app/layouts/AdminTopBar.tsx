
import { Avatar, Dropdown, Input, List, Spin, Tag } from 'antd';
import React from 'react';
import { UserOutlined, SearchOutlined } from '@ant-design/icons';
import { adminApi } from '~/apis/admin.api.ts';
import AdminNotificationDropdown from '~/components/AdminNotificationDropdown.tsx';
import StatusIndicator from '~/components/StatusIndicator.tsx';
import { useAuth } from '~/hooks/useAuth.tsx';
// System status fetcher
type SystemStatus = {
  api?: boolean;
  database?: boolean;
  redis?: boolean;
  memory?: string;
  cpu?: string;
  disk?: string;
};

function useSystemStatus(): SystemStatus | null {
  const [status, setStatus] = React.useState<SystemStatus | null>(null);
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/config/health');
        const data = await res.json();
        setStatus(data);
      } catch {
        setStatus(null);
      }
    };
    fetchStatus();
    timer = setInterval(fetchStatus, 10000); // refresh every 10s
    return () => clearInterval(timer);
  }, []);
  return status;
}

interface AdminTopBarProps {
  profileMenuItems: any[];
}

interface SearchResultItem {
  type: string;
  name: string;
  description?: string;
}

const AdminTopBar: React.FC<AdminTopBarProps> = ({ profileMenuItems }) => {
  const systemStatus = useSystemStatus();
  // Fix useAuth usage: pass required argument if needed, and correct type
  // If useAuth returns { user }, use it directly
  // useAuth returns AuthContextType, so destructure user directly
  const { user } = useAuth();
  const [search, setSearch] = React.useState<string>('');
  const [searchResults, setSearchResults] = React.useState<SearchResultItem[]>([]);
  const [searchVisible, setSearchVisible] = React.useState<boolean>(false);
  const [searchLoading, setSearchLoading] = React.useState<boolean>(false);

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
      padding: 24,
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
          onOpenChange={(open: boolean) => setSearchVisible(open)}
          popupRender={() => (
            <div style={{ background: 'white', padding: 0, minWidth: 350, maxWidth: 600 }}>
              {searchLoading ? (
                <div style={{ textAlign: 'center', padding: '24px 10px' }}>
                  <Spin />
                </div>
              ) : (
                <List
                  bordered
                  dataSource={searchResults}
                  style={{ width: '100%', maxHeight: 350, overflowY: 'auto', background: 'white' }}
                  renderItem={(item: SearchResultItem) => (
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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
        {/* System resource status */}
        {systemStatus && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#555', minWidth: 180 }}>
            <span title="API status" style={{ color: systemStatus.api ? '#52c41a' : '#d4380d' }}>API</span>
            <span title="DB status" style={{ color: systemStatus.database ? '#52c41a' : '#d4380d' }}>DB</span>
            <span title="Redis status" style={{ color: systemStatus.redis ? '#52c41a' : '#d4380d' }}>Redis</span>
            {/* Optionally add RAM/CPU/Disk if backend provides */}
            {systemStatus.memory && <span title="RAM">RAM: {systemStatus.memory}</span>}
            {systemStatus.cpu && <span title="CPU">CPU: {systemStatus.cpu}</span>}
            {systemStatus.disk && <span title="Disk">Disk: {systemStatus.disk}</span>}
          </div>
        )}
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
};

export default AdminTopBar;
