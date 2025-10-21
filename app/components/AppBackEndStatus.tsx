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
          gap: 6,
          flexWrap: 'wrap',
          marginBottom: 2,
        }}
      >
        <div
          style={{
            padding: '1px 6px',
            fontSize: 11,
            background: 'transparent',
            borderRadius: 3,
          }}
        >
          Docker: {isDocker ? 'Yes' : 'No'}
        </div>
        <div
          style={{
            padding: '1px 6px',
            fontSize: 11,
            background: 'transparent',
            borderRadius: 3,
          }}
        >
          Port: {port || 'N/A'}
        </div>
        <a
          href="https://rabbitmq.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'underline', color: 'inherit', background: 'transparent' }}
        >
          <div
            style={{
              padding: '1px 6px',
              fontSize: 11,
              background: 'transparent',
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            Jobs: {jobs.length} <LinkOutlined style={{ fontSize: 12 }} />
          </div>
        </a>
        <div
          style={{
            padding: '1px 6px',
            fontSize: 11,
            background: 'transparent',
            borderRadius: 3,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 3,
          }}
          title="Kill and restart process"
          onClick={handleRestartProcess}
        >
          Process ID: {processId || 'N/A'} <PoweroffOutlined style={{ fontSize: 12 }} />
        </div>
        {childProcessInfo && (
          <Tooltip
            title={`Title: ${childProcessInfo.title}, ExecPath: ${childProcessInfo.execPath}`}
          >
            <div
              style={{
                padding: '1px 6px',
                fontSize: 11,
                color: '#888',
                background: '#fafafa',
                borderRadius: 3,
              }}
            >
              Child Process: PID {childProcessInfo.pid}
            </div>
          </Tooltip>
        )}
      </div>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap', marginTop: 0 }}
      >
        <div
          style={{
            padding: '1px 6px',
            fontSize: 11,
            color: status.api ? '#52c41a' : '#d4380d',
            background: 'transparent',
            borderRadius: 3,
          }}
        >
          API: {status.api ? 'Online' : 'Offline'}
        </div>
        <div
          style={{
            padding: '1px 6px',
            fontSize: 11,
            color: status.database ? '#52c41a' : '#d4380d',
            background: 'transparent',
            borderRadius: 3,
          }}
        >
          DB: {status.database ? 'Online' : 'Offline'}
        </div>
        <div
          style={{
            padding: '1px 6px',
            fontSize: 11,
            color: status.redis ? '#52c41a' : '#d4380d',
            background: 'transparent',
            borderRadius: 3,
          }}
        >
          Redis: {status.redis ? 'Online' : 'Offline'}
        </div>
        <div
          style={{
            padding: '1px 6px',
            fontSize: 11,
            background: 'transparent',
            borderRadius: 3,
          }}
        >
          Uptime: {status.uptime ? Math.floor(Number(status.uptime)) + 's' : 'N/A'}
        </div>
        <div
          style={{
            padding: '1px 6px',
            fontSize: 11,
            background: 'transparent',
            borderRadius: 3,
          }}
        >
          Memory: {status.memory || 'N/A'}
        </div>
        <div
          style={{
            padding: '1px 6px',
            fontSize: 11,
            background: 'transparent',
            borderRadius: 3,
          }}
        >
          CPU: {status.cpu || 'N/A'}
        </div>
        <div
          style={{
            padding: '1px 6px',
            fontSize: 11,
            background: 'transparent',
            borderRadius: 3,
          }}
        >
          Disk: {status.disk || 'N/A'}
        </div>
      </div>
    </div>
  );
};

export default AppBackEndStatus;
