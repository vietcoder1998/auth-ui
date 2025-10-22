import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Col, Input, List, Modal, Row, Select, Space, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { adminApi } from '../../apis/admin.api.ts';
import AIGenerateInput from '../../components/AIGenerateInput.tsx';
import { AIGenerateProvider, useAIGenerateProvider } from '../../providers/AIGenerateProvider.tsx';

const { Title } = Typography;

function AdminAITestContent() {
  const { value, setValue } = useAIGenerateProvider();
  const [prompts, setPrompts] = useState<string[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedConversation, setSelectedConversation] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [newPrompt, setNewPrompt] = useState('');

  useEffect(() => {
    // Fetch prompts
    adminApi.getPrompts().then((res: any) => {
      const items = res?.data?.data || [];
      setPrompts(items.map((p: any) => p.prompt || p.name || p.title || ''));
      setSelectedPrompt(items[0]?.prompt || items[0]?.name || items[0]?.title || '');
    });
    // Fetch agents
    adminApi.getAgents().then((res: any) => {
      const items = res?.data?.data || [];
      setAgents(items);
      setSelectedAgent(items[0]?.name || items[0]?.agentName || items[0]?.title || '');
    });
    // Fetch conversations
    adminApi.getConversations().then((res: any) => {
      const items = res?.data?.data || [];
      setConversations(items);
      setSelectedConversation(items[0]?.name || items[0]?.title || items[0]?.id || '');
    });
  }, []);

  // Auto switch prompt when agent or conversation changes
  useEffect(() => {
    if (selectedAgent && selectedConversation) {
      // Example: auto-select first prompt for this agent/conversation
      setSelectedPrompt(prompts[0] || '');
    }
  }, [selectedAgent, selectedConversation, prompts]);

  const handleCreatePrompt = () => {
    if (!newPrompt.trim()) return;
    setPrompts([newPrompt, ...prompts]);
    setSelectedPrompt(newPrompt);
    setNewPrompt('');
    setModalOpen(false);
  };

  return (
    <Card title={<Title level={4}>AI Test Playground</Title>}>
      <Row gutter={12} align="middle" style={{ marginBottom: 16 }}>
        <Col flex={1}>
          <Space direction="vertical" size={2} style={{ width: '100%' }}>
            <label htmlFor="agent-select">Agent:</label>
            <Select
              id="agent-select"
              value={selectedAgent}
              onChange={setSelectedAgent}
              options={agents.map((a) => ({
                label: a.name || a.agentName || a.title,
                value: a.name || a.agentName || a.title,
              }))}
              style={{ width: '100%' }}
              placeholder="Select an agent"
            />
          </Space>
        </Col>
        <Col flex={1}>
          <Space direction="vertical" size={2} style={{ width: '100%' }}>
            <label htmlFor="conversation-select">Conversation:</label>
            <Select
              id="conversation-select"
              value={selectedConversation}
              onChange={setSelectedConversation}
              options={conversations.map((c) => ({
                label: c.name || c.title || c.id,
                value: c.name || c.title || c.id,
              }))}
              style={{ width: '100%' }}
              placeholder="Select a conversation"
            />
          </Space>
        </Col>
        <Col flex={2}>
          <Space direction="horizontal" size={8} style={{ width: '100%' }}>
            <Space direction="vertical" size={2} style={{ flex: 1, width: '100%' }}>
              <label htmlFor="prompt-select" style={{ minWidth: 70 }}>
                Prompt:
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <Select
                  id="prompt-select"
                  value={selectedPrompt}
                  onChange={setSelectedPrompt}
                  options={prompts.map((p) => ({ label: <b>{p}</b>, value: p }))}
                  style={{ width: '100%' }}
                  placeholder="Select a prompt"
                  dropdownMatchSelectWidth={false}
                />
                <Button
                  type="text"
                  icon={<PlusOutlined style={{ fontSize: 20 }} />}
                  onClick={() => setModalOpen(true)}
                  style={{ height: 40, padding: 0, minWidth: 40 }}
                  title="Create Prompt"
                />
              </div>
            </Space>
          </Space>
        </Col>
      </Row>
      <AIGenerateInput
        prompt={selectedPrompt}
        value={value}
        onChange={setValue}
        placeholder={`Type or generate with ${selectedAgent}`}
        textarea
        rows={6}
      />
      <List
        header={<b>Recent Prompts</b>}
        dataSource={prompts}
        renderItem={(item) => <List.Item>{item}</List.Item>}
        style={{ marginTop: 32 }}
      />
      <Modal
        title="Create New Prompt"
        open={modalOpen}
        onOk={handleCreatePrompt}
        onCancel={() => setModalOpen(false)}
        okText="Create"
      >
        <div style={{ marginBottom: 12 }}>
          <b>Agent:</b>{' '}
          {(selectedAgent &&
            agents.find((a) => (a.name || a.agentName || a.title) === selectedAgent)
              ?.description) ||
            selectedAgent}
        </div>
        <div style={{ marginBottom: 12 }}>
          <b>Conversation:</b>{' '}
          {(selectedConversation &&
            conversations.find((c) => (c.name || c.title || c.id) === selectedConversation)
              ?.description) ||
            selectedConversation}
        </div>
        <label htmlFor="new-prompt-input">Prompt:</label>
        <Input.TextArea
          id="new-prompt-input"
          value={newPrompt}
          onChange={(e) => setNewPrompt(e.target.value)}
          placeholder="Enter new prompt"
          autoSize={{ minRows: 3, maxRows: 6 }}
          onPressEnter={handleCreatePrompt}
        />
      </Modal>
    </Card>
  );
}

export default function AdminAITestPage() {
  return (
    <AIGenerateProvider>
      <AdminAITestContent />
    </AIGenerateProvider>
  );
}
