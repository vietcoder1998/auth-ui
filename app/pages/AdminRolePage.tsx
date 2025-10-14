import React, { useEffect, useState } from 'react';
import { adminApi } from '../apis/admin.api.ts';
import { Table, Button, Spin } from 'antd';

export default function AdminRolePage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getRoles();
      setRoles(res.data);
    } catch {
      setRoles([]);
    }
    setLoading(false);
  };

  const columns = [
    { title: 'Role', dataIndex: 'name', key: 'name' },
    { title: 'Actions', key: 'actions', render: (_, r) => (
      <Button danger onClick={() => adminApi.deleteRole(r.id).then(fetchRoles)}>Delete</Button>
    ) },
  ];

  return (
    <div>
      <h2>Role Table</h2>
      <Button type="primary" onClick={() => alert('Show create role modal')}>Create Role</Button>
      <Spin spinning={loading}>
        <Table
          dataSource={roles}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Spin>
    </div>
  );
}
