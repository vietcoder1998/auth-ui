import {
  MessageOutlined,
  PlusOutlined,
  RobotOutlined,
  SendOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { Badge, Tooltip, Typography, Upload } from 'antd';
import React from 'react';
import { Agent, Conversation } from './LLMChat.tsx';
import { LLMChatToolsButton } from './LLMChatToolsButton.tsx';

const { Text } = Typography;

interface LLMInputActionProps {
  inputValue: string;
  isLoading: boolean;
  handleFileUpload: (file: File) => Promise<boolean>;
  uploadedFiles: { id: string; name: string; size: number; type: string; content: string | null }[];
  sendMessage: () => void;
  selectedAgentData?: Agent | null;
  // Header props
  agents: Agent[];
  selectedAgent: string;
  setSelectedAgent: (id: string) => void;
  conversations: Conversation[];
  selectedConversation: string;
  setSelectedConversation: (id: string) => void;
  createNewConversation: () => void;
  onCommandResult: (result: string) => void;
}

export function LLMInputAction({
  inputValue,
  isLoading,
  handleFileUpload,
  uploadedFiles,
  sendMessage,
  selectedAgentData,
  agents,
  selectedAgent,
  setSelectedAgent,
  conversations,
  selectedConversation,
  setSelectedConversation,
  createNewConversation,
  onCommandResult,
}: LLMInputActionProps) {
  // Dropdown state for agent icon button
  const [agentDropdownOpen, setAgentDropdownOpen] = React.useState(false);
  // Dropdown state for conversation icon button
  const [conversationDropdownOpen, setConversationDropdownOpen] = React.useState(false);

  // Close agent dropdown on outside click
  React.useEffect(() => {
    if (!agentDropdownOpen) return;
    const handle = (e: MouseEvent) => {
      setAgentDropdownOpen(false);
    };
    window.addEventListener('mousedown', handle);
    return () => window.removeEventListener('mousedown', handle);
  }, [agentDropdownOpen]);

  // Close conversation dropdown on outside click
  React.useEffect(() => {
    if (!conversationDropdownOpen) return;
    const handle = (e: MouseEvent) => {
      setConversationDropdownOpen(false);
    };
    window.addEventListener('mousedown', handle);
    return () => window.removeEventListener('mousedown', handle);
  }, [conversationDropdownOpen]);

  return (
    <div
      style={{
        position: 'absolute',
        right: 12,
        bottom: 8,
        display: 'flex',
        alignItems: 'flex-end',
        gap: 5,
      }}
    >
      {/* Agent Icon Button with Dropdown */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative' }}>
          <Tooltip title={selectedAgentData?.name || 'Select Agent'}>
            <Badge count={agents.length} size="small" offset={[2, -2]}>
              <RobotOutlined
                style={{
                  fontSize: 18,
                  color: selectedAgentData ? '#1890ff' : '#888',
                  background: selectedAgentData ? '#e6f7ff' : 'transparent',
                  borderRadius: '50%',
                  padding: 2,
                  cursor: 'pointer',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setAgentDropdownOpen((open) => !open);
                }}
              />
            </Badge>
          </Tooltip>
        </div>
        {/* Bot name under icon */}
        {selectedAgentData && (
          <Text
            style={{
              fontSize: 8,
              color: '#666',
              textAlign: 'center',
              lineHeight: 1,
              marginTop: 2,
              maxWidth: 40,
              wordBreak: 'break-all',
            }}
          >
            {selectedAgentData.name}
          </Text>
        )}
        {/* Agent Dropdown */}
        {agentDropdownOpen && (
          <div
            style={{
              position: 'absolute',
              bottom: 28,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 100,
              background: '#fff',
              border: 'none',
              borderRadius: 4,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              minWidth: 140,
              padding: 4,
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {agents.map((agent: Agent) => (
              <div
                key={agent.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  background: selectedAgent === agent.id ? '#e6f7ff' : 'transparent',
                  borderRadius: 3,
                  fontSize: 10,
                }}
                onClick={() => {
                  setSelectedAgent(agent.id);
                  setAgentDropdownOpen(false);
                }}
              >
                <Badge
                  status={agent.isActive ? 'success' : 'default'}
                  style={{ marginRight: 4, fontSize: 10 }}
                />
                <span style={{ fontWeight: 500 }}>{agent.name}</span>
                {agent?.model?.name && (
                  <span style={{ marginLeft: 6, color: '#888' }}>{agent.model.name}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Conversation Select */}
      {selectedAgent && (
        <>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div style={{ position: 'relative' }}>
              <Tooltip
                title={
                  conversations.length === 0
                    ? 'No conversations available'
                    : selectedConversation
                      ? conversations.find((c) => c.id === selectedConversation)?.title
                      : 'Select Chat'
                }
              >
                <MessageOutlined
                  style={{
                    fontSize: 18,
                    color:
                      conversations.length === 0
                        ? '#ccc'
                        : selectedConversation
                          ? '#1890ff'
                          : '#888',
                    background: selectedConversation ? '#e6f7ff' : 'transparent',
                    borderRadius: '50%',
                    padding: 2,
                    cursor: conversations.length === 0 ? 'not-allowed' : 'pointer',
                  }}
                  onClick={(e) => {
                    if (conversations.length === 0) return;
                    e.stopPropagation();
                    setConversationDropdownOpen((open) => !open);
                  }}
                />
              </Tooltip>
            </div>
            {/* Conversation name under icon */}
            {selectedConversation && (
              <Text
                style={{
                  fontSize: 8,
                  color: '#666',
                  textAlign: 'center',
                  lineHeight: 1,
                  marginTop: 2,
                  maxWidth: 50,
                  wordBreak: 'break-all',
                }}
              >
                {conversations.find((c) => c.id === selectedConversation)?.title || 'Chat'}
              </Text>
            )}
            {/* Conversation Dropdown */}
            {conversationDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 28,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 100,
                  background: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  minWidth: 140,
                  padding: 4,
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                {conversations.length === 0 ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '8px 12px',
                      color: '#999',
                      fontSize: 10,
                    }}
                  >
                    <Text style={{ fontSize: 10, color: '#999' }}>Empty</Text>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <div
                      key={conv.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        background: selectedConversation === conv.id ? '#e6f7ff' : 'transparent',
                        borderRadius: 3,
                        fontSize: 10,
                      }}
                      onClick={() => {
                        setSelectedConversation(conv.id);
                        setConversationDropdownOpen(false);
                      }}
                    >
                      <Text strong style={{ fontSize: 10 }}>
                        {conv.title}
                      </Text>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <Tooltip title="New chat">
            <PlusOutlined
              style={{ fontSize: 16, color: '#1890ff', marginLeft: 2, cursor: 'pointer' }}
              onClick={createNewConversation}
            />
          </Tooltip>
        </>
      )}
      {/* Tools, Upload, Send */}
      <LLMChatToolsButton
        selectedAgentData={selectedAgentData}
        isLoading={isLoading}
        onCommandResult={onCommandResult}
      />
      <Upload
        beforeUpload={handleFileUpload}
        showUploadList={false}
        multiple
        accept=".txt,.md,.json,.js,.ts,.jsx,.tsx,.css,.html,.xml,.csv,.py,.java,.cpp,.c,.h,.sql"
      >
        <Tooltip title="Upload context files">
          <UploadOutlined
            style={{
              fontSize: 18,
              color: isLoading ? '#ccc' : '#1890ff',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginLeft: 2,
            }}
          />
        </Tooltip>
      </Upload>
      <Tooltip title="Send">
        <SendOutlined
          style={{
            fontSize: 18,
            color:
              (!inputValue.trim() && uploadedFiles.length === 0) || isLoading ? '#ccc' : '#1890ff',
            cursor:
              (!inputValue.trim() && uploadedFiles.length === 0) || isLoading
                ? 'not-allowed'
                : 'pointer',
            marginLeft: 2,
          }}
          onClick={() => {
            if ((!inputValue.trim() && uploadedFiles.length === 0) || isLoading) return;
            sendMessage();
          }}
        />
      </Tooltip>
    </div>
  );
}
