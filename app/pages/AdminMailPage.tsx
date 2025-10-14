import React, { useEffect, useState } from 'react';
import { adminApi } from '../apis/admin.api.ts';
import { Table, Button, Spin } from 'antd';

export default function AdminMailPage() {
  const [mailTemplates, setMailTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMailTemplates();
  }, []);

  const fetchMailTemplates = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getMailTemplates();
      setMailTemplates(res.data);
    } catch {
      setMailTemplates([]);
    }
    setLoading(false);
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Subject', dataIndex: 'subject', key: 'subject' },
    { title: 'Body', dataIndex: 'body', key: 'body' },
    { title: 'Active', dataIndex: 'active', key: 'active', render: v => v ? 'Yes' : 'No' },
    { title: 'Actions', key: 'actions', render: (_, t) => (
      <Button danger onClick={() => adminApi.deleteMailTemplate(t.id).then(fetchMailTemplates)}>Delete</Button>
    ) },
  ];

  return (
    <div>
      <h2>Mail Template Table</h2>
      <Button type="primary" onClick={() => alert('Show create mail template modal')}>Create Mail Template</Button>
      <Spin spinning={loading}>
        <Table
          dataSource={mailTemplates}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Spin>
    </div>
  );
}
