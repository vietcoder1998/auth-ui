import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Modal, Spin, message, Popconfirm } from 'antd';
import { getApiInstance } from '../../apis/index.ts';

export default function AdminFaqMenu() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const axios = getApiInstance();
      const res = await axios.get('/admin/faqs');
      setFaqs(res.data.data || []);
    } catch (error) {
      message.error('Failed to load FAQs');
      setFaqs([]);
    }
    setLoading(false);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Delete FAQ',
      content: 'Are you sure you want to delete this FAQ?',
      okType: 'danger',
      onOk: async () => {
        const axios = getApiInstance();
        await axios.delete(`/admin/faqs/${id}`);
        fetchFaqs();
      },
    });
  };

  const columns = [
    { title: 'Question', dataIndex: 'question', key: 'question', render: (q: string) => <pre>{q}</pre> },
    { title: 'Answer', dataIndex: 'answer', key: 'answer', render: (a: string) => <pre>{a}</pre> },
    { title: 'Type', dataIndex: 'type', key: 'type', render: (t: string) => <Tag color="blue">{t}</Tag> },
    { title: 'Created', dataIndex: 'createdAt', key: 'createdAt', render: (d: string) => new Date(d).toLocaleString() },
    {
      title: 'Actions', key: 'actions', render: (_: any, faq: any) => (
        <Space>
          <Button type="link" onClick={() => {/* TODO: Edit modal */}}>Edit</Button>
          <Popconfirm title="Delete this FAQ?" onConfirm={() => handleDelete(faq.id)}>
            <Button type="link" danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>Admin FAQ List</h2>
      <Button type="primary" style={{ marginBottom: 16 }} onClick={() => {/* TODO: Show add modal */}}>
        Add FAQ
      </Button>
      <Spin spinning={loading}>
        <Table rowKey="id" columns={columns} dataSource={faqs} pagination={{ pageSize: 10 }} />
      </Spin>
      {/* TODO: Add/Edit FAQ Modal */}
    </div>
  );
}
