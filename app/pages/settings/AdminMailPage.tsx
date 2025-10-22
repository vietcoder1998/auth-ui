import { Button, ConfigProvider, Input, Modal, Spin, Table, Typography, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { RichText } from '../../lib/RichText.tsx';
import CommonSearch from '../../components/CommonSearch.tsx';
import { adminApi } from '../../apis/admin.api.ts';

export default function AdminMailPage() {
  const [mailTemplates, setMailTemplates] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<any | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchMailTemplates();
  }, []);

  const fetchMailTemplates = async (search?: string) => {
    setLoading(true);
    try {
      const res = await adminApi.getMailTemplates(search);
      setMailTemplates(res.data.data);
    } catch {
      setMailTemplates([]);
    }
    setLoading(false);
  };
  const handleSearch = (value: string) => {
    setSearchValue(value);
    fetchMailTemplates(value);
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

  const handleEdit = (template: MailTemplate) => {
    setEditTemplate({ ...template });
    setEditModalOpen(true);
  };

  const handleEditSave = async () => {
    setEditLoading(true);
    try {
      await adminApi.updateMailTemplate(editTemplate.id, editTemplate);
      setEditModalOpen(false);
      setEditTemplate(null);
      fetchMailTemplates();
    } catch {
      // handle error
    }
    setEditLoading(false);
  };

  const columns: ColumnType[] = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Subject', dataIndex: 'subject', key: 'subject' },
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
            title="Are you sure to delete this mail template?"
            onConfirm={() =>
              adminApi.deleteMailTemplate(t!.id).then(() => fetchMailTemplates(searchValue))
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
    <ConfigProvider theme={{ token: { colorPrimary: '#1677ff' } }}>
      <Typography.Title level={3} style={{ marginBottom: 16 }}>
        Mail Template Table
      </Typography.Title>
      <CommonSearch
        searchPlaceholder="Search mail templates..."
        searchValue={searchValue}
        onSearch={handleSearch}
        style={{ marginBottom: 16 }}
      />
      <Button
        type="primary"
        onClick={() => alert('Show create mail template modal')}
        style={{ marginBottom: 16 }}
      >
        Create Mail Template
      </Button>
      <Spin spinning={loading}>
        <Table
          dataSource={mailTemplates}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Spin>

      <Modal
        title="Edit Mail Template"
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
              value={editTemplate.subject}
              onChange={(e) => setEditTemplate({ ...editTemplate, subject: e.target.value })}
              placeholder="Subject"
              style={{ marginBottom: 12 }}
            />
            <RichText
              value={editTemplate.body}
              onChange={(val: any) => setEditTemplate({ ...editTemplate, body: val })}
              style={{ minHeight: 200, marginBottom: 12 }}
            />
          </div>
        )}
      </Modal>
    </ConfigProvider>
  );
}
