import { CheckCircleOutlined, ExclamationCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { Badge, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import { adminApi } from '../apis/admin.api.ts';

interface StatusIndicatorProps {
  className?: string;
}

interface SystemStatus {
  api: 'online' | 'offline' | 'checking';
  database: 'online' | 'offline' | 'checking';
  redis: 'online' | 'offline' | 'checking';
  lastCheck: Date;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ className }) => {
  const [status, setStatus] = useState<SystemStatus>({
    api: 'checking',
    database: 'checking',
    redis: 'checking',
    lastCheck: new Date(),
  });

  const checkSystemStatus = async () => {
    try {
      setStatus(prev => ({
        ...prev,
        api: 'checking',
        database: 'checking',
        redis: 'checking',
      }));

      // Use adminApi for health check
      const response = await adminApi.getHealthStatus();
      const healthData = response.data.data;
      setStatus({
        api: healthData.api ? 'online' : 'offline',
        database: healthData.database ? 'online' : 'offline',
        redis: healthData.redis ? 'online' : 'offline',
        lastCheck: new Date(),
      });
    } catch (error) {
      setStatus({
        api: 'offline',
        database: 'offline',
        redis: 'offline',
        lastCheck: new Date(),
      });
    }
  };

  useEffect(() => {
    // Initial check
    checkSystemStatus();

    // Check every 30 seconds
    const interval = setInterval(checkSystemStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (componentStatus: 'online' | 'offline' | 'checking') => {
    switch (componentStatus) {
      case 'online':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'offline':
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'checking':
        return <LoadingOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const getOverallStatus = () => {
    if (status.api === 'checking' || status.database === 'checking' || status.redis === 'checking') {
      return 'processing';
    }
    if (status.api === 'online' && status.database === 'online' && status.redis === 'online') {
      return 'success';
    }
    if (status.api === 'offline') {
      return 'error';
    }
    return 'warning';
  };

  const getStatusText = () => {
    const onlineCount = [status.api, status.database, status.redis].filter(s => s === 'online').length;
    const totalCount = 3;

    if (status.api === 'checking') {
      return 'Checking...';
    }

    return `${onlineCount}/${totalCount} Services Online`;
  };

  return (
    <Tooltip
      title={
        <div>
          <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>System Status</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>API:</span>
              {getStatusIcon(status.api)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Database:</span>
              {getStatusIcon(status.database)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Redis:</span>
              {getStatusIcon(status.redis)}
            </div>
          </div>
          <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.8 }}>
            Last check: {status.lastCheck.toLocaleTimeString()}
          </div>
        </div>
      }
      placement="bottomRight"
    >
      <div className={className} style={{ cursor: 'pointer' }} onClick={checkSystemStatus}>
        <Badge
          status={getOverallStatus()}
          text={getStatusText()}
          style={{ fontSize: '12px' }}
        />
      </div>
    </Tooltip>
  );
};

export default StatusIndicator;