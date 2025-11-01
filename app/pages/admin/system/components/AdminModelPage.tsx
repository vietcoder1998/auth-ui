import { useEffect, useState } from 'react';
import { adminApi } from '~/apis/admin/index.ts';
import { Button, Card, List, message, Typography, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, TagOutlined } from '@ant-design/icons';
import CommonSearch from '../../../../components/CommonSearch.tsx';
// You should create AIModelModal similar to AIPlatformModal for add/edit
import AIModelModal from '../modals/AIModelModal.tsx';

const { Title } = Typography;

export default function AdminModelPage() {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingModel, setEditingModel] = useState<any | null>(null);
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
    </div>
  );
}
