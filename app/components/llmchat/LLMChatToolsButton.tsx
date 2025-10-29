import {
  DownOutlined,
  PlayCircleOutlined,
  RightOutlined,
  SettingOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { Button, Popover, Spin, Tag, Tooltip } from 'antd';
import { useState } from 'react';
import { ToolCommandApi } from '~/apis/admin.api.ts';
import { ToolApi } from '~/apis/adminApi/ToolApi.ts';
import { Agent } from './LLMChat.tsx';
import { LLMChatToolSelectionModal } from './LLMChatToolSelectionModal.tsx';

interface LLMChatToolsButtonProps {
  selectedAgentData?: Agent | null;
  isLoading: boolean;
  onCommandResult: (result: string) => void;
}

export function LLMChatToolsButton({
  selectedAgentData,
  isLoading,
  onCommandResult,
}: LLMChatToolsButtonProps) {
  const [tools, setTools] = useState<any[]>([]);
  const [toolCommands, setToolCommands] = useState<{ [key: string]: any[] }>({});
  const [loadingTools, setLoadingTools] = useState(false);
  const [loadingCommands, setLoadingCommands] = useState<{ [key: string]: boolean }>({});
  const [toolsVisible, setToolsVisible] = useState(false);
  const [expandedTools, setExpandedTools] = useState<{ [key: string]: boolean }>({});
  const [toolSelectionVisible, setToolSelectionVisible] = useState(false);

  const fetchAgentTools = async () => {
    if (!selectedAgentData?.id) return;

    setLoadingTools(true);
    try {
      const response = await ToolApi.getToolsByAgent(selectedAgentData.id);
      const toolsData = response.data?.data || [];
      setTools(toolsData);
      setToolCommands({});
      setExpandedTools({});

      // Fetch commands for all tools immediately
      toolsData.forEach((tool: any) => {
        fetchToolCommands(tool.id);
      });
    } catch (error) {
      console.error('Failed to fetch tools:', error);
      setTools([]);
    } finally {
      setLoadingTools(false);
    }
  };

  const fetchToolCommands = async (toolId: string) => {
    if (toolCommands[toolId] || loadingCommands[toolId]) return;

    setLoadingCommands((prev) => ({ ...prev, [toolId]: true }));
    try {
      const response = await ToolCommandApi.getToolCommandsByToolId(toolId);
      setToolCommands((prev) => ({ ...prev, [toolId]: response.data?.data || [] }));
    } catch (error) {
      console.error('Failed to fetch tool commands:', error);
      setToolCommands((prev) => ({ ...prev, [toolId]: [] }));
    } finally {
      setLoadingCommands((prev) => ({ ...prev, [toolId]: false }));
    }
  };

  const handleToolClick = (toolId: string) => {
    setExpandedTools((prev) => ({
      ...prev,
      [toolId]: !prev[toolId],
    }));
  };

  const handleProcessCommand = async (command: any) => {
    try {
      // Simple execution with default parameters
      const response = await ToolCommandApi.processCommand({
        id: command.id,
        name: command.name,
        command: command.command,
        description: command.description,
        toolId: command.toolId,
        params: '{}',
        exampleParams: '{}',
        input: {},
        executedBy: 'user',
        agentId: selectedAgentData?.id || 'default',
        type: 'tool',
      });

      // Send result to parent component
      const resultMessage = `Command "${command.name}" executed successfully!\n\nResult: ${JSON.stringify(response.data, null, 2)}`;
      onCommandResult(resultMessage);
    } catch (error: any) {
      const errorMessage = `Command "${command.name}" failed: ${error?.response?.data?.message || error.message}`;
      onCommandResult(errorMessage);
    }
  };

  // Fetch tools when popover opens - always refresh
  const handleToolsVisibleChange = (visible: boolean) => {
    setToolsVisible(visible);
    if (visible && selectedAgentData?.id) {
      // Always refresh tools when opening
      fetchAgentTools();
    }
  };

  const handleToolSelectionOpen = () => {
    setToolSelectionVisible(true);
  };

  const handleToolSelectionClose = () => {
    setToolSelectionVisible(false);
  };

  const handleToolsChange = () => {
    // Refresh the agent tools after assignment changes
    if (toolsVisible) {
      fetchAgentTools();
    }
  };

  const toolsContent = (
    <div style={{ width: 300, maxHeight: 350, overflow: 'auto' }}>
      {/* Tool Management Header */}
      <div style={{ padding: '4px 0', borderBottom: '1px solid #f0f0f0', marginBottom: '6px' }}>
        <Button
          type="dashed"
          size="small"
          icon={<SettingOutlined />}
          onClick={handleToolSelectionOpen}
          style={{ width: '100%', fontSize: '11px', height: '24px' }}
        >
          Manage Tools
        </Button>
      </div>

      {loadingTools ? (
        <div style={{ textAlign: 'center', padding: '12px' }}>
          <Spin size="small" />
        </div>
      ) : tools.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '12px', color: '#999', fontSize: '11px' }}>
          No tools available
        </div>
      ) : (
        <div>
          {tools.map((tool: any) => (
            <div key={tool.id} style={{ marginBottom: '8px' }}>
              {/* Tool Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 8px',
                  background: '#f5f5f5',
                  borderRadius: '4px',
                  border: '1px solid #d9d9d9',
                  cursor: 'pointer',
                }}
                onClick={() => handleToolClick(tool.id)}
              >
                <Tooltip title={`${tool.description || 'No description'} | Type: ${tool.type}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
                    <span style={{ fontWeight: 500, fontSize: '11px' }}>{tool.name}</span>
                    <Tag
                      color={tool.enabled ? 'green' : 'red'}
                      style={{ fontSize: '9px', margin: 0, padding: '0 4px', lineHeight: '16px' }}
                    >
                      {tool.enabled ? 'ON' : 'OFF'}
                    </Tag>
                    {toolCommands[tool.id] && toolCommands[tool.id].length > 0 && (
                      <span style={{ fontSize: '9px', color: '#666' }}>
                        ({toolCommands[tool.id].length})
                      </span>
                    )}
                  </div>
                </Tooltip>
                <span style={{ fontSize: '10px', color: '#666' }}>
                  {expandedTools[tool.id] ? <DownOutlined /> : <RightOutlined />}
                </span>
              </div>

              {/* Tool Commands - Collapsible */}
              {expandedTools[tool.id] && (
                <div style={{ paddingLeft: '8px', paddingTop: '2px' }}>
                  {loadingCommands[tool.id] ? (
                    <div style={{ textAlign: 'center', padding: '8px' }}>
                      <Spin size="small" />
                      <div style={{ fontSize: '10px', color: '#999', marginTop: '2px' }}>
                        Loading...
                      </div>
                    </div>
                  ) : !toolCommands[tool.id] || toolCommands[tool.id].length === 0 ? (
                    <div style={{ fontSize: '10px', color: '#999', padding: '4px 6px' }}>
                      No commands
                    </div>
                  ) : (
                    toolCommands[tool.id].map((command: any) => (
                      <div
                        key={command.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '4px 6px',
                          background: '#fafafa',
                          borderRadius: '3px',
                          marginBottom: '2px',
                          border: '1px solid #e8e8e8',
                        }}
                      >
                        <Tooltip title={command.description || 'No description'}>
                          <div style={{ flex: 1, fontSize: '10px' }}>
                            <div style={{ fontWeight: 500 }}>{command.name}</div>
                            <Tag
                              color={command.enabled ? 'blue' : 'default'}
                              style={{
                                fontSize: '8px',
                                marginTop: '1px',
                                padding: '0 3px',
                                lineHeight: '14px',
                              }}
                            >
                              {command.enabled ? 'ON' : 'OFF'}
                            </Tag>
                          </div>
                        </Tooltip>
                        <Button
                          size="small"
                          type="primary"
                          icon={<PlayCircleOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProcessCommand(command);
                          }}
                          disabled={!command.enabled}
                          style={{ fontSize: '9px', height: '20px', padding: '0 6px' }}
                        >
                          Run
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (!selectedAgentData) {
    return null;
  }

  return (
    <>
      <Popover
        content={toolsContent}
        title={`Tools for ${selectedAgentData.name}`}
        trigger="click"
        open={toolsVisible}
        onOpenChange={handleToolsVisibleChange}
        placement="topRight"
      >
        <Tooltip title="View agent tools">
          <ToolOutlined
            disabled={isLoading}
            style={{
              border: tools.length === 0 ? 'default' : 'dashed 1px',
              cursor: 'pointer',
              borderRadius: 2,
            }}
          />
          {tools.length > 0 && <span style={{ fontSize: '10px' }}>{tools.length}</span>}
        </Tooltip>
      </Popover>

      {/* Tool Selection Modal */}
      <LLMChatToolSelectionModal
        visible={toolSelectionVisible}
        onCancel={handleToolSelectionClose}
        selectedAgentData={selectedAgentData}
        currentTools={tools}
        onToolsChange={handleToolsChange}
      />
    </>
  );
}
