import React from 'react';
import { Button, Drawer, Space, Tooltip, Typography } from 'antd';
import { MessageOutlined, CloseOutlined } from '@ant-design/icons';
import LLMChat from './llmchat/LLMChat.tsx';

interface AdminChatWidgetProps {
  isChatCollapsed: boolean;
  setIsChatCollapsed: (v: boolean) => void;
}

const AdminChatWidget: React.FC<AdminChatWidgetProps> = ({
  isChatCollapsed,
  setIsChatCollapsed,
}) => (
  <>
    {/* Floating Button to Open Drawer */}
    {isChatCollapsed && (
      <Button
        type="primary"
        shape="circle"
        size="large"
        icon={<MessageOutlined />}
        onClick={() => setIsChatCollapsed(false)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />
    )}

    {/* Drawer */}
    <Drawer
      title={
        <Space>
          <MessageOutlined style={{ color: '#1890ff' }} />
          <Typography.Text strong>AI Assistant</Typography.Text>
        </Space>
      }
      placement="right"
      onClose={() => setIsChatCollapsed(true)}
      open={!isChatCollapsed}
      width={480}
      closeIcon={<CloseOutlined />}
      styles={{
        body: {
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        },
      }}
    >
      <LLMChat />
    </Drawer>
  </>
);

export default AdminChatWidget;
