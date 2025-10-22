import { Modal, Input, Button } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import React from 'react';

interface EditPromptModalProps {
  open: boolean;
  value: string;
  onChange: (v: string) => void;
  onOk: () => void;
  onCancel: () => void;
}

const EditPromptModal: React.FC<EditPromptModalProps> = ({
  open,
  value,
  onChange,
  onOk,
  onCancel,
}) => {
  return (
    <Modal
      title="Edit Prompt Detail"
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      okText={<SaveOutlined style={{ fontSize: 16 }} />}
      cancelText={<CloseOutlined style={{ fontSize: 16 }} />}
      footer={[
        <Button
          key="save"
          type="primary"
          icon={<SaveOutlined style={{ fontSize: 16 }} />}
          onClick={onOk}
        >
          Save
        </Button>,
        <Button key="cancel" icon={<CloseOutlined style={{ fontSize: 16 }} />} onClick={onCancel}>
          Cancel
        </Button>,
      ]}
    >
      <label htmlFor="edit-prompt-input">Prompt:</label>
      <Input.TextArea
        id="edit-prompt-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Edit prompt detail"
        autoSize={{ minRows: 3, maxRows: 6 }}
      />
    </Modal>
  );
};

export default EditPromptModal;
