import { UploadOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import React from 'react';
import { Agent, Conversation } from './LLMChat.tsx';
import { LLMChatFiles } from './LLMChatFiles.tsx';
import { LLMInputAction } from './LLMInputAction.tsx';

const { TextArea } = Input;

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string | null;
}

interface LLMChatInputProps {
  inputValue: string;
  setInputValue: (val: string) => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
  handleFileUpload: (file: File) => Promise<boolean>;
  uploadedFiles: UploadedFile[];
  removeFile: (id: string) => void;
  isDragOver: boolean;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  sendMessage: () => void;
  selectedAgentData?: Agent | null;
  // Header props
  agents: Agent[];
  selectedAgent: string;
  setSelectedAgent: (id: string) => void;
  isLoadingAgents: boolean;
  conversations: Conversation[];
  selectedConversation: string;
  setSelectedConversation: (id: string) => void;
  createNewConversation: () => void;
  handleRefresh: () => void;
}

export function LLMChatInput({
  inputValue,
  setInputValue,
  handleKeyPress,
  isLoading,
  handleFileUpload,
  uploadedFiles,
  removeFile,
  isDragOver,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  sendMessage,
  selectedAgentData,
  // Header props
  agents,
  selectedAgent,
  setSelectedAgent,
  isLoadingAgents,
  conversations,
  selectedConversation,
  setSelectedConversation,
  createNewConversation,
  handleRefresh,
}: LLMChatInputProps) {
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleCommandResult = React.useCallback(
    (result: string) => {
      setInputValue(result);
    },
    [setInputValue]
  );

  const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setInputValue(value);
    }, 200);
  }, []);

  return (
    <>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Drag and Drop Overlay */}
        {isDragOver && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(24, 144, 255, 0.1)',
              border: '2px dashed #1890ff',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              color: '#1890ff',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <UploadOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
              <div>Drop files here to upload context</div>
            </div>
          </div>
        )}
        {/* Uploaded Files Display */}
        <LLMChatFiles uploadedFiles={uploadedFiles} removeFile={removeFile} />
        <div
          style={{
            background: '#f6f8fa',
            padding: '8px 16px 32px 16px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            border: '1px solid #e4e7ec',
            gap: 8,
            marginTop: 8,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
          }}
        >
          {/* Controls Row moved to bottom right */}
          <TextArea
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder={`Message ${selectedAgentData?.name || 'AI Agent'}...`}
            autoSize={{ minRows: 1, maxRows: 4 }}
            style={{
              border: 'none',
              background: 'transparent',
              boxShadow: 'none',
              resize: 'none',
              fontSize: 12,
              padding: 0,
              outline: 'none',
              minHeight: 88,
            }}
            disabled={isLoading}
          />
          <LLMInputAction
            inputValue={inputValue}
            isLoading={isLoading}
            handleFileUpload={handleFileUpload}
            uploadedFiles={uploadedFiles}
            sendMessage={sendMessage}
            selectedAgentData={selectedAgentData}
            agents={agents}
            selectedAgent={selectedAgent}
            setSelectedAgent={setSelectedAgent}
            conversations={conversations}
            selectedConversation={selectedConversation}
            setSelectedConversation={setSelectedConversation}
            createNewConversation={createNewConversation}
            onCommandResult={handleCommandResult}
          />
        </div>
      </div>
    </>
  );
}
