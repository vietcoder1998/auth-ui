import React, { useEffect, useState } from 'react';
import { adminApi } from '../../apis/admin.api.ts';
import { Table, Input, Button, Spin, Space, Alert } from 'antd';
import { PlusOutlined, ReloadOutlined, LoginOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AddUserModal from '../modals/AddUserModal.tsx';

export default function AdminUserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [addModalVisible, setAddModalVisible] = useState(false);

  useEffect(() => {
    fetchUsers();
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
    if (!window.confirm(`Login as "${nickname}" (${email})?\n\nThis will log you out of your admin session and log you in as this user.`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await adminApi.loginAsUser(email);
      
      if (response.data.success) {
        // Store the new token
        const token = response.data.data.token || response.data.data.accessToken;
        if (token) {
          localStorage.setItem('token', token);
          localStorage.setItem('userEmail', email);
          localStorage.setItem('userNickname', nickname);
          
          // Show success message and redirect
          alert(`Successfully logged in as ${nickname}!\n\nRedirecting to dashboard...`);
          
          // Redirect to main dashboard or user area
          window.location.href = '/dashboard'; // Adjust this to your app's main user area
        } else {
          throw new Error('No token received');
        }
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Error logging in as user:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to login as user';
      alert(`Login failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
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
      render: (email: string) => <strong>{email}</strong>
    },
    { 
      title: 'Display Name', 
      dataIndex: 'nickname', 
      key: 'nickname' 
    },
    { 
      title: 'Role', 
      dataIndex: ['role', 'name'], 
      key: 'role',
      render: (roleName: string) => roleName || <em style={{ color: '#999' }}>No role</em>
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => {
        const colors = {
          active: 'green',
          inactive: 'red',
          pending: 'orange'
        };
        return (
          <span style={{ 
            color: colors[status as keyof typeof colors] || '#666',
            fontWeight: 'bold',
            textTransform: 'capitalize'
          }}>
            {status || 'unknown'}
          </span>
        );
      }
    },
    { 
      title: 'Actions', 
      key: 'actions',
      width: 220,
      render: (_: any, u: User) => (
        <Space size="small">
          <Button 
            size="small"
            type="primary"
            ghost
            icon={<LoginOutlined />}
            onClick={() => handleLoginAsUser(u.email, u.nickname)}
            title="Login as this user"
          >
            Login As
          </Button>
          <Button 
            size="small"
            icon={<EditOutlined />}
            onClick={() => alert('Edit ' + u.email)}
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
      ) 
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '16px' }}>User Management</h2>
        
        <Alert
          message="Admin Impersonation Feature"
          description="Use 'Login As' to impersonate any user for testing or support purposes. This will log you out of your admin session."
          type="info"
          showIcon
          closable
          style={{ marginBottom: '16px' }}
        />
        
        <Space style={{ marginBottom: '16px', width: '100%', justifyContent: 'space-between' }}>
          <Input.Search
            placeholder="Search by email or nickname"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            onSearch={fetchUsers}
            style={{ width: 300 }}
            allowClear
          />
          
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchUsers}
              loading={loading}
            >
              Refresh
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setAddModalVisible(true)}
            >
              Add User
            </Button>
          </Space>
        </Space>
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
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`
          }}
          style={{ backgroundColor: 'white', borderRadius: '8px' }}
        />
      </Spin>

      <AddUserModal
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onSuccess={fetchUsers}
      />
    </div>
  );
}
