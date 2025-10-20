import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Modal, Spin, message, Popconfirm } from 'antd';
import { adminApi } from '../../apis/admin.api.ts';
import AdminFaqCreateModal from './modals/AdminFaqCreateModal.tsx';
import EditFaqModal from './modals/EditFaqModal.tsx';

export default function AdminFaqMenu() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingFaq, setEditingFaq] = useState<any>(null);
  const [promptOptions, setPromptOptions] = useState<any[]>([]);

  useEffect(() => {
    fetchFaqs();
    fetchPromptOptions();
  }, []);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getFaqs();
      setFaqs(res.data.data.data || []);
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

  const handleEdit = (faq: any) => {
    setEditingFaq(faq);
    setEditModalVisible(true);
  };

  const handleUpdateFaq = async (values: any) => {
    try {
      await adminApi.updateFaq(values.id, values);
      message.success('FAQ updated');
      setEditModalVisible(false);
      setEditingFaq(null);
      fetchFaqs();
    } catch (error) {
      message.error('Failed to update FAQ');
    }
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

  const MAX_CELL_LENGTH = 60;
  const columns: any[] = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (t: string) => (
        <Tag color="blue" style={{ fontSize: 12, padding: '2px 6px' }}>
          {t}
        </Tag>
      ),
    },
    {
      title: 'Question',
      dataIndex: 'question',
      key: 'question',
      width: 180,
      render: (q: string) =>
        q.length > MAX_CELL_LENGTH ? (
          <span title={q} style={{ cursor: 'pointer' }}>
            {q.slice(0, MAX_CELL_LENGTH)}...{' '}
          </span>
        ) : (
          <span>{q}</span>
        ),
    },
    {
      title: 'Answer',
      dataIndex: 'answer',
      key: 'answer',
      width: 180,
      render: (a: string) =>
        a.length > MAX_CELL_LENGTH ? (
          <span title={a} style={{ cursor: 'pointer' }}>
            {a.slice(0, MAX_CELL_LENGTH)}...{' '}
          </span>
        ) : (
          <span>{a}</span>
        ),
    },
    {
      title: 'Prompt',
      dataIndex: 'prompt',
      key: 'prompt',
      width: 120,
      render: (_: any, faq: any) =>
        faq.prompt ? (
          <span title={faq.prompt.prompt} style={{ cursor: 'pointer' }}>
            {faq.prompt.prompt?.slice(0, MAX_CELL_LENGTH) +
              (faq.prompt.prompt.length > MAX_CELL_LENGTH ? '...' : '')}
          </span>
        ) : (
          <span style={{ color: '#aaa' }}>-</span>
        ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      render: (d: string) => <span style={{ fontSize: 12 }}>{new Date(d).toLocaleString()}</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right' as 'right',
      width: 140,
      render: (_: any, faq: any) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(faq)}>
            Edit
          </Button>
          <Button
            type="link"
            onClick={() => {
              /* TODO: View modal */
            }}
          >
            View
          </Button>
          <Popconfirm title="Delete this FAQ?" onConfirm={() => handleDelete(faq.id)}>
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '8px 8px 0 8px' }}>
      <h2>Admin FAQ List</h2>
      <Button type="primary" style={{ marginBottom: 16 }} onClick={() => setModalVisible(true)}>
        Add FAQ
      </Button>
      <Spin spinning={loading}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={faqs}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 'max-content' }}
        />
      </Spin>
      <AdminFaqCreateModal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleCreateFaq}
        loading={loading}
        promptOptions={promptOptions}
      />
      <EditFaqModal
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingFaq(null);
        }}
        onOk={handleUpdateFaq}
        loading={loading}
        faq={editingFaq}
        promptOptions={promptOptions}
      />
    </div>
  );
}
