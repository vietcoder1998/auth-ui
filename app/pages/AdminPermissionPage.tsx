import React, { useEffect, useState } from 'react';
import { adminApi } from '../apis/admin.api.ts';
import { Table, Button, Spin } from 'antd';

export default function AdminPermissionPage() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getPermissions();
      setPermissions(res.data.data);
    } catch {
      setPermissions([]);
    }
    setLoading(false);
  };

  interface Permission {
    id: number;
    name: string;
    [key: string]: any;
  }

  interface ColumnType {
    title: string;
    dataIndex?: string;
    key: string;
    render?: (value: any, record: Permission, index: number) => React.ReactNode;
  }

  const columns: ColumnType[] = [
    { title: 'Permission', dataIndex: 'name', key: 'name' },
    { title: 'Actions', key: 'actions', render: (_, p) => (
      <Button danger onClick={() => adminApi.deletePermission(p.id).then(fetchPermissions)}>Delete</Button>
    ) },
  ];

  return (
    <div>
      <h2>Permission Table</h2>
      <Button type="primary" onClick={() => alert('Show create permission modal')}>Create Permission</Button>
      <Spin spinning={loading}>
        <Table
          dataSource={permissions}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Spin>
    </div>
  );
}
