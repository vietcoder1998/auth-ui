import {
  PlusOutlined,
  ReloadOutlined,
  RobotOutlined,
  SendOutlined,
  SettingOutlined,
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
  const handleCommandResult = React.useCallback((result: string) => {
    setInputValue(result);
  }, []);

  const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
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
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <TextArea
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder={`Message ${selectedAgentData?.name || 'AI Agent'}...`}
            autoSize={{ minRows: 1, maxRows: 4 }}
            style={{ flex: 1 }}
            disabled={isLoading}
          />
          {/* Tools Button */}
          <LLMChatToolsButton
            selectedAgentData={selectedAgentData}
            isLoading={isLoading}
            onCommandResult={handleCommandResult}
          />
          {/* Upload Button */}
          <Upload
            beforeUpload={handleFileUpload}
            showUploadList={false}
            multiple
            accept=".txt,.md,.json,.js,.ts,.jsx,.tsx,.css,.html,.xml,.csv,.py,.java,.cpp,.c,.h,.sql"
          >
            <Tooltip title="Upload context files">
              <Button icon={<UploadOutlined />} disabled={isLoading} />
            </Tooltip>
          </Upload>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={sendMessage}
            disabled={(!inputValue.trim() && uploadedFiles.length === 0) || isLoading}
            loading={isLoading}
          />
        </div>
      </div>
    </>
  );
}
