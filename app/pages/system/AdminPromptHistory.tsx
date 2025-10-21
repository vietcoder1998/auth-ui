import { useEffect, useState } from 'react';
import { adminApi } from '../../apis/admin.api.ts';
import { Button, Card, List, message, Typography, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, TagOutlined } from '@ant-design/icons';
import CommonSearch from '../../components/CommonSearch.tsx';

const { Title } = Typography;
import AddPromptModal from './modals/AddPromptModal.tsx';
import { Modal } from 'antd';
import { ConversationApi } from '../../apis/adminApi/ConversationApi.ts';

export default function AdminPromptHistory() {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<any | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [viewPrompt, setViewPrompt] = useState<any | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);

  useEffect(() => {
    fetchPrompts();
    fetchConversations();
  }, []);

  useEffect(() => {
    if (search.length === 0) {
      fetchPrompts();
      return;
    }
    setLoading(true);
    adminApi
      .getPrompts(search)
      .then((response: any) => {
        setPrompts(response.data?.data || []);
        setLoading(false);
      })
      .catch(() => {
        setPrompts([]);
        setLoading(false);
      });
  }, [search]);

  const fetchConversations = async () => {
    try {
      const res = await ConversationApi.getConversations();
      setConversations(res.data?.data || []);
    } catch {
      setConversations([]);
    }
  };

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      // Fetch all prompts (not bound to conversationId)
      const response = await adminApi.getPrompts();
      setPrompts(response.data?.data || []);
    } catch (error) {
      message.error('Failed to fetch prompts');
    } finally {
      setLoading(false);
    }
  };

  const handlePromptModalOk = async (values: any) => {
    try {
      if (editingPrompt) {
        // Update
        await adminApi.updatePrompt(editingPrompt.id, values.prompt);
        message.success('Prompt updated');
      } else {
        // Create
        await adminApi.createPrompt(values.conversationId, values.prompt);
        message.success('Prompt created');
      }
      setModalVisible(false);
      setEditingPrompt(null);
      fetchPrompts();
    } catch (error) {
      message.error('Failed to save prompt');
    }
  };

  const handleDeletePrompt = async (promptId: string) => {
    try {
      await adminApi.deletePrompt(promptId);
      message.success('Prompt deleted');
      fetchPrompts();
    } catch (error) {
      message.error('Failed to delete prompt');
    }
  };

  const showEditModal = (prompt: any) => {
    setEditingPrompt(prompt);
    setModalVisible(true);
  };

  return (
    <div>
      <Title level={2}>Prompt History</Title>
      <CommonSearch
        searchPlaceholder="Search prompt..."
        searchValue={search}
        onSearch={setSearch}
        loading={loading}
        showRefresh={true}
        onRefresh={fetchPrompts}
        style={{ marginBottom: 12, border: 'none', boxShadow: 'none', padding: 0 }}
      />
      <Button
        type="primary"
        onClick={() => {
          setEditingPrompt(null);
          setModalVisible(true);
        }}
        style={{ marginBottom: 16 }}
      >
        Add Prompt
      </Button>
      <Card style={{ marginTop: 0 }}>
        <List
          loading={loading}
          dataSource={prompts}
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
                  title="Delete this prompt?"
                  onConfirm={() => handleDeletePrompt(item.id)}
                  key="delete"
                >
                  <Button type="text" icon={<DeleteOutlined />} danger title="Delete" />
                </Popconfirm>,
              ]}
              onClick={() => {
                setViewPrompt(item);
                setViewModalVisible(true);
              }}
              style={{ cursor: 'pointer' }}
            >
              <List.Item.Meta
                title={
                  <span>
                    Prompt ID: {item.id}
                    {item.conversationId && (
                      <span style={{ marginLeft: 12, color: '#888', fontSize: 13 }}>
                        Conversation: <b>{item.conversationTitle || item.conversationId}</b>
                      </span>
                    )}
                    {item.agent && (
                      <span style={{ marginLeft: 12, color: '#888', fontSize: 13 }}>
                        Agent: <b>{item.agent.name || item.agent.id}</b> ({item.agent.type || 'N/A'}
                        )
                      </span>
                    )}
                  </span>
                }
                description={
                  <div>
                    <pre style={{ whiteSpace: 'pre-wrap', marginBottom: 4 }}>{item.prompt}</pre>
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
      <AddPromptModal
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingPrompt(null);
        }}
        onOk={handlePromptModalOk}
        loading={loading}
        conversations={conversations}
        defaultConversationId={editingPrompt?.conversationId}
        initialPrompt={editingPrompt?.prompt}
      />
      {/* ViewPromptModal */}
      <Modal
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setViewPrompt(null);
        }}
        footer={null}
        title={viewPrompt ? `Prompt Detail (ID: ${viewPrompt.id})` : 'Prompt Detail'}
      >
        {viewPrompt && (
          <div>
            <div style={{ marginBottom: 8 }}>
              <b>Prompt:</b>
              <pre style={{ whiteSpace: 'pre-wrap', marginBottom: 4 }}>{viewPrompt.prompt}</pre>
            </div>
            {viewPrompt.conversationId && (
              <div style={{ marginBottom: 8 }}>
                <b>Conversation:</b> {viewPrompt.conversationTitle || viewPrompt.conversationId}
              </div>
            )}
            {viewPrompt.agent && (
              <div style={{ marginBottom: 8 }}>
                <b>Agent:</b> {viewPrompt.agent.name || viewPrompt.agent.id} (
                {viewPrompt.agent.type || 'N/A'})
              </div>
            )}
            {viewPrompt.updatedAt && (
              <div style={{ marginBottom: 8, fontSize: 12, color: '#aaa' }}>
                Updated: {new Date(viewPrompt.updatedAt).toLocaleString()}
              </div>
            )}
            {/* Add button to test prompt for conversation */}
            {viewPrompt.conversationId && (
              <Button
                type="primary"
                onClick={() => {
                  // TODO: Implement test prompt action for conversation
                  message.info('Test prompt for conversation: ' + viewPrompt.conversationId);
                }}
                style={{ marginTop: 12 }}
              >
                Test Prompt in Conversation
              </Button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
