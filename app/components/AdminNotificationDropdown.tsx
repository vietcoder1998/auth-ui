import React, { useState } from 'react';
import { Dropdown, List, Button, Badge, Spin } from 'antd';
import { ExclamationCircleOutlined, CheckOutlined, LoadingOutlined } from '@ant-design/icons';
import {
  FixingError,
  NotificationItem,
  useUpdatePermissions,
} from '../hooks/useUpdatePermissions.ts';
import { ReloadOutlined } from '@ant-design/icons';

export default function AdminNotificationDropdown() {
  const {
    errors,
    notifOpen,
    setNotifOpen,
    dismissError,
    dismissAllErrors,
    fixPermission,
    loadingStates,
    isLoading,
  } = useUpdatePermissions();
  const [fixedIds, setFixedIds] = useState<string[]>([]);

  return (
    <Dropdown
      open={notifOpen}
      onOpenChange={setNotifOpen}
      trigger={['click']}
      popupRender={() => (
        <div
          style={{
            background: 'white',
            minWidth: 350,
            maxWidth: 500,
            boxShadow: '0 2px 8px #ccc',
            padding: 10,
            borderRadius: 8,
          }}
        >
          <List
            header={<div style={{ fontWeight: 600 }}>Notifications</div>}
            dataSource={errors}
            locale={{ emptyText: 'No notifications' }}
            style={{ maxHeight: 350, overflowY: 'auto', background: 'white' }}
            renderItem={(data: NotificationItem) => {
              const error = JSON.parse(data.errorPayload) as FixingError;
              return (
                <List.Item
                  style={{
                    background: 'white',
                    borderBottom: '1px solid #f0f0f0',
                    padding: '12px 16px',
                    display: 'block',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div
                      style={{
                        fontWeight: 500,
                        color: error.status >= 500 ? '#d4380d' : '#faad14',
                        marginBottom: 4,
                      }}
                    >
                      <ExclamationCircleOutlined style={{ marginRight: 8 }} />
                      {error.responseData.message}
                      {error.statusText && (
                        <span style={{ marginLeft: 8, color: '#888', fontWeight: 400 }}>
                          [Status: {error.statusText}]
                        </span>
                      )}
                      {error.code && (
                        <span style={{ marginLeft: 8, color: '#888', fontWeight: 400 }}>
                          [Code: {error.code}]
                        </span>
                      )}
                    </div>
                    {error.responseData && (
                      <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>
                        {typeof error.responseData === 'string'
                          ? error.responseData
                          : Object.keys(error.responseData).length > 0
                            ? Object.entries(error.responseData)
                                .map(
                                  ([key, value]) =>
                                    `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`
                                )
                                .join(' | ')
                            : null}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      {fixedIds.includes(data.id) ? (
                        <Button
                          size="small"
                          type="text"
                          disabled
                          icon={<CheckOutlined />}
                          style={{ color: 'green' }}
                        >
                          Fixed
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          type="link"
                          icon={isLoading(data.id) ? <LoadingOutlined /> : <ReloadOutlined />}
                          loading={isLoading(data.id)}
                          disabled={isLoading(data.id)}
                          onClick={async () => {
                            await fixPermission(data.id, error, dismissError);
                            setFixedIds((ids) => [...ids, data.id]);
                            setTimeout(() => {
                              setFixedIds((ids) => ids.filter((id) => id !== data.id));
                              dismissError(data.id);
                            }, 5000);
                          }}
                          key="fix"
                        >
                          {isLoading(data.id) ? 'Fixing...' : 'Fix'}
                        </Button>
                      )}
                      <Button
                        size="small"
                        type="text"
                        onClick={() => dismissError(data.id)}
                        disabled={isLoading(data.id)}
                        key="close"
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </List.Item>
              );
            }}
          />
          {errors.length > 1 && (
            <div
              style={{
                textAlign: 'right',
                padding: '8px 16px',
                display: 'flex',
                gap: 8,
                justifyContent: 'flex-end',
              }}
            >
              <Button
                size="small"
                type="link"
                onClick={dismissAllErrors}
                style={{ fontSize: '11px' }}
              >
                Dismiss All
              </Button>
              <Button
                size="small"
                type="primary"
                style={{ fontSize: '11px' }}
                icon={Object.values(loadingStates).some(Boolean) ? <LoadingOutlined /> : undefined}
                disabled={Object.values(loadingStates).some(Boolean)}
                onClick={async () => {
                  for (const data of errors) {
                    const error = JSON.parse(data.errorPayload);
                    await fixPermission(data.id, error, dismissError);
                    setFixedIds((ids) => [...ids, data.id]);
                    setTimeout(() => {
                      setFixedIds((ids) => ids.filter((id) => id !== data.id));
                      dismissError(data.id);
                    }, 5000);
                  }
                }}
              >
                {Object.values(loadingStates).some(Boolean) ? 'Resolving...' : 'Resolve All'}
              </Button>
            </div>
          )}
        </div>
      )}
    >
      <Badge count={errors.length} size="small" offset={[0, 0]}>
        <Button
          type="text"
          icon={
            <ExclamationCircleOutlined
              style={{ fontSize: 22, color: errors.length ? '#d4380d' : '#aaa' }}
            />
          }
          style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}
          onClick={() => setNotifOpen(!notifOpen)}
        />
      </Badge>
    </Dropdown>
  );
}
