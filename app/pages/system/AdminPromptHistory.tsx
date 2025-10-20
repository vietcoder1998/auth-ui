import { useEffect, useState } from 'react';
import { adminApi } from '../../apis/admin.api.ts';
import { Button, Card, Input, List, Modal, Form, message, Space, Typography, Popconfirm } from 'antd';

const { Title } = Typography;

export default function AdminPromptHistory() {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<any | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPrompts();
  }, []);

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

  const handleCreatePrompt = async (values: any) => {
    try {
      // For creating prompt, you may need to update the API if not using conversationId
      await adminApi.createPrompt('', values.prompt);
      message.success('Prompt created');
      setModalVisible(false);
      form.resetFields();
      fetchPrompts();
    } catch (error) {
      message.error('Failed to create prompt');
    }
  };

  const handleUpdatePrompt = async (values: any) => {
    try {
      await adminApi.updatePrompt(editingPrompt.id, values.prompt);
      message.success('Prompt updated');
      setModalVisible(false);
      setEditingPrompt(null);
      form.resetFields();
      fetchPrompts();
    } catch (error) {
      message.error('Failed to update prompt');
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
    form.setFieldsValue({ prompt: prompt.prompt });
    setModalVisible(true);
  };

  return (
    <div>
      <Title level={2}>Prompt History</Title>
      <Button type="primary" onClick={() => { setEditingPrompt(null); form.resetFields(); setModalVisible(true); }}>
        Add Prompt
      </Button>
      <Card style={{ marginTop: 24 }}>
        <List
          loading={loading}
          dataSource={prompts}
          renderItem={item => (
            <List.Item
              actions={[
                <Button type="link" onClick={() => showEditModal(item)}>Edit</Button>,
                <Popconfirm title="Delete this prompt?" onConfirm={() => handleDeletePrompt(item.id)}>
                  <Button type="link" danger>Delete</Button>
                </Popconfirm>
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
      <Modal
        title={editingPrompt ? 'Edit Prompt' : 'Add Prompt'}
        open={modalVisible}
        onCancel={() => { setModalVisible(false); setEditingPrompt(null); form.resetFields(); }}
        onOk={() => form.submit()}
        okText={editingPrompt ? 'Update' : 'Create'}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingPrompt ? handleUpdatePrompt : handleCreatePrompt}
        >
          <Form.Item name="prompt" label="Prompt" rules={[{ required: true, message: 'Prompt is required' }]}> 
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
