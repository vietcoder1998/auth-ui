import React, { useState } from 'react';
import { Card, Select, List, Typography } from 'antd';
import AIGenerateInput from '../../components/AIGenerateInput.tsx';
import { AIGenerateProvider, useAIGenerateProvider } from '../../providers/AIGenerateProvider.tsx';

// Dummy data for prompts, agents, and conversations
const prompts = [
  'Summarize this document',
  'Translate to French',
  'Generate a blog post about AI',
  'Explain this code',
];
const agents = ['GPT-4', 'Claude', 'Gemini', 'Custom Agent'];
const conversations = ['Conversation #1', 'Conversation #2', 'Conversation #3'];

const { Title } = Typography;

function AdminAITestContent() {
  const { value, setValue } = useAIGenerateProvider();
  const [selectedPrompt, setSelectedPrompt] = useState(prompts[0]);
  const [selectedAgent, setSelectedAgent] = useState(agents[0]);
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);

  return (
    <Card
      title={<Title level={4}>AI Test Playground</Title>}
      style={{ maxWidth: 700, margin: '0 auto' }}
    >
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <div style={{ flex: 1 }}>
          <label>Prompt:</label>
          <Select
            value={selectedPrompt}
            onChange={setSelectedPrompt}
            options={prompts.map((p) => ({ label: p, value: p }))}
            style={{ width: '100%' }}
          />
        </div>
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
