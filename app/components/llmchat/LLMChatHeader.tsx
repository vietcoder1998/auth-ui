import { PlusOutlined, ReloadOutlined, RobotOutlined, SettingOutlined } from '@ant-design/icons';
import { Badge, Button, Select, Typography } from 'antd';
import { Agent, Conversation } from '../LLMChat.tsx';

const { Option } = Select;
const { Text } = Typography;

interface LLMChatHeaderProps {
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

export function LLMChatHeader({
  agents,
  selectedAgent,
  setSelectedAgent,
  isLoadingAgents,
  conversations,
  selectedConversation,
  setSelectedConversation,
  createNewConversation,
  handleRefresh,
}: LLMChatHeaderProps) {
  return (
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
          style={{ width: '160px', flexShrink: 0, fontSize: 8 }}
          size="small"
          placeholder="Agent"
          value={selectedAgent}
          onChange={setSelectedAgent}
          loading={isLoadingAgents}
          suffixIcon={<RobotOutlined />}
        >
          {agents.map((agent) => (
            <Option key={agent.id} value={agent.id} style={{ fontSize: 8 }}>
              <Badge
                status={agent.isActive ? 'success' : 'default'}
                style={{ marginRight: '4px' }}
              />
              <p>{agent.name}</p>
            </Option>
          ))}
        </Select>
        {selectedAgent && (
          <>
            <Select
              style={{ flex: 1, minWidth: '80px', fontSize: 8 }}
              size="small"
              placeholder="Chat"
              value={selectedConversation}
              onChange={setSelectedConversation}
              allowClear
              optionLabelProp="label"
            >
              {conversations.map((conv) => (
                <Option key={conv.id} value={conv.id} label={conv.title}>
                  <Text strong style={{ fontSize: '12px' }}>
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
        <Button type="text" icon={<SettingOutlined />} size="small" style={{ flexShrink: 0 }} />
      </div>
    </div>
  );
}
