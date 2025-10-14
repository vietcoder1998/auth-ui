import { Button, Spin, Table } from 'antd';
import React, { useEffect, useState } from 'react';
import { adminApi } from '../apis/admin.api.ts';

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
      setMailTemplates(res.data.data);
    } catch {
      setMailTemplates([]);
    }
    setLoading(false);
  };

  interface MailTemplate {
    id: number;
    name: string;
    subject: string;
    body: string;
    active: boolean;
  }

  interface ColumnType {
    title: string;
    dataIndex?: keyof MailTemplate;
    key: string;
    render?: (value: any, record: MailTemplate) => React.ReactNode;
  }

  const columns: ColumnType[] = [
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
