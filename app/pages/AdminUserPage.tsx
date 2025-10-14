import React, { useEffect, useState } from 'react';
import { adminApi } from '../apis/admin.api.ts';
import { Table, Input, Button, Spin } from 'antd';

export default function AdminUserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers({ search: filter });
      setUsers(res.data);
    } catch {
      setUsers([]);
    }
    setLoading(false);
  };

  const columns = [
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Nickname', dataIndex: 'nickname', key: 'nickname' },
    { title: 'Actions', key: 'actions', render: (_, u) => (
      <>
        <Button onClick={() => alert('Edit ' + u.email)}>Edit</Button>
        <Button danger onClick={() => adminApi.deleteUser(u.email).then(fetchUsers)}>Delete</Button>
      </>
    ) },
  ];

  return (
    <div>
      <h2>User Table</h2>
      <Input.Search
        placeholder="Search by email or nickname"
        value={filter}
        onChange={e => setFilter(e.target.value)}
        onSearch={fetchUsers}
        style={{ width: 300, marginBottom: 16 }}
      />
      <Button type="primary" onClick={() => alert('Show create user modal')}>Create User</Button>
      <Spin spinning={loading}>
        <Table
          dataSource={users}
          columns={columns}
          rowKey="email"
          pagination={{ pageSize: 10 }}
        />
      </Spin>
    </div>
  );
}
