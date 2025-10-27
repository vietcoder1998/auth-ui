import { SearchOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import { Dropdown, Input, List, Spin, Tag } from 'antd';
import React, { useState } from 'react';
import { adminApi } from '~/apis/admin.api.ts';
import AdminNotificationDropdown from '~/components/AdminNotificationDropdown.tsx';
import AppBackEndStatus from '~/components/AppBackEndStatus.tsx';
import StatusIndicator from '~/components/StatusIndicator.tsx';
import { useAuth } from '~/hooks/useAuth.tsx';
import AdminProfileMenu from '../components/AdminProfileMenu.tsx';
import AdminSearchDropdown from '../components/AdminSearchDropdown.tsx';
// System status fetcher
type SystemStatus = {
  api?: boolean;
  database?: boolean;
  redis?: boolean;
  memory?: string;
  cpu?: string;
  disk?: string;
  uptime?: number;
  timestamp?: string;
  cpuLoad?: number;
  os?: {
    platform?: string;
    arch?: string;
    release?: string;
    hostname?: string;
    isDocker?: boolean;
  };
  port?: string | number;
  jobs?: any[];
  childProcess?: {
    pid?: number;
    ppid?: number;
    execPath?: string;
    argv?: string[];
    cwd?: string;
    title?: string;
    platform?: string;
    version?: string;
    versions?: Record<string, any>;
    env?: Record<string, any>;
  };
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
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2, flexWrap: 'wrap' }}>
    {status.memory &&
      (() => {
        const color = getResourceColor(status.memory, 'ram');
        // Extract percent
        let percent = 0;
        const match = status.memory.match(/(\d+)%/);
        if (match) percent = parseInt(match[1], 10);
        const isHigh = percent >= 80;
        return (
          <span title="RAM">
            RAM:{' '}
            <span
              style={{
                color,
                fontWeight: isHigh ? 700 : 500,
                background: isHigh ? '#fff1f0' : undefined,
                borderRadius: isHigh ? 4 : undefined,
                padding: isHigh ? '2px 6px' : undefined,
                transition: 'background 0.2s',
              }}
            >
              {status.memory}
            </span>
          </span>
        );
      })()}
    {status.cpu &&
      (() => {
        const color = getResourceColor(status.cpu, 'cpu');
        return (
          <span title="CPU">
            CPU: <span style={{ color, fontWeight: 500 }}>{status.cpu}</span>
          </span>
        );
      })()}
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
      <span title="Disk" style={{ color: '#888' }}>
        Disk: <span style={{ color: '#888', fontWeight: 500 }}>N/A</span>
      </span>
    )}
    {/* Additional info */}
    {status.uptime !== undefined && (
      <span title="Uptime" style={{ color: '#888' }}>
        Uptime: <span style={{ fontWeight: 500 }}>{Math.floor(Number(status.uptime))}s</span>
      </span>
    )}
    {status.timestamp && (
      <span title="Timestamp" style={{ color: '#888' }}>
        Time: <span style={{ fontWeight: 500 }}>{new Date(status.timestamp).toLocaleString()}</span>
      </span>
    )}
    {status.cpuLoad !== undefined && (
      <span title="CPU Load" style={{ color: '#888' }}>
        CPU Load:{' '}
        <span style={{ fontWeight: 500 }}>
          {typeof status.cpuLoad === 'number' ? status.cpuLoad.toFixed(2) : status.cpuLoad}
        </span>
      </span>
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
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = window.innerWidth <= 768;

  // Extract extra info from systemStatus
  const isDocker = systemStatus?.os?.isDocker;
  const port = systemStatus?.port;
  const jobs = Array.isArray(systemStatus?.jobs) ? systemStatus.jobs : [];
  const processId = systemStatus?.childProcess?.pid;
  const childProcessInfo = systemStatus?.childProcess;

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

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
    <div
      style={{
        background: '#fff',
        borderBottom: '1px solid #eee',
        padding: collapsed ? (isMobile ? '6px 8px' : '8px 24px') : isMobile ? '12px 8px' : 24,
        height: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
      onClick={toggleCollapse}
    >
      {!collapsed && (
        <>
          {/* System Info Header - now using AppBackEndStatus */}
          <AppBackEndStatus status={systemStatus || undefined} />
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'stretch' : 'center',
              gap: isMobile ? 8 : 12,
              justifyContent: isMobile ? 'flex-start' : 'space-between',
              width: '100%',
              marginTop: isMobile ? 8 : 20,
            }}
          >
            <div style={{ width: isMobile ? '100%' : 'auto' }}>
              <AdminSearchDropdown
                search={search}
                setSearch={setSearch}
                searchResults={searchResults}
                searchVisible={searchVisible}
                setSearchVisible={setSearchVisible}
                searchLoading={searchLoading}
              />
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? 8 : 12,
                justifyContent: isMobile ? 'flex-end' : undefined,
                width: isMobile ? '100%' : 'auto',
                marginTop: isMobile ? 8 : 0,
              }}
            >
              <StatusIndicator />
              <AdminNotificationDropdown />
              <AdminProfileMenu user={user} />
            </div>
          </div>
        </>
      )}
      {collapsed && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <span style={{ fontSize: '12px', color: '#999' }}>Click to expand top bar</span>
          <span style={{ fontSize: '12px', color: '#999' }}>
            <DownOutlined />
          </span>
        </div>
      )}
      {!collapsed && (
        <span
          style={{
            fontSize: '12px',
            color: '#999',
            textAlign: 'right',
            marginTop: 8,
          }}
        >
          <UpOutlined />
        </span>
      )}
    </div>
  );
};

export default AdminTopBar;
