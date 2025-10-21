import { Tooltip, message } from 'antd';
import { SyncOutlined, LinkOutlined, PoweroffOutlined } from '@ant-design/icons';
import React from 'react';
import { adminApi } from '~/apis/admin.api.ts';

export interface AppBackEndStatusProps {
  status?: {
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
}

const AppBackEndStatus: React.FC<AppBackEndStatusProps> = ({ status }) => {
  if (!status) return <span style={{ color: '#888' }}>No backend status available.</span>;
  const isDocker = status.os?.isDocker;
  const port = status.port;
  const jobs = Array.isArray(status.jobs) ? status.jobs : [];
  const processId = status.childProcess?.pid;
  const childProcessInfo = status.childProcess;

  // Handler for process restart (simulate API call)
  const handleRestartProcess = async () => {
    if (window.confirm('Are you sure you want to restart the backend process?')) {
      try {
        await adminApi.restartServer?.();
        message.success('Restart request sent. The server will restart if supported.');
      } catch (err) {
        message.error('Failed to send restart request.');
      }
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 0,
        fontSize: 13,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexWrap: 'wrap',
          marginBottom: 2,
        }}
      >
        <div
          style={{
            padding: '2px 8px',
            fontSize: 12,
            color: isDocker ? '#52c41a' : '#d4380d',
            background: '#f6ffed',
            borderRadius: 4,
          }}
        >
          Docker: {isDocker ? 'Yes' : 'No'}
        </div>
        <div
          style={{
            padding: '2px 8px',
            fontSize: 12,
            color: '#1890ff',
            background: '#e6f7ff',
            borderRadius: 4,
          }}
        >
          Port: {port || 'N/A'}
        </div>
        <a
          href="https://rabbitmq.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none' }}
        >
          <div
            style={{
              padding: '2px 8px',
              fontSize: 12,
              color: '#faad14',
              background: '#fffbe6',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            Jobs: {jobs.length} <LinkOutlined />
          </div>
        </a>
        <div
          style={{
            padding: '2px 8px',
            fontSize: 12,
            color: '#1890ff',
            background: '#e6f7ff',
            borderRadius: 4,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
          title="Kill and restart process"
          onClick={handleRestartProcess}
        >
          Process ID: {processId || 'N/A'} <PoweroffOutlined />
        </div>
        {childProcessInfo && (
          <Tooltip
            title={`Title: ${childProcessInfo.title}, ExecPath: ${childProcessInfo.execPath}`}
          >
            <div
              style={{
                padding: '2px 8px',
                fontSize: 12,
                color: '#888',
                background: '#fafafa',
                borderRadius: 4,
              }}
            >
              Child Process: PID {childProcessInfo.pid}
            </div>
          </Tooltip>
        )}
      </div>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 0 }}
      >
        <div
          style={{
            padding: '2px 8px',
            fontSize: 12,
            color: status.api ? '#52c41a' : '#d4380d',
            background: status.api ? '#f6ffed' : '#fff1f0',
            borderRadius: 4,
          }}
        >
          API: {status.api ? 'Online' : 'Offline'}
        </div>
        <div
          style={{
            padding: '2px 8px',
            fontSize: 12,
            color: status.database ? '#52c41a' : '#d4380d',
            background: status.database ? '#f6ffed' : '#fff1f0',
            borderRadius: 4,
          }}
        >
          DB: {status.database ? 'Online' : 'Offline'}
        </div>
        <div
          style={{
            padding: '2px 8px',
            fontSize: 12,
            color: status.redis ? '#52c41a' : '#d4380d',
            background: status.redis ? '#f6ffed' : '#fff1f0',
            borderRadius: 4,
          }}
        >
          Redis: {status.redis ? 'Online' : 'Offline'}
        </div>
        <div
          style={{
            padding: '2px 8px',
            fontSize: 12,
            color: '#722ed1',
            background: '#f9f0ff',
            borderRadius: 4,
          }}
        >
          Uptime: {status.uptime ? Math.floor(Number(status.uptime)) + 's' : 'N/A'}
        </div>
        <div
          style={{
            padding: '2px 8px',
            fontSize: 12,
            color: '#13c2c2',
            background: '#e6fffb',
            borderRadius: 4,
          }}
        >
          Memory: {status.memory || 'N/A'}
        </div>
        <div
          style={{
            padding: '2px 8px',
            fontSize: 12,
            color: '#eb2f96',
            background: '#fff0f6',
            borderRadius: 4,
          }}
        >
          CPU: {status.cpu || 'N/A'}
        </div>
        <div
          style={{
            padding: '2px 8px',
            fontSize: 12,
            color: '#fa541c',
            background: '#fff2e8',
            borderRadius: 4,
          }}
        >
          Disk: {status.disk || 'N/A'}
        </div>
      </div>
    </div>
  );
};

export default AppBackEndStatus;
