import { ExclamationCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { Badge, Button, Dropdown, List } from 'antd';
import { useUpdatePermissions } from '../hooks/useUpdatePermissions.ts';

export default function AdminNotificationDropdown() {
  const { errors, notifOpen, setNotifOpen, dismissError, dismissAllErrors, fixPermission } =
    useUpdatePermissions();

  return (
    <Dropdown
      open={notifOpen}
      onOpenChange={setNotifOpen}
      trigger={['click']}
      dropdownRender={() => (
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
            renderItem={(error) => (
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
                    {error.message}
                  </div>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>
                    {error.details && typeof error.details === 'string'
                      ? error.details
                      : error.details && JSON.stringify(error.details)}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <Button
                      size="small"
                      type="link"
                      icon={<ReloadOutlined />}
                      onClick={() => (fixPermission as any)?.(error)}
                      key="fix"
                    >
                      Fix
                    </Button>
                    <Button
                      size="small"
                      type="text"
                      onClick={() => dismissError(error.id)}
                      key="close"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </List.Item>
            )}
          />
          {errors.length > 1 && (
            <div style={{ textAlign: 'right', padding: '8px 16px' }}>
              <Button
                size="small"
                type="link"
                onClick={dismissAllErrors}
                style={{ fontSize: '11px' }}
              >
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
