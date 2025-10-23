import { SendOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Input, Tooltip, Typography, Upload } from 'antd';
import React from 'react';
import { Agent } from '../LLMChat.tsx';
import { LLMChatFiles } from './LLMChatFiles.tsx';

const { TextArea } = Input;
const { Text } = Typography;

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
}: LLMChatInputProps) {
  return (
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
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={`Message ${selectedAgentData?.name || 'AI Agent'}...`}
          autoSize={{ minRows: 1, maxRows: 4 }}
          style={{ flex: 1 }}
          disabled={isLoading}
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
      {selectedAgentData && (
        <Text type="secondary" style={{ fontSize: '12px', marginTop: '4px', display: 'block' }}>
          Model:{' '}
          {typeof selectedAgentData.model === 'string'
            ? selectedAgentData.model
            : selectedAgentData.model?.name || 'N/A'}{' '}
          • {selectedAgentData.description}
        </Text>
      )}
    </div>
  );
}
