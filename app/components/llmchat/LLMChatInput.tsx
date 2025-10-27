import { SendOutlined, UploadOutlined, ToolOutlined } from '@ant-design/icons';
import { Button, Input, Tooltip, Typography, Upload, Popover, List, Tag, Spin } from 'antd';
import React, { useState, useEffect } from 'react';
import { Agent } from '../LLMChat.tsx';
import { LLMChatFiles } from './LLMChatFiles.tsx';
import { ToolApi } from '~/apis/adminApi/ToolApi.ts';

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
  const [tools, setTools] = useState<any[]>([]);
  const [loadingTools, setLoadingTools] = useState(false);
  const [toolsVisible, setToolsVisible] = useState(false);

  // Fetch tools when agent changes
  useEffect(() => {
    if (selectedAgentData?.id) {
      fetchAgentTools();
    } else {
      setTools([]);
    }
  }, [selectedAgentData?.id]);

  const fetchAgentTools = async () => {
    if (!selectedAgentData?.id) return;

    setLoadingTools(true);
    try {
      const response = await ToolApi.getToolsByAgent(selectedAgentData.id);
      setTools(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch tools:', error);
      setTools([]);
    } finally {
      setLoadingTools(false);
    }
  };

  const toolsContent = (
    <div style={{ width: 300, maxHeight: 400, overflow: 'auto' }}>
      {loadingTools ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin />
        </div>
      ) : tools.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
          No tools available for this agent
        </div>
      ) : (
        <List
          size="small"
          dataSource={tools}
          renderItem={(tool: any) => (
            <List.Item key={tool.id}>
              <List.Item.Meta
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {tool.name}
                    {tool.enabled && (
                      <Tag color="green" style={{ fontSize: '10px' }}>
                        Enabled
                      </Tag>
                    )}
                  </div>
                }
                description={
                  <div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {tool.description || 'No description'}
                    </div>
                    <Tag style={{ fontSize: '10px', marginTop: 4 }}>{tool.type}</Tag>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );

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
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={`Message ${selectedAgentData?.name || 'AI Agent'}...`}
          autoSize={{ minRows: 1, maxRows: 4 }}
          style={{ flex: 1 }}
          disabled={isLoading}
        />
        {/* Tools Button */}
        {selectedAgentData && (
          <Popover
            content={toolsContent}
            title={`Tools for ${selectedAgentData.name}`}
            trigger="click"
            open={toolsVisible}
            onOpenChange={setToolsVisible}
            placement="topRight"
          >
            <Tooltip title="View agent tools">
              <Button
                icon={<ToolOutlined />}
                disabled={isLoading}
                type={tools.length > 0 ? 'default' : 'dashed'}
              >
                {tools.length > 0 && <span style={{ fontSize: '10px' }}>{tools.length}</span>}
              </Button>
            </Tooltip>
          </Popover>
        )}
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
