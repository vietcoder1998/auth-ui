import { Card, List, Select, Typography, Button, Modal, Input } from 'antd';
import { useEffect, useState } from 'react';
import { adminApi } from '../../apis/admin.api.ts';
import AIGenerateInput from '../../components/AIGenerateInput.tsx';
import { AIGenerateProvider, useAIGenerateProvider } from '../../providers/AIGenerateProvider.tsx';

const { Title } = Typography;

function AdminAITestContent() {
  const { value, setValue } = useAIGenerateProvider();
  const [prompts, setPrompts] = useState<string[]>([]);
  const [agents, setAgents] = useState<string[]>([]);
  const [conversations, setConversations] = useState<string[]>([]);
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
      setAgents(items.map((a: any) => a.name || a.agentName || a.title || ''));
      setSelectedAgent(items[0]?.name || items[0]?.agentName || items[0]?.title || '');
    });
    // Fetch conversations
    adminApi.getConversations().then((res: any) => {
      const items = res?.data?.data || [];
      setConversations(items.map((c: any) => c.name || c.title || c.id || ''));
      setSelectedConversation(items[0]?.name || items[0]?.title || items[0]?.id || '');
    });
  }, []);

  const handleCreatePrompt = () => {
    if (!newPrompt.trim()) return;
    setPrompts([newPrompt, ...prompts]);
    setSelectedPrompt(newPrompt);
    setNewPrompt('');
    setModalOpen(false);
  };

  return (
    <Card
      title={<Title level={4}>AI Test Playground</Title>}
      style={{ maxWidth: 700, margin: '0 auto' }}
    >
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <div style={{ flex: 1 }}>
          <label>Agent:</label>
          <Select
            value={selectedAgent}
            onChange={setSelectedAgent}
            options={agents.map((a) => ({ label: a, value: a }))}
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label>Conversation:</label>
          <Select
            value={selectedConversation}
            onChange={setSelectedConversation}
            options={conversations.map((c) => ({ label: c, value: c }))}
            style={{ width: '100%' }}
          />
        </div>
      </div>
      {/* Prompt input on new line with create button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Select
          value={selectedPrompt}
          onChange={setSelectedPrompt}
          options={prompts.map((p) => ({ label: p, value: p }))}
          style={{ flex: 1 }}
          placeholder="Select a prompt"
        />
        <Button type="primary" onClick={() => setModalOpen(true)}>
          Create Prompt
        </Button>
      </div>
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
        <Input
          value={newPrompt}
          onChange={(e) => setNewPrompt(e.target.value)}
          placeholder="Enter new prompt"
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
