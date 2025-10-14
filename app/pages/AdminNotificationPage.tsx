import { Button, Spin, Table } from 'antd';
import React, { useEffect, useState } from 'react';
import { adminApi } from '../apis/admin.api.ts';

export default function AdminNotificationPage() {
  const [notificationTemplates, setNotificationTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotificationTemplates();
  }, []);

  const fetchNotificationTemplates = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getNotificationTemplates();
      setNotificationTemplates(res.data.data);
    } catch {
      setNotificationTemplates([]);
    }
    setLoading(false);
  };

  interface NotificationTemplate {
    id: number;
    name: string;
    title: string;
    body: string;
    active: boolean;
  }

  interface ColumnType {
    title: string;
    dataIndex?: keyof NotificationTemplate;
    key: string;
    render?: (value: any, record?: NotificationTemplate) => React.ReactNode;
  }

  const columns: ColumnType[] = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Body', dataIndex: 'body', key: 'body' },
    { title: 'Active', dataIndex: 'active', key: 'active', render: v => v ? 'Yes' : 'No' },
    {
      title: 'Actions', key: 'actions', render: (_, t) => (
        <Button danger onClick={() => adminApi.deleteNotificationTemplate(t!.id).then(fetchNotificationTemplates)}>Delete</Button>
      )
    },
  ];

  return (
    <div>
      <h2>Notification Template Table</h2>
      <Button type="primary" onClick={() => alert('Show create notification template modal')}>Create Notification Template</Button>
      <Spin spinning={loading}>
        <Table
          dataSource={notificationTemplates}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Spin>
    </div>
  );
}
