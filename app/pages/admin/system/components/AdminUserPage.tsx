import { DeleteOutlined, EditOutlined, LoginOutlined, PlusOutlined } from '@ant-design/icons';
import { Alert, Button, Space, Spin, Table } from 'antd';
import React, { useEffect, useState } from 'react';
import { adminApi } from '../../../../apis/admin.api.ts';
import CommonSearch from '../../../../components/CommonSearch.tsx';
import AddUserModal from '../../../blog/modals/AddUserModal.tsx';
import AdminEditUserModal from '../../../blog/modals/AdminEditUserModal.tsx';

export default function AdminUserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [openWindows, setOpenWindows] = useState<{ [key: string]: Window | null }>({});
  const [roles, setRoles] = useState<Array<{ name: string; id: string }>>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Cleanup effect to track window states
  useEffect(() => {
    const interval = setInterval(() => {
      setOpenWindows((prev) => {
        const updated = { ...prev };
        let hasChanges = false;

        Object.entries(prev).forEach(([key, window]) => {
          if (window && window.closed) {
            delete updated[key];
            hasChanges = true;
          }
        });

        return hasChanges ? updated : prev;
      });
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, []);

  // Cleanup on unmount - close all open windows
  useEffect(() => {
    return () => {
      Object.values(openWindows).forEach((window) => {
        if (window && !window.closed) {
          window.close();
        }
      });
    };
  }, [openWindows]);

  useEffect(() => {
    adminApi.getRoles().then((res) => {
      setRoles(res.data.data || []);
    });
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers({ search: filter });
      setUsers(res.data.data);
    } catch {
      setUsers([]);
    }
    setLoading(false);
  };

  const handleLoginAsUser = async (email: string, nickname: string) => {
    const windowKey = email; // Use email as unique key for the window

    // Check if window is already open for this user
    const existingWindow = openWindows[windowKey];
    if (existingWindow && !existingWindow.closed) {
      // If window exists and is not closed, focus it and close it first
      existingWindow.focus();
      existingWindow.close();

      // Remove from tracking
      setOpenWindows((prev) => {
        const updated = { ...prev };
        delete updated[windowKey];
        return updated;
      });

      // Wait a bit before opening new window
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    if (
      !window.confirm(
        `Login as "${nickname}" (${email})?\n\nThis will open a new window with user authentication.`
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      const response = await adminApi.loginAsUser(email);

      if (response.data.success) {
        const token = response.data.data.token || response.data.data.accessToken;

        if (token) {
          // Create validation URL with token
          const validationUrl = `/token-validation?token=${encodeURIComponent(token)}`;

          // Open new window for token validation
          const newWindow = window.open(
            validationUrl,
            `user_session_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
            'width=800,height=600,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no'
          );

          if (newWindow) {
            // Track the opened window
            setOpenWindows((prev) => ({
              ...prev,
              [windowKey]: newWindow,
            }));

            // Focus the new window
            newWindow.focus();

            // Optional: Monitor window close event
            const checkWindowClosed = setInterval(() => {
              if (newWindow.closed) {
                setOpenWindows((prev) => {
                  const updated = { ...prev };
                  delete updated[windowKey];
                  return updated;
                });
                clearInterval(checkWindowClosed);
              }
            }, 1000);

            console.log(`Opened impersonation window for ${nickname} (${email})`);
          } else {
            throw new Error('Failed to open new window. Please check popup blocker settings.');
          }
        } else {
          throw new Error('No token received from login response');
        }
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Error logging in as user:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to login as user';
      alert(`Login failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditModalVisible(true);
  };

  const handleEditUserSave = async (updated: any) => {
    if (!editingUser) return;
    await adminApi.updateUser(editingUser.id, updated);
    setEditModalVisible(false);
    setEditingUser(null);
    fetchUsers();
  };

  interface User {
    email: string;
    nickname: string;
    [key: string]: any;
  }

  interface Column {
    title: string;
    dataIndex?: string | string[];
    key: string;
    width?: number;
    render?: (value: any, record: User, index: number) => React.ReactNode;
  }

  const columns: Column[] = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => <strong>{email}</strong>,
    },
    {
      title: 'Display Name',
      dataIndex: 'nickname',
      key: 'nickname',
    },
    {
      title: 'Role',
      dataIndex: ['role', 'name'],
      key: 'role',
      render: (roleName: string) => roleName || <em style={{ color: '#999' }}>No role</em>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors = {
          active: 'green',
          inactive: 'red',
          pending: 'orange',
        };
        return (
          <span
            style={{
              color: colors[status as keyof typeof colors] || '#666',
              fontWeight: 'bold',
              textTransform: 'capitalize',
            }}
          >
            {status || 'unknown'}
          </span>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 220,
      render: (_: any, u: User) => {
        const windowKey = u.email;
        const hasOpenWindow = openWindows[windowKey] && !openWindows[windowKey]?.closed;

        return (
          <Space size="small">
            <Button
              size="small"
              type={hasOpenWindow ? 'default' : 'primary'}
              ghost={!hasOpenWindow}
              icon={<LoginOutlined />}
              onClick={() => handleLoginAsUser(u.email, u.nickname)}
              title={
                hasOpenWindow
                  ? 'Close current window and open new session'
                  : 'Login as this user in new window'
              }
              style={{
                borderColor: hasOpenWindow ? '#fa8c16' : undefined,
                color: hasOpenWindow ? '#fa8c16' : undefined,
              }}
            >
              {hasOpenWindow ? 'Reopen' : 'Login As'}
            </Button>
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditUser(u)}
              title="Edit user"
            >
              Edit
            </Button>
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete user ${u.email}?`)) {
                  adminApi.deleteUser(u.email).then(fetchUsers);
                }
              }}
              title="Delete user"
            >
              Delete
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{}}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '16px' }}>User Management</h2>

        <Alert
          message="Admin Impersonation Feature"
          description="Use 'Login As' to impersonate any user in a new window for testing or support purposes. The new window will validate the user token and redirect to the main application. If a window is already open for a user, clicking 'Reopen' will close the current window and open a fresh session."
          type="info"
          showIcon
          closable
          style={{ marginBottom: '16px' }}
        />

        <CommonSearch
          searchPlaceholder="Search by email or nickname"
          searchValue={filter}
          onSearch={(value) => {
            setFilter(value);
            fetchUsers();
          }}
          onRefresh={fetchUsers}
          loading={loading}
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalVisible(true)}>
              Add User
            </Button>
          }
          style={{ marginBottom: '16px' }}
        />
      </div>

      <Spin spinning={loading}>
        <Table
          dataSource={users}
          columns={columns}
          rowKey="email"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
          }}
          style={{ backgroundColor: 'white', borderRadius: '8px' }}
        />
      </Spin>

      <AddUserModal
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onSuccess={fetchUsers}
      />
      <AdminEditUserModal
        visible={editModalVisible}
        user={editingUser}
        roles={roles}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingUser(null);
        }}
        onSave={handleEditUserSave}
      />
    </div>
  );
}
