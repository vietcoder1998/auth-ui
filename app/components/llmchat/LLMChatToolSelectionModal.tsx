import { Button, Checkbox, Input, List, Modal, Spin, Tag } from 'antd';
import { useState, useEffect } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { ToolApi } from '~/apis/admin/ToolApi.ts';
import { Agent } from './LLMChat.tsx';

interface LLMChatToolSelectionModalProps {
  visible: boolean;
  onCancel: () => void;
  selectedAgentData?: Agent | null;
  currentTools: any[];
  onToolsChange?: () => void;
}

export function LLMChatToolSelectionModal({
  visible,
  onCancel,
  selectedAgentData,
  currentTools,
  onToolsChange,
}: LLMChatToolSelectionModalProps) {
  const [allAvailableTools, setAllAvailableTools] = useState<any[]>([]);
  const [filteredTools, setFilteredTools] = useState<any[]>([]);
  const [loadingAllTools, setLoadingAllTools] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedToolIds, setSelectedToolIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Fetch all available tools for selection
  const fetchAllAvailableTools = async () => {
    setLoadingAllTools(true);
    try {
      const response = await ToolApi.getTools();
      const tools = response.data?.data || [];
      setAllAvailableTools(tools);
      setFilteredTools(tools);
    } catch (error) {
      console.error('Failed to fetch all tools:', error);
      setAllAvailableTools([]);
      setFilteredTools([]);
    } finally {
      setLoadingAllTools(false);
    }
  };

  // Filter tools based on search term
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const filtered = allAvailableTools.filter(
      (tool) =>
        tool.name?.toLowerCase().includes(value.toLowerCase()) ||
        tool.description?.toLowerCase().includes(value.toLowerCase()) ||
        tool.type?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredTools(filtered);
  };

  // Initialize selected tools from current tools
  useEffect(() => {
    if (visible) {
      fetchAllAvailableTools();
      setSearchTerm(''); // Reset search when modal opens
      // Initialize selected tools with current agent tools
      setSelectedToolIds(currentTools.map((tool) => tool.id));
    }
  }, [visible, currentTools]);

  const handleToolToggle = (toolId: string, enabled: boolean) => {
    if (enabled) {
      // Add tool to selected list
      setSelectedToolIds((prev) => [...prev.filter((id) => id !== toolId), toolId]);
    } else {
      // Remove tool from selected list
      setSelectedToolIds((prev) => prev.filter((id) => id !== toolId));
    }
  };

  const handleSubmit = async () => {
    if (!selectedAgentData?.id) return;

    setSubmitting(true);
    try {
      // Call API to update agent tools
      await ToolApi.updateAgentTools(selectedAgentData.id, selectedToolIds);

      console.log('Agent tools updated successfully');

      // Notify parent component about changes
      if (onToolsChange) {
        onToolsChange();
      }

      // Close modal
      onCancel();
    } catch (error) {
      console.error('Failed to update agent tools:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={`Manage Tools for ${selectedAgentData?.name}`}
      open={visible}
      onCancel={onCancel}
      width={600}
      footer={[
        <Button key="close" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={submitting} onClick={handleSubmit}>
          Update Tools
        </Button>,
      ]}
    >
      <div style={{ marginBottom: '16px' }}>
        <span style={{ color: '#666', fontSize: '14px' }}>
          Select tools to assign to this AI agent. Enabled tools will be available for execution.
        </span>
        {selectedToolIds.length > 0 && (
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#1890ff' }}>
            {selectedToolIds.length} tool{selectedToolIds.length !== 1 ? 's' : ''} selected
          </div>
        )}
      </div>

      <div style={{ marginBottom: '16px' }}>
        <Input
          placeholder="Search tools by name, description, or type..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          allowClear
          style={{ width: '100%' }}
        />
      </div>

      {loadingAllTools ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px', color: '#666' }}>Loading available tools...</div>
        </div>
      ) : (
        <div>
          {filteredTools.length === 0 && searchTerm && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
              No tools found matching "{searchTerm}"
            </div>
          )}
          <List
            dataSource={filteredTools}
            renderItem={(tool: any) => {
              const isAssigned = selectedToolIds.includes(tool.id);
              return (
                <List.Item
                  style={{
                    padding: '12px 16px',
                    border: '1px solid #f0f0f0',
                    borderRadius: '6px',
                    marginBottom: '8px',
                  }}
                >
                  <List.Item.Meta
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Checkbox
                          checked={isAssigned}
                          onChange={(e) => handleToolToggle(tool.id, e.target.checked)}
                        />
                        <span>{tool.name}</span>
                        <Tag color={tool.enabled ? 'green' : 'red'} style={{ fontSize: '10px' }}>
                          {tool.enabled ? 'Enabled' : 'Disabled'}
                        </Tag>
                        <Tag color="blue" style={{ fontSize: '10px' }}>
                          {tool.type}
                        </Tag>
                      </div>
                    }
                    description={tool.description || 'No description available'}
                  />
                </List.Item>
              );
            }}
          />
        </div>
      )}
    </Modal>
  );
}
