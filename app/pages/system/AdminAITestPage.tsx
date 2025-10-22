import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Col, Input, List, Modal, Row, Select, Space, Typography } from 'antd';
import { useEffect, useState } from 'react';
import EditPromptModal from '~/components/EditPromptModal.tsx';
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
  const [editPromptModalOpen, setEditPromptModalOpen] = useState(false);
  const [editedPromptValue, setEditedPromptValue] = useState('');

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

  // Auto switch agent/conversation when prompt changes
  useEffect(() => {
    if (!selectedPrompt) return;
    // Find agent and conversation that match the prompt (simple contains logic)
    let foundAgent = agents.find((a) => {
      const name = a.name || a.agentName || a.title || '';
      return selectedPrompt.toLowerCase().includes(name.toLowerCase());
    });
    let foundConversation = conversations.find((c) => {
      const name = c.name || c.title || c.id || '';
      return selectedPrompt.toLowerCase().includes(name.toLowerCase());
    });
    if (foundAgent)
      setSelectedAgent(foundAgent.name || foundAgent.agentName || foundAgent.title || '');
    if (foundConversation)
      setSelectedConversation(
        foundConversation.name || foundConversation.title || foundConversation.id || ''
      );
  }, [selectedPrompt, agents, conversations]);

  return (
    <Card title={<Title level={4}>AI Test Playground</Title>}>
      <Row gutter={12} align="middle" style={{ marginBottom: 0 }}>
        <Col flex={1}>
          <Space direction="vertical" size={2} style={{ width: '100%' }}>
            <label htmlFor="agent-select">Agent:</label>
            <Select
              id="agent-select"
              value={selectedAgent}
              disabled
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
              disabled
              options={conversations.map((c) => ({
                label: c.name || c.title || c.id,
                value: c.name || c.title || c.id,
              }))}
              style={{ width: '100%' }}
              placeholder="Select a conversation"
            />
          </Space>
        </Col>
      </Row>
      <Row align="middle" style={{ marginBottom: 16, marginTop: 8 }}>
        <Col span={24}>
          <Space direction="vertical" size={2} style={{ width: '100%' }}>
            <label htmlFor="prompt-select" style={{ minWidth: 70 }}>
              Prompt:
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <Select
                id="prompt-search-dropdown"
                showSearch
                value={selectedPrompt}
                onSearch={(v) => setSelectedPrompt(v)}
                onChange={(v) => setSelectedPrompt(v)}
                options={prompts.map((p) => ({ label: <b>{p}</b>, value: p }))}
                style={{ width: '100%' }}
                placeholder="Search or select prompt"
                filterOption={(input, option) =>
                  (option?.value ?? '').toLowerCase().includes(input.toLowerCase())
                }
                allowClear
              />
              <Button
                type="primary"
                icon={<PlusOutlined style={{ fontSize: 16 }} />}
                onClick={() => setModalOpen(true)}
                title="Create Prompt"
              />
              <Button
                type="primary"
                icon={<EditOutlined style={{ fontSize: 16 }} />}
                onClick={() => {
                  setEditedPromptValue(selectedPrompt);
                  setEditPromptModalOpen(true);
                }}
                title="Edit Prompt"
              />
            </div>
          </Space>
        </Col>
      </Row>
      <EditPromptModal
        open={editPromptModalOpen}
        value={editedPromptValue}
        onChange={setEditedPromptValue}
        onOk={() => {
          setPrompts(prompts.map((p) => (p === selectedPrompt ? editedPromptValue : p)));
          setSelectedPrompt(editedPromptValue);
          setEditPromptModalOpen(false);
        }}
        onCancel={() => setEditPromptModalOpen(false)}
      />
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
