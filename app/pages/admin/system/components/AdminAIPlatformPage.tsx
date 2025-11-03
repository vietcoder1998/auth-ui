import { useEffect, useState } from 'react';
import { adminApi } from '~/apis/admin/index.ts';
import { Button, Card, List, message, Typography, Popconfirm, Tag } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  TagOutlined,
  AppstoreOutlined,
  KeyOutlined,
  PlusSquareOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import CommonSearch from '../../../../components/CommonSearch.tsx';
import AIPlatformModal from '../modals/AIPlatformModal.tsx';
import AddAIKeyIntoPlatformModal from '../modals/AddAIKeyIntoPlatformModal.tsx';
import AddAIModelIntoPlatformModal from '../modals/AddAIModelIntoPlatformModal.tsx';
import AddAgentIntoPlatformModal from '../modals/AddAgentIntoPlatformModal.tsx';

const { Title } = Typography;
// TODO: Create AddAIPlatformModal for add/edit

export default function AdminAIPlatformPage() {
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [addKeyModalVisible, setAddKeyModalVisible] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<any | null>(null);
  const [addModelModalVisible, setAddModelModalVisible] = useState(false);
  const [addAgentModalVisible, setAddAgentModalVisible] = useState(false);

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

  const handleAddKeyToPlatform = (platform: any) => {
    setSelectedPlatform(platform);
    setAddKeyModalVisible(true);
  };

  const handleAddKeySuccess = () => {
    setAddKeyModalVisible(false);
    setSelectedPlatform(null);
    fetchPlatforms();
  };

  const handleAddModelToPlatform = (platform: any) => {
    setSelectedPlatform(platform);
    setAddModelModalVisible(true);
  };

  const handleAddModelSuccess = () => {
    setAddModelModalVisible(false);
    setSelectedPlatform(null);
    fetchPlatforms();
  };

  const handleAddAgentToPlatform = (platform: any) => {
    setSelectedPlatform(platform);
    setAddAgentModalVisible(true);
  };

  const handleAddAgentSuccess = () => {
    setAddAgentModalVisible(false);
    setSelectedPlatform(null);
    fetchPlatforms();
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
                  icon={<RobotOutlined />}
                  title="Add Agent"
                  key="addAgent"
                  onClick={() => handleAddAgentToPlatform(item)}
                />,
                <Button
                  type="text"
                  icon={<PlusSquareOutlined />}
                  title="Add Model"
                  key="addModel"
                  onClick={() => handleAddModelToPlatform(item)}
                />,
                <Button
                  type="text"
                  icon={<KeyOutlined />}
                  title="Add API Key"
                  key="addKey"
                  onClick={() => handleAddKeyToPlatform(item)}
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
                    Platform ID:
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

                    {/* Display AI Models */}
                    {Array.isArray(item.models) && item.models.length > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <span style={{ fontSize: 13, color: '#666', marginRight: 8 }}>
                          <AppstoreOutlined /> Models ({item.models.length}):
                        </span>
                        {item.models.map((model: any) => (
                          <Tag key={model.id} color="purple" style={{ marginBottom: 4 }}>
                            {model.name}
                            {model.type && (
                              <span style={{ fontSize: 11, color: '#888', marginLeft: 4 }}>
                                ({model.type})
                              </span>
                            )}
                          </Tag>
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
      <AddAIKeyIntoPlatformModal
        visible={addKeyModalVisible}
        platformId={selectedPlatform?.id}
        platformName={selectedPlatform?.name}
        onOk={handleAddKeySuccess}
        onCancel={() => {
          setAddKeyModalVisible(false);
          setSelectedPlatform(null);
        }}
      />
      <AddAIModelIntoPlatformModal
        visible={addModelModalVisible}
        platformId={selectedPlatform?.id}
        platformName={selectedPlatform?.name}
        onOk={handleAddModelSuccess}
        onCancel={() => {
          setAddModelModalVisible(false);
          setSelectedPlatform(null);
        }}
      />
      <AddAgentIntoPlatformModal
        visible={addAgentModalVisible}
        platformId={selectedPlatform?.id}
        platformName={selectedPlatform?.name}
        onOk={handleAddAgentSuccess}
        onCancel={() => {
          setAddAgentModalVisible(false);
          setSelectedPlatform(null);
        }}
      />
    </div>
  );
}
