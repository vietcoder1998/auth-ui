import { useEffect, useState } from 'react';
import { adminApi } from '~/apis/admin/index.ts';
import { Button, Card, message, Typography, Popconfirm, Table, Tag, Space } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import CommonSearch from '../../../../components/CommonSearch.tsx';

const { Title } = Typography;

import AddAIKeyModal from '../../../../components/AddAIKeyModal.tsx';
import AIKeyDetailModal from '../modals/AIKeyDetailModal.tsx';

export default function AdminAIKeyPage() {
  const [aiKeys, setAIKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingKey, setEditingKey] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedAIKey, setSelectedAIKey] = useState<any | null>(null);

  useEffect(() => {
    fetchAIKeys();
    fetchPlatforms();
    fetchAgents();
  }, []);

  useEffect(() => {
    if (search.length === 0) {
      fetchAIKeys();
      return;
    }
    setLoading(true);
    adminApi
      .getAIKeys(search)
      .then((response: any) => {
        setAIKeys(response.data?.data || []);
        setLoading(false);
      })
      .catch(() => {
        setAIKeys([]);
        setLoading(false);
      });
  }, [search]);

  const fetchAIKeys = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getAIKeys();
      setAIKeys(response.data?.data || []);
    } catch (error) {
      message.error('Failed to fetch AI Keys');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlatforms = async () => {
    try {
      const response = await adminApi.getAIPlatforms();
      setPlatforms(response?.data?.data || []);
    } catch {
      setPlatforms([]);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await adminApi.getAgents();
      setAgents(response?.data?.data || []);
    } catch {
      setAgents([]);
    }
  };

  const handleModalOk = async (values: any) => {
    try {
      if (editingKey) {
        await adminApi.updateAIKey(editingKey.id, values);
        message.success('AI Key updated');
      } else {
        await adminApi.createAIKey(values);
        message.success('AI Key created');
      }
      setModalVisible(false);
      setEditingKey(null);
      fetchAIKeys();
    } catch (error) {
      message.error('Failed to save AI Key');
    }
  };

  const handleDeleteAIKey = async (keyId: string) => {
    try {
      await adminApi.deleteAIKey(keyId);
      message.success('AI Key deleted');
      fetchAIKeys();
    } catch (error) {
      message.error('Failed to delete AI Key');
    }
  };

  const showEditModal = (key: any) => {
    setEditingKey(key);
    setModalVisible(true);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id: string, record: any) => (
        <Button
          type="link"
          style={{
            padding: 0,
            fontWeight: 700,
            color: '#1890ff',
          }}
          onClick={() => {
            setSelectedAIKey(record);
            setDetailModalVisible(true);
          }}
        >
          {id.substring(0, 8)}...
        </Button>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (name: string) => <strong>{name || 'N/A'}</strong>,
    },
    {
      title: 'Platform',
      dataIndex: 'platform',
      key: 'platform',
      width: 120,
      render: (platform: any) => <Tag color="blue">{platform?.name || 'N/A'}</Tag>,
    },
    {
      title: 'Agents',
      dataIndex: 'agents',
      key: 'agents',
      width: 200,
      render: (agents: any[]) => (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          {agents && agents.length > 0 ? (
            agents.map((agent: any) => (
              <Tag key={agent.id} color="green">
                {agent.name}
                {agent.model && (
                  <span style={{ fontSize: 11, color: '#666', marginLeft: 4 }}>
                    ({agent.model.name})
                  </span>
                )}
              </Tag>
            ))
          ) : (
            <span style={{ color: '#999' }}>No agents</span>
          )}
        </Space>
      ),
    },
    {
      title: 'Key',
      dataIndex: 'key',
      key: 'key',
      ellipsis: true,
      render: (key: string) => (
        <code
          style={{
            fontSize: 11,
            background: '#f5f5f5',
            padding: '2px 6px',
            borderRadius: 3,
          }}
        >
          {key ? `${key.substring(0, 20)}...` : 'N/A'}
        </code>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc: string) => desc || '-',
    },
    {
      title: 'Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 150,
      render: (date: string) => (
        <span style={{ fontSize: 12 }}>{date ? new Date(date).toLocaleString() : 'N/A'}</span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedAIKey(record);
              setDetailModalVisible(true);
            }}
            title="View Details"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
            title="Edit"
          />
          <Popconfirm title="Delete this AI Key?" onConfirm={() => handleDeleteAIKey(record.id)}>
            <Button type="text" icon={<DeleteOutlined />} danger title="Delete" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>AI Key Management</Title>
      <CommonSearch
        searchPlaceholder="Search AI Key..."
        searchValue={search}
        onSearch={setSearch}
        loading={loading}
        showRefresh={true}
        onRefresh={fetchAIKeys}
        style={{ marginBottom: 12, border: 'none', boxShadow: 'none', padding: 0 }}
      />
      <Button
        type="primary"
        onClick={() => {
          setEditingKey(null);
          setModalVisible(true);
        }}
        style={{ marginBottom: 16 }}
      >
        Add AI Key
      </Button>
      <Card style={{ marginTop: 0 }}>
        <Table
          loading={loading}
          dataSource={aiKeys}
          columns={columns}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} items`,
          }}
        />
      </Card>
      <AddAIKeyModal
        visible={modalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setModalVisible(false);
          setEditingKey(null);
        }}
        editingKey={editingKey}
        platforms={platforms}
      />
      <AIKeyDetailModal
        visible={detailModalVisible}
        aiKey={selectedAIKey}
        onCancel={() => setDetailModalVisible(false)}
      />
    </div>
  );
}
