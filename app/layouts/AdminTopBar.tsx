
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, Input, List, Spin, Tag } from 'antd';
import React from 'react';
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
        const res = await adminApi.getHealthStatus();
        setStatus(res.data.data);
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

// System status components
const StatusBasic: React.FC<{ status: SystemStatus }> = ({ status }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <span title="API status" style={{ color: status.api ? '#52c41a' : '#d4380d' }}>API</span>
    <span title="DB status" style={{ color: status.database ? '#52c41a' : '#d4380d' }}>DB</span>
    <span title="Redis status" style={{ color: status.redis ? '#52c41a' : '#d4380d' }}>Redis</span>
  </div>
);

function getResourceColor(val?: string, type?: 'ram' | 'cpu' | 'disk') {
  if (!val) return '#888';
  // Try to extract percent from string like '45%' or '2.3GB/8GB (28%)'
  let percent = 0;
  const match = val.match(/(\d+)%/);
  if (match) percent = parseInt(match[1], 10);
  if (type === 'ram') {
    if (percent >= 80) return '#d4380d'; // danger red
    if (percent >= 50) return '#faad14'; // warning orange
    return '#52c41a'; // green
  }
  if (percent >= 80) return '#d4380d'; // red
  if (percent >= 60) return '#faad14'; // orange
  return '#52c41a'; // green
}

const StatusResources: React.FC<{ status: SystemStatus }> = ({ status }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
    {status.memory && (
      (() => {
        const color = getResourceColor(status.memory, 'ram');
        return (
          <span title="RAM">
            RAM: <span style={{ color, fontWeight: 500 }}>{status.memory}</span>
          </span>
        );
      })()
    )}
    {status.cpu && (
      (() => {
        const color = getResourceColor(status.cpu, 'cpu');
        return (
          <span title="CPU">
            CPU: <span style={{ color, fontWeight: 500 }}>{status.cpu}</span>
          </span>
        );
      })()
    )}
    {status.disk ? (
      (() => {
        const color = getResourceColor(status.disk, 'disk');
        return (
          <span title="Disk">
            Disk: <span style={{ color, fontWeight: 500 }}>{status.disk}</span>
          </span>
        );
      })()
    ) : (
      <span title="Disk" style={{ color: '#888' }}>Disk: <span style={{ color: '#888', fontWeight: 500 }}>N/A</span></span>
    )}
  </div>
);

const AdminTopBar: React.FC<AdminTopBarProps> = ({ profileMenuItems }) => {
  const systemStatus = useSystemStatus();
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
        {systemStatus && (
          <div style={{ minWidth: 180, fontSize: 12, color: '#555' }}>
            <StatusBasic status={systemStatus} />
            {(systemStatus.memory || systemStatus.cpu || systemStatus.disk) && <StatusResources status={systemStatus} />}
          </div>
        )}
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
};

export default AdminTopBar;
