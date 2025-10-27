import { useEffect, useState } from 'react';
import { adminApi } from '../../../../apis/admin.api.ts';
import { Button, Card, List, message, Typography, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, TagOutlined } from '@ant-design/icons';
import CommonSearch from '../../../../components/CommonSearch.tsx';

const { Title } = Typography;

import AddAIKeyModal from '../../../../components/AddAIKeyModal.tsx';
import AIKeyDetailModal from '../../../../modals/AIKeyDetailModal.tsx';

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
        <List
          loading={loading}
          dataSource={aiKeys}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => showEditModal(item)}
                  title="Edit"
                  key="edit"
                />,
                <Button
                  type="text"
                  icon={<TagOutlined />}
                  title="Label"
                  key="label"
                  onClick={() => {
                    /* TODO: Label action */
                  }}
                />,
                <Popconfirm
                  title="Delete this AI Key?"
                  onConfirm={() => handleDeleteAIKey(item.id)}
                  key="delete"
                >
                  <Button type="text" icon={<DeleteOutlined />} danger title="Delete" />
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                title={
                  <span>
                    Key ID:{' '}
                    <Button
                      type="link"
                      style={{
                        padding: 0,
                        fontWeight: 700,
                        color: '#1890ff',
                        background: '#e6f7ff',
                        borderRadius: 4,
                        marginRight: 8,
                      }}
                      onClick={() => {
                        setSelectedAIKey(item);
                        setDetailModalVisible(true);
                      }}
                    >
                      {item.id}
                    </Button>
                    {item.platformId && (
                      <span style={{ marginLeft: 12, color: '#888', fontSize: 13 }}>
                        Platform: <b>{item.platformName || item.platformId}</b>
                      </span>
                    )}
                  </span>
                }
                description={
                  <div>
                    <pre style={{ whiteSpace: 'pre-wrap', marginBottom: 4 }}>{item.key}</pre>
                    {item.updatedAt && (
                      <span style={{ fontSize: 12, color: '#aaa' }}>
                        Updated: {new Date(item.updatedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
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
        agents={agents}
      />
      <AIKeyDetailModal
        visible={detailModalVisible}
        aiKey={selectedAIKey}
        onCancel={() => setDetailModalVisible(false)}
      />
    </div>
  );
}
