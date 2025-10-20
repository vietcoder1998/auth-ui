import { useEffect, useState } from 'react';
import { adminApi } from '../../apis/admin.api.ts';
import { Button, Card, List, message, Typography, Popconfirm } from 'antd';
import CommonSearch from '../../components/CommonSearch.tsx';

const { Title } = Typography;
import AddPromptModal from './modals/AddPromptModal.tsx';
import { ConversationApi } from '../../apis/adminApi/ConversationApi.ts';

export default function AdminPromptHistory() {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<any | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [search, setSearch] = useState('');

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
                <Button type="link" onClick={() => showEditModal(item)}>
                  Edit
                </Button>,
                <Popconfirm
                  title="Delete this prompt?"
                  onConfirm={() => handleDeletePrompt(item.id)}
                >
                  <Button type="link" danger>
                    Delete
                  </Button>
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                title={<span>Prompt ID: {item.id}</span>}
                description={<pre style={{ whiteSpace: 'pre-wrap' }}>{item.prompt}</pre>}
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
    </div>
  );
}
