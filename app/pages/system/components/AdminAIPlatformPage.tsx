import { useEffect, useState } from 'react';
import { adminApi } from '../../../apis/admin.api.ts';
import { Button, Card, List, message, Typography, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, TagOutlined } from '@ant-design/icons';
import CommonSearch from '../../../components/CommonSearch.tsx';
import AIPlatformModal from '../../../modals/AIPlatformModal.tsx';

const { Title } = Typography;
// TODO: Create AddAIPlatformModal for add/edit

export default function AdminAIPlatformPage() {
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<any | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPlatforms();
  }, []);

  useEffect(() => {
    if (search.length === 0) {
      fetchPlatforms();
      return;
    }
    setLoading(true);
    adminApi
      .getAIPlatforms(search)
      .then((response: any) => {
        setPlatforms(response.data?.data || []);
        setLoading(false);
      })
      .catch(() => {
        setPlatforms([]);
        setLoading(false);
      });
  }, [search]);

  const fetchPlatforms = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getAIPlatforms();
      setPlatforms(response.data?.data || []);
    } catch (error) {
      message.error('Failed to fetch AI Platforms');
    } finally {
      setLoading(false);
    }
  };

  const handleModalOk = async (values: any) => {
    try {
      if (editingPlatform) {
        await adminApi.updateAIPlatform(editingPlatform.id, values);
        message.success('AI Platform updated');
      } else {
        await adminApi.createAIPlatform(values);
        message.success('AI Platform created');
      }
      setModalVisible(false);
      setEditingPlatform(null);
      fetchPlatforms();
    } catch (error) {
      message.error('Failed to save AI Platform');
    }
  };

  const handleDeletePlatform = async (platformId: string) => {
    try {
      await adminApi.deleteAIPlatform(platformId);
      message.success('AI Platform deleted');
      fetchPlatforms();
    } catch (error) {
      message.error('Failed to delete AI Platform');
    }
  };

  const showEditModal = (platform: any) => {
    setEditingPlatform(platform);
    setModalVisible(true);
  };

  return (
    <div>
      <Title level={2}>AI Platform Management</Title>
      <CommonSearch
        searchPlaceholder="Search AI Platform..."
        searchValue={search}
        onSearch={setSearch}
        loading={loading}
        showRefresh={true}
        onRefresh={fetchPlatforms}
        style={{ marginBottom: 12, border: 'none', boxShadow: 'none', padding: 0 }}
      />
      <Button
        type="primary"
        onClick={() => {
          setEditingPlatform(null);
          setModalVisible(true);
        }}
        style={{ marginBottom: 16 }}
      >
        Add AI Platform
      </Button>
      <Card style={{ marginTop: 0 }}>
        <List
          loading={loading}
          dataSource={platforms}
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
                  title="Delete this AI Platform?"
                  onConfirm={() => handleDeletePlatform(item.id)}
                  key="delete"
                >
                  <Button type="text" icon={<DeleteOutlined />} danger title="Delete" />
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                title={
                  <span>
                    Platform ID:{' '}
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
                        setEditingPlatform(item);
                        setModalVisible(true);
                      }}
                    >
                      {item.id}
                    </Button>
                    {item.name && (
                      <span style={{ marginLeft: 12, color: '#888', fontSize: 13 }}>
                        Name: <b>{item.name}</b>
                      </span>
                    )}
                  </span>
                }
                description={
                  <div>
                    <pre style={{ whiteSpace: 'pre-wrap', marginBottom: 4 }}>
                      {item.description}
                    </pre>
                    {Array.isArray(item.aiModels) && item.aiModels.length > 0 && (
                      <div style={{ marginBottom: 4 }}>
                        <b>Models:</b>{' '}
                        {item.aiModels.map((model: any, idx: number) => (
                          <span key={model.id || idx} style={{ marginRight: 8, color: '#1890ff' }}>
                            {model.name || model.id}
                          </span>
                        ))}
                      </div>
                    )}
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
      <AIPlatformModal
        visible={modalVisible}
        editingPlatform={editingPlatform}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
      />
    </div>
  );
}
