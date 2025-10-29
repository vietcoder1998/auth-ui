import { Button, Checkbox, List, Modal, Spin, Tag } from 'antd';
import { useState } from 'react';
import { ToolApi } from '~/apis/adminApi/ToolApi.ts';
import { Agent } from '../LLMChat.tsx';

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
  const [loadingAllTools, setLoadingAllTools] = useState(false);

  // Fetch all available tools for selection
  const fetchAllAvailableTools = async () => {
    setLoadingAllTools(true);
    try {
      const response = await ToolApi.getTools();
      setAllAvailableTools(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch all tools:', error);
      setAllAvailableTools([]);
    } finally {
      setLoadingAllTools(false);
    }
  };

  const handleModalOpen = () => {
    if (visible) {
      fetchAllAvailableTools();
    }
  };

  const handleToolToggle = async (toolId: string, enabled: boolean) => {
    try {
      // Here you would implement the logic to assign/unassign tools to the agent
      // For now, we'll just show a message
      console.log(
        `${enabled ? 'Assign' : 'Unassign'} tool ${toolId} to agent ${selectedAgentData?.id}`
      );

      // Notify parent component about changes
      if (onToolsChange) {
        onToolsChange();
      }
    } catch (error) {
      console.error('Failed to toggle tool assignment:', error);
    }
  };

  // Fetch tools when modal becomes visible
  if (visible && allAvailableTools.length === 0 && !loadingAllTools) {
    handleModalOpen();
  }

  return (
    <Modal
      title={`Manage Tools for ${selectedAgentData?.name}`}
      open={visible}
      onCancel={onCancel}
      width={600}
      footer={[
        <Button key="close" onClick={onCancel}>
          Close
        </Button>,
      ]}
    >
      <div style={{ marginBottom: '16px' }}>
        <span style={{ color: '#666', fontSize: '14px' }}>
          Select tools to assign to this AI agent. Enabled tools will be available for execution.
        </span>
      </div>

      {loadingAllTools ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px', color: '#666' }}>Loading available tools...</div>
        </div>
      ) : (
        <List
          dataSource={allAvailableTools}
          renderItem={(tool: any) => {
            const isAssigned = currentTools.some((t) => t.id === tool.id);
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
      )}
    </Modal>
  );
}
