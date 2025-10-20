import { Button, ConfigProvider, Input, Modal, Spin, Table } from 'antd';
import React, { useEffect, useState } from 'react';
import { RichText } from '../../lib/RichText.tsx';
import { adminApi } from '../../apis/admin.api.ts';

export default function AdminMailPage() {
  const [mailTemplates, setMailTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<any | null>(null);
  const [editLoading, setEditLoading] = useState(false);

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
        <>
          <Button onClick={() => handleEdit(t)} style={{ marginRight: 8 }}>
            Edit
          </Button>
          <Button danger onClick={() => adminApi.deleteMailTemplate(t.id).then(fetchMailTemplates)}>
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#1677ff' } }}>
      <h2>Mail Template Table</h2>
      <Button type="primary" onClick={() => alert('Show create mail template modal')}>
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
