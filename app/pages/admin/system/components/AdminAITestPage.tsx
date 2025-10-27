import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Col, Input, List, Modal, Row, Select, Space, Typography } from 'antd';
import { useEffect, useState } from 'react';
import EditPromptModal from '~/components/EditPromptModal.tsx';
import { LLMDebugApi } from '../../../../apis/LLMDebugApi.ts';
import AIGenerateInput from '../../../../components/AIGenerateInput.tsx';
import {
  AIGenerateProvider,
  useAIGenerateProvider,
} from '../../../../providers/AIGenerateProvider.tsx';
const { Title } = Typography;

function AdminAITestContent() {
  const {
    value,
    setValue,
    agents,
    conversations,
    selectedAgent,
    setSelectedAgent,
    selectedConversation,
    setSelectedConversation,
    prompts,
    selectedPrompt,
    setSelectedPrompt,
    handleCreatePrompt,
  } = useAIGenerateProvider();
  const [modalOpen, setModalOpen] = useState(false);
  const [newPrompt, setNewPrompt] = useState('');
  const [editPromptModalOpen, setEditPromptModalOpen] = useState(false);
  const [editedPromptValue, setEditedPromptValue] = useState('');

  // Auto switch prompt when agent or conversation changes
  useEffect(() => {
    if (selectedAgent && selectedConversation) {
      setSelectedPrompt(prompts[0] || '');
    }
  }, [selectedAgent, selectedConversation, prompts]);

  // Auto switch agent/conversation when prompt changes
  useEffect(() => {
    if (!selectedPrompt) return;
    // Find agent and conversation that match the prompt (simple contains logic)
    let foundAgent = agents.find((a) => {
      const name = a.label || a.name || a.agentName || a.title || '';
      return selectedPrompt.toLowerCase().includes(name.toLowerCase());
    });
    let foundConversation = conversations.find((c) => {
      const name = c.label || c.name || c.title || c.id || '';
      return selectedPrompt.toLowerCase().includes(name.toLowerCase());
    });
    if (foundAgent) setSelectedAgent(foundAgent.value);
    if (foundConversation) setSelectedConversation(foundConversation.value);
  }, [selectedPrompt, agents, conversations]);

  return (
    <Card title={<Title level={4}>AI Test Playground</Title>}>
      <Row gutter={12} align="middle" style={{ marginBottom: 0 }}>
        <Col flex={1}>
          <Space direction="vertical" size={2} style={{ width: '100%' }}>
            <label htmlFor="agent-select">Agent:</label>
            <Select
              id="agent-select"
              value={selectedAgent ? selectedAgent.value : undefined}
              onChange={setSelectedAgent}
              options={agents}
              style={{ width: '100%' }}
              placeholder="Select an agent"
              optionLabelProp="label"
            />
          </Space>
        </Col>
        <Col flex={1}>
          <Space direction="vertical" size={2} style={{ width: '100%' }}>
            <label htmlFor="conversation-select">Conversation:</label>
            <Select
              id="conversation-select"
              value={selectedConversation ? selectedConversation.value : undefined}
              onChange={setSelectedConversation}
              options={conversations}
              style={{ width: '100%' }}
              placeholder="Select a conversation"
              optionLabelProp="label"
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
          // Edit prompt in context
          const updatedPrompts = prompts.map((p) => (p === selectedPrompt ? editedPromptValue : p));
          setSelectedPrompt(editedPromptValue);
          // Directly update context prompts
          // This is a workaround since context doesn't expose setPrompts
          // If needed, add setPrompts to context for full control
          // For now, just update selectedPrompt
          setEditPromptModalOpen(false);
        }}
        onCancel={() => setEditPromptModalOpen(false)}
      />
      <AIGenerateInput
        prompt={selectedPrompt}
        value={value}
        onChange={setValue}
        placeholder={`Type or generate with ${selectedAgent ? selectedAgent.label : ''}`}
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
        onOk={() => {
          handleCreatePrompt(newPrompt);
          setNewPrompt('');
          setModalOpen(false);
        }}
        onCancel={() => setModalOpen(false)}
        okText="Create"
      >
        <div style={{ marginBottom: 12 }}>
          <b>Agent:</b> {(selectedAgent && selectedAgent.label) || ''}
        </div>
        <div style={{ marginBottom: 12 }}>
          <b>Conversation:</b> {(selectedConversation && selectedConversation.label) || ''}
        </div>
        <label htmlFor="new-prompt-input">Prompt:</label>
        <Input.TextArea
          id="new-prompt-input"
          value={newPrompt}
          onChange={(e) => setNewPrompt(e.target.value)}
          placeholder="Enter new prompt"
          autoSize={{ minRows: 3, maxRows: 6 }}
          onPressEnter={() => {
            handleCreatePrompt(newPrompt);
            setNewPrompt('');
            setModalOpen(false);
          }}
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
