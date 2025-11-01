import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, message, Modal, Popconfirm, Space, Spin, Table, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { adminApi } from '~/apis/admin/index.ts';
import CommonSearch from '../../../../components/CommonSearch.tsx';
import AdminFaqCreateModal from '../modals/AdminFaqCreateModal.tsx';
import EditFaqModal from '../modals/EditFaqModal.tsx';
const { Title } = Typography;

export default function AdminFaqMenu() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingFaq, setEditingFaq] = useState<any>(null);
  const [promptOptions, setPromptOptions] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchFaqs();
    fetchPromptOptions();
  }, []);

  useEffect(() => {
    if (search.length === 0) {
      fetchFaqs();
      return;
    }
    setLoading(true);
    adminApi
      .getFaqs(search)
      .then((res: any) => {
        setFaqs(res.data.data || []);
        setLoading(false);
      })
      .catch(() => {
        setFaqs([]);
        setLoading(false);
      });
  }, [search]);

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
      render: (t: string) => {
        let color = 'blue';
        let icon = null;
        switch (t) {
          case 'agent':
            color = 'cyan';
            icon = <EyeOutlined style={{ marginRight: 4 }} />;
            break;
          case 'manual':
            color = 'volcano';
            icon = <EditOutlined style={{ marginRight: 4 }} />;
            break;
          case 'prompt':
            color = 'purple';
            icon = <Tag style={{ marginRight: 4 }} />;
            break;
          case 'job':
            color = 'gold';
            icon = <Tag style={{ marginRight: 4 }} />;
            break;
          case 'system':
            color = 'red';
            icon = <DeleteOutlined style={{ marginRight: 4 }} />;
            break;
          default:
            color = 'blue';
        }
        return (
          <Tag
            color={color}
            style={{ fontSize: 12, padding: '2px 6px', display: 'flex', alignItems: 'center' }}
          >
            {icon}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </Tag>
        );
      },
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
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(faq)}
            title="Edit"
          />
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => {
              /* TODO: View modal */
            }}
            title="View"
          />
          <Popconfirm title="Delete this FAQ?" onConfirm={() => handleDelete(faq.id)}>
            <Button type="text" icon={<DeleteOutlined />} danger title="Delete" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '8px 8px 0 8px' }}>
      <Title level={2}>Admin FAQ List</Title>
      <CommonSearch
        searchPlaceholder="Search FAQ..."
        searchValue={search}
        onSearch={setSearch}
        loading={loading}
        showRefresh={true}
        onRefresh={fetchFaqs}
        style={{ marginBottom: 12, border: 'none', boxShadow: 'none', padding: 0 }}
      />
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
