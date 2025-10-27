import React, { useState } from 'react';
import { Modal, Button, message } from 'antd';
import AIGenerateInput from '../../../components/AIGenerateInput.tsx';

interface PromptDetailModalProps {
  open: boolean;
  onCancel: () => void;
  prompt: any | null;
}

const PromptDetailModal: React.FC<PromptDetailModalProps> = ({ open, onCancel, prompt }) => {
  const [sampleInput, setSampleInput] = useState('');
  const [output, setOutput] = useState('');
  if (!prompt) return null;
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      title={
        <span>
          Prompt Detail (ID: <span style={{ color: '#1890ff' }}>{prompt.id}</span>
          {prompt.conversationTitle || prompt.conversationId ? (
            <span style={{ marginLeft: 12, color: '#52a2ff', fontWeight: 500 }}>
              {prompt.conversationTitle || prompt.conversationId}
            </span>
          ) : null}
          )
        </span>
      }
    >
      <div>
        <div style={{ marginBottom: 8 }}>
          <b>Prompt:</b>
          <pre style={{ whiteSpace: 'pre-wrap', marginBottom: 4 }}>{prompt.prompt}</pre>
        </div>
        {prompt.conversationId && (
          <div style={{ marginBottom: 8 }}>
            <b>Conversation:</b> {prompt.conversationTitle || prompt.conversationId}
          </div>
        )}
        {prompt.agent && (
          <div style={{ marginBottom: 8 }}>
            <b>Agent:</b> {prompt.agent.name || prompt.agent.id} ({prompt.agent.type || 'N/A'})
          </div>
        )}
        {prompt.updatedAt && (
          <div style={{ marginBottom: 8, fontSize: 12, color: '#aaa' }}>
            Updated: {new Date(prompt.updatedAt).toLocaleString()}
          </div>
        )}
        {/* Sample input and output */}
        <div style={{ marginTop: 16, marginBottom: 8 }}>
          <b>Sample Input:</b>
          <AIGenerateInput
            value={sampleInput}
            onChange={setSampleInput}
            prompt={prompt.prompt}
            placeholder="Enter sample input..."
            textarea={true}
            rows={3}
            apiPath="/admin/prompts/generate"
          />
        </div>
        <div style={{ marginTop: 16, marginBottom: 8 }}>
          <b>Output:</b>
          <pre style={{ whiteSpace: 'pre-wrap', marginBottom: 4 }}>{output}</pre>
        </div>
        {/* Add button to test prompt for conversation */}
        {prompt.conversationId && (
          <Button
            type="primary"
            onClick={async () => {
              // Example: send sampleInput and prompt to backend for output
              try {
                const res = await fetch('/admin/prompts/generate', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ prompt: prompt.prompt, input: sampleInput }),
                });
                const data = await res.json();
                if (data?.data?.data) {
                  setOutput(data.data.data);
                  message.success('Output generated');
                } else {
                  setOutput('');
                  message.error('No output returned');
                }
              } catch (err) {
                setOutput('');
                message.error('Failed to generate output');
              }
            }}
            style={{ marginTop: 12 }}
          >
            Test Prompt in Conversation
          </Button>
        )}
      </div>
    </Modal>
  );
};

export default PromptDetailModal;
