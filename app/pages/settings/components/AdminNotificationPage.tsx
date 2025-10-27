import { Button, Spin, Table, Modal, Input, Typography, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { RichText } from '../../../lib/RichText.tsx';
import CommonSearch from '../../../components/CommonSearch.tsx';
import React, { useEffect, useState } from 'react';
import { adminApi } from '../../../apis/admin.api.ts';

export default function AdminNotificationPage() {
  const [notificationTemplates, setNotificationTemplates] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<any | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const handleEdit = (template: NotificationTemplate) => {
    setEditTemplate({ ...template });
    setEditModalOpen(true);
  };

  const handleEditSave = async () => {
    setEditLoading(true);
    try {
      await adminApi.updateNotificationTemplate(editTemplate.id, editTemplate);
      setEditModalOpen(false);
      setEditTemplate(null);
      fetchNotificationTemplates();
    } catch {
      // handle error
    }
    setEditLoading(false);
  };

  useEffect(() => {
    fetchNotificationTemplates();
  }, []);

  const fetchNotificationTemplates = async (search?: string) => {
    setLoading(true);
    try {
      const res = await adminApi.getNotificationTemplates(search);
      setNotificationTemplates(res.data.data);
    } catch {
      setNotificationTemplates([]);
    }
    setLoading(false);
  };
  const handleSearch = (value: string) => {
    setSearchValue(value);
    fetchNotificationTemplates(value);
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
    {
      title: 'Body',
      dataIndex: 'body',
      key: 'body',
      render: (v) => <div dangerouslySetInnerHTML={{ __html: v }} />,
    },
    { title: 'Active', dataIndex: 'active', key: 'active', render: (v) => (v ? 'Yes' : 'No') },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, t) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button icon={<EditOutlined />} type="text" onClick={() => handleEdit(t!)} title="Edit" />
          <Popconfirm
            title="Are you sure to delete this notification template?"
            onConfirm={() =>
              adminApi
                .deleteNotificationTemplate(t!.id)
                .then(() => fetchNotificationTemplates(searchValue))
            }
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} type="text" danger title="Delete" />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Typography.Title level={3} style={{ marginBottom: 16 }}>
        Notification Template Table
      </Typography.Title>
      <CommonSearch
        searchPlaceholder="Search notification templates..."
        searchValue={searchValue}
        onSearch={handleSearch}
        style={{ marginBottom: 16 }}
      />
      <Button
        type="primary"
        onClick={() => alert('Show create notification template modal')}
        style={{ marginBottom: 16 }}
      >
        Create Notification Template
      </Button>
      <Spin spinning={loading}>
        <Table
          dataSource={notificationTemplates}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Spin>

      <Modal
        title="Edit Notification Template"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={handleEditSave}
        confirmLoading={editLoading}
      >
        {editTemplate && (
          <div className="space-y-4">
            <Input
              value={editTemplate.name}
              onChange={(e) => setEditTemplate({ ...editTemplate, name: e.target.value })}
              placeholder="Name"
              style={{ marginBottom: 12 }}
            />
            <Input
              value={editTemplate.title}
              onChange={(e) => setEditTemplate({ ...editTemplate, title: e.target.value })}
              placeholder="Title"
              style={{ marginBottom: 12 }}
            />
            <RichText
              value={editTemplate.body}
              onChange={(val) => setEditTemplate({ ...editTemplate, body: val })}
              style={{ minHeight: 200, marginBottom: 12 }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
