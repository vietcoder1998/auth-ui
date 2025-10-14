import React, { useEffect, useState } from 'react';
import { adminApi } from '../apis/admin.api.ts';
import { Table, Input, Button, Spin, Space } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import AddUserModal from './modals/AddUserModal.tsx';

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

  interface User {
    email: string;
    nickname: string;
    [key: string]: any;
  }

  interface Column {
    title: string;
    dataIndex?: string;
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
      title: 'Actions', 
      key: 'actions',
      width: 150,
      render: (_: any, u: User) => (
        <Space size="small">
          <Button 
            size="small" 
            onClick={() => alert('Edit ' + u.email)}
          >
            Edit
          </Button>
          <Button 
            size="small"
            danger 
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete user ${u.email}?`)) {
                adminApi.deleteUser(u.email).then(fetchUsers);
              }
            }}
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
