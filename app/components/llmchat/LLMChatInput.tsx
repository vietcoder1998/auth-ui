import {
  PlusOutlined,
  ReloadOutlined,
  RobotOutlined,
  SendOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { Badge, Button, Input, Select, Tooltip, Typography, Upload } from 'antd';
import React from 'react';
import { Agent, Conversation } from '../LLMChat.tsx';
import { LLMChatFiles } from './LLMChatFiles.tsx';
import { LLMChatToolsButton } from './LLMChatToolsButton.tsx';

const { TextArea } = Input;
const { Text } = Typography;
const { Option } = Select;

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
      {/* Header Section */}
      <div style={{ padding: '8px 16px', borderBottom: '1px solid #f0f0f0' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            flexWrap: 'nowrap',
            overflow: 'hidden',
          }}
        >
          <Button
            type="text"
            size="small"
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            style={{ marginRight: 8 }}
            aria-label="Refresh"
          />
          <Select
            style={{ width: '160px', flexShrink: 0, fontSize: 10 }}
            placeholder="Agent"
            value={selectedAgent}
            onChange={setSelectedAgent}
            loading={isLoadingAgents}
            suffixIcon={<RobotOutlined />}
          >
            {agents.map((agent: Agent) => (
              <Option key={agent.id} value={agent.id} style={{ fontSize: 10, spacing: 2 }}>
                <p style={{ fontSize: 10, lineHeight: '8px' }}>
                  <Badge
                    status={agent.isActive ? 'success' : 'default'}
                    style={{ marginRight: '4px', fontSize: 10 }}
                  />
                  {agent.name}
                </p>
                <span style={{ fontSize: 10 }}>{agent?.model?.name}</span>
              </Option>
            ))}
          </Select>
          {selectedAgent && (
            <>
              <Select
                style={{ flex: 1, minWidth: '80px', fontSize: 10 }}
                placeholder="Chat"
                value={selectedConversation}
                onChange={setSelectedConversation}
                allowClear
                optionLabelProp="label"
              >
                {conversations.map((conv) => (
                  <Option key={conv.id} value={conv.id} label={conv.title} style={{ fontSize: 10 }}>
                    <Text strong style={{ fontSize: 10 }}>
                      {conv.title}
                    </Text>
                  </Option>
                ))}
              </Select>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={createNewConversation}
                size="small"
                style={{ flexShrink: 0 }}
              />
            </>
          )}
          {/* <Button type="text" icon={<SettingOutlined />} size="small" style={{ flexShrink: 0 }} /> */}
        </div>
      </div>

      {/* Input Section */}
      <div
        style={{ padding: '6px', position: 'relative' }}
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
          }}
        >
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
              fontSize: 10,
              padding: 0,
              outline: 'none',
              minHeight: 28,
            }}
            disabled={isLoading}
          />
          <div
            style={{
              position: 'absolute',
              right: 12,
              bottom: 8,
              display: 'flex',
              alignItems: 'flex-end',
              gap: 2,
            }}
          >
            <LLMChatToolsButton
              selectedAgentData={selectedAgentData}
              isLoading={isLoading}
              onCommandResult={handleCommandResult}
            />
            <Upload
              beforeUpload={handleFileUpload}
              showUploadList={false}
              multiple
              accept=".txt,.md,.json,.js,.ts,.jsx,.tsx,.css,.html,.xml,.csv,.py,.java,.cpp,.c,.h,.sql"
            >
              <Tooltip title="Upload context files">
                <Button
                  icon={<UploadOutlined />}
                  disabled={isLoading}
                  type="text"
                  size="small"
                  style={{
                    border: 'none',
                    background: 'none',
                    boxShadow: 'none',
                    height: 24,
                    width: 24,
                    minWidth: 24,
                    padding: 0,
                  }}
                />
              </Tooltip>
            </Upload>
            <Button
              type="primary"
              icon={<SendOutlined style={{ fontSize: 12 }} />}
              onClick={sendMessage}
              disabled={(!inputValue.trim() && uploadedFiles.length === 0) || isLoading}
              loading={isLoading}
              size="small"
              style={{
                borderRadius: 4,
                width: 28,
                height: 28,
                marginLeft: 2,
                padding: 0,
                fontSize: 12,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
