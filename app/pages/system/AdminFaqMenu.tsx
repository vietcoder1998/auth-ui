import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Modal, Spin, message, Popconfirm } from 'antd';
import { adminApi } from '../../apis/admin.api.ts';
import AdminFaqCreateModal from './modals/AdminFaqCreateModal.tsx';

export default function AdminFaqMenu() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [promptOptions, setPromptOptions] = useState<any[]>([]);

  useEffect(() => {
    fetchFaqs();
    fetchPromptOptions();
  }, []);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getFaqs();
      setFaqs(res.data.data || []);
    } catch (error) {
      message.error('Failed to load FAQs');
      setFaqs([]);
    }
    setLoading(false);
  };

  const fetchPromptOptions = async () => {
    try {
      const res = await adminApi.getPrompts();
      setPromptOptions((res.data.data || []).map((p: any) => ({ value: p.id, label: p.prompt })));
    } catch {
      setPromptOptions([]);
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Delete FAQ',
      content: 'Are you sure you want to delete this FAQ?',
      okType: 'danger',
      onOk: async () => {
        await adminApi.deleteFaq(id);
        fetchFaqs();
      },
    });
  };

  const handleCreateFaq = async (values: any) => {
    try {
      await adminApi.createFaq(values);
      message.success('FAQ created');
      setModalVisible(false);
      fetchFaqs();
    } catch (error) {
      message.error('Failed to create FAQ');
    }
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
      <Button type="primary" style={{ marginBottom: 16 }} onClick={() => setModalVisible(true)}>
        Add FAQ
      </Button>
      <Spin spinning={loading}>
        <Table rowKey="id" columns={columns} dataSource={faqs} pagination={{ pageSize: 10 }} />
      </Spin>
      <AdminFaqCreateModal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleCreateFaq}
        loading={loading}
        promptOptions={promptOptions}
      />
    </div>
  );
}
