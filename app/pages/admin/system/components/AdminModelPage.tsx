import { useEffect, useState } from 'react';
import { adminApi } from '~/apis/admin/index.ts';
import { AgentApi } from '~/apis/admin/AgentApi.ts';
import { Button, Card, List, message, Typography, Popconfirm, Tag } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  TagOutlined,
  UserOutlined,
  KeyOutlined,
} from '@ant-design/icons';
import CommonSearch from '../../../../components/CommonSearch.tsx';
// You should create AIModelModal similar to AIPlatformModal for add/edit
import AIModelModal from '../modals/AIModelModal.tsx';
import UpdateModelKeyModal from '../modals/UpdateModelKeyModal.tsx';

const { Title } = Typography;

export default function AdminModelPage() {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [keyModalVisible, setKeyModalVisible] = useState(false);
  const [editingModel, setEditingModel] = useState<any | null>(null);
  const [selectedModel, setSelectedModel] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [platformOptions, setPlatformOptions] = useState<Array<{ label: string; value: string }>>(
    []
  );

  useEffect(() => {
    fetchModels();
    fetchPlatforms();
  }, []);
  const fetchPlatforms = async () => {
    try {
      const response = await adminApi.getAIPlatforms();
      const platforms = response.data?.data || [];
      setPlatformOptions(platforms.map((p: any) => ({ label: p.name, value: p.id })));
    } catch {
      setPlatformOptions([]);
    }
  };

  useEffect(() => {
    if (search.length === 0) {
      fetchModels();
      return;
    }
    setLoading(true);
    adminApi
      .getAIModels(search)
      .then((response: any) => {
        setModels(response.data?.data || []);
        setLoading(false);
      })
      .catch(() => {
        setModels([]);
        setLoading(false);
      });
  }, [search]);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getAIModels();
      setModels(response.data?.data || []);
    } catch (error) {
      message.error('Failed to fetch AI Models');
    } finally {
      setLoading(false);
    }
  };

  const handleModalOk = async (values: any) => {
    try {
      if (editingModel) {
        await adminApi.updateAIModel(editingModel.id, values);
        message.success('AI Model updated');
      } else {
        await adminApi.createAIModel(values);
        message.success('AI Model created');
      }
      setModalVisible(false);
      setEditingModel(null);
      fetchModels();
    } catch (error) {
      message.error('Failed to save AI Model');
    }
  };

  const handleDeleteModel = async (modelId: string) => {
    try {
      await adminApi.deleteAIModel(modelId);
      message.success('AI Model deleted');
      fetchModels();
    } catch (error) {
      message.error('Failed to delete AI Model');
    }
  };

  const showEditModal = (model: any) => {
    setEditingModel(model);
    setModalVisible(true);
  };

  const handleUpdateKey = async (keyId: string) => {
    if (!selectedModel) return;
    try {
      // Get all agents using this model
      const agents = selectedModel.agents || [];

      if (agents.length === 0) {
        message.warning('No agents are using this model');
        setKeyModalVisible(false);
        setSelectedModel(null);
        return;
      }

      // Update each agent to use the selected AI key using the new API
      await Promise.all(agents.map((agent: any) => AgentApi.updateAgentKeys(agent.id, [keyId])));

      message.success(`AI Key assigned to ${agents.length} agent(s)`);
      setKeyModalVisible(false);
      setSelectedModel(null);
      fetchModels();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to update AI Key');
    }
  };

  const showKeyModal = (model: any) => {
    setSelectedModel(model);
    setKeyModalVisible(true);
  };

  return (
    <div>
      <Title level={2}>AI Model Management</Title>
      <CommonSearch
        searchPlaceholder="Search AI Model..."
        searchValue={search}
        onSearch={setSearch}
        loading={loading}
        showRefresh={true}
        onRefresh={fetchModels}
        style={{ marginBottom: 12, border: 'none', boxShadow: 'none', padding: 0 }}
      />
      <Button
        type="primary"
        onClick={() => {
          setEditingModel(null);
          setModalVisible(true);
        }}
        style={{ marginBottom: 16 }}
      >
        Add AI Model
      </Button>
      <Card style={{ marginTop: 0 }}>
        <List
          loading={loading}
          dataSource={models}
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
                  icon={<KeyOutlined />}
                  onClick={() => showKeyModal(item)}
                  title="Update AI Key"
                  key="key"
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
                  title="Delete this AI Model?"
                  onConfirm={() => handleDeleteModel(item.id)}
                  key="delete"
                >
                  <Button type="text" icon={<DeleteOutlined />} danger title="Delete" />
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                title={
                  <span>
                    Model ID:{' '}
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
                        setEditingModel(item);
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

                    {/* Display Platform */}
                    {item.platform && (
                      <div style={{ marginBottom: 8 }}>
                        <Tag color="blue">Platform: {item.platform.name}</Tag>
                      </div>
                    )}

                    {/* Display Agents */}
                    {item.agents && item.agents.length > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <span style={{ fontSize: 13, color: '#666', marginRight: 8 }}>
                          <UserOutlined /> Agents ({item.agents.length}):
                        </span>
                        {item.agents.map((agent: any) => (
                          <Tag key={agent.id} color="green" style={{ marginBottom: 4 }}>
                            {agent.name}
                            {agent.description && (
                              <span style={{ fontSize: 11, color: '#888', marginLeft: 4 }}>
                                - {agent.description}
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
      <AIModelModal
        visible={modalVisible}
        editingModel={editingModel}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        platformOptions={platformOptions}
      />
      <UpdateModelKeyModal
        visible={keyModalVisible}
        model={selectedModel}
        onOk={handleUpdateKey}
        onCancel={() => {
          setKeyModalVisible(false);
          setSelectedModel(null);
        }}
      />
    </div>
  );
}
