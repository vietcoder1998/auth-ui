import React from 'react';
import { Button, Dropdown, Tooltip, Typography } from 'antd';
import { DragOutlined, ExpandOutlined, MinusOutlined, MessageOutlined } from '@ant-design/icons';
import LLMChat from '../components/LLMChat.tsx';

interface AdminChatWidgetProps {
  isChatCollapsed: boolean;
  setIsChatCollapsed: (v: boolean) => void;
  chatPosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  handlePositionChange: (pos: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left') => void;
}

const AdminChatWidget: React.FC<AdminChatWidgetProps> = ({
  isChatCollapsed,
  setIsChatCollapsed,
  chatPosition,
  handlePositionChange,
}) => (
  <div
    style={{
      position: 'fixed',
      width: '400px',
      height: isChatCollapsed ? '60px' : '500px',
      background: '#fff',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      zIndex: 1000,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      ...(chatPosition === 'bottom-right' && { bottom: '20px', right: '20px' }),
      ...(chatPosition === 'bottom-left' && { bottom: '20px', left: '20px' }),
      ...(chatPosition === 'top-right' && { top: '20px', right: '20px' }),
      ...(chatPosition === 'top-left' && { top: '20px', left: '20px' }),
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        padding: '12px 16px',
        borderBottom: isChatCollapsed ? 'none' : '1px solid #f0f0f0',
        background: '#fafafa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '48px',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <MessageOutlined style={{ color: '#1890ff' }} />
        <Typography.Text strong style={{ fontSize: '14px' }}>
          AI Assistant
        </Typography.Text>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Tooltip title="Change Position" placement="bottom">
          <Dropdown
            menu={{
              items: [
                {
                  key: 'top-left',
                  label: 'Top Left',
                  onClick: () => handlePositionChange('top-left'),
                },
                {
                  key: 'top-right',
                  label: 'Top Right',
                  onClick: () => handlePositionChange('top-right'),
                },
                {
                  key: 'bottom-left',
                  label: 'Bottom Left',
                  onClick: () => handlePositionChange('bottom-left'),
                },
                {
                  key: 'bottom-right',
                  label: 'Bottom Right',
                  onClick: () => handlePositionChange('bottom-right'),
                },
              ],
            }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              type="text"
              size="small"
              icon={<DragOutlined />}
              style={{
                color: '#666',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
          </Dropdown>
        </Tooltip>
        <Button
          type="text"
          size="small"
          icon={isChatCollapsed ? <ExpandOutlined /> : <MinusOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            setIsChatCollapsed(!isChatCollapsed);
          }}
          style={{ color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        />
      </div>
    </div>
    {!isChatCollapsed && (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <LLMChat />
      </div>
    )}
  </div>
);

export default AdminChatWidget;
