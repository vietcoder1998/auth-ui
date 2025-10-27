import React from 'react';
import { Modal, Form, Input } from 'antd';

interface ToolCommandCreateModalProps {
  visible: boolean;
  onCancel: () => void;
  onCreate: (values: any) => void;
  form: any;
}

const ToolCommandCreateModal: React.FC<ToolCommandCreateModalProps> = ({
  visible,
  onCancel,
  onCreate,
  form,
}) => {
  return (
    <Modal
      title="Add Tool Command"
      open={visible}
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values: any) => {
            onCreate(values);
          })
          .catch(() => {});
      }}
      okText="Create"
    >
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          {' '}
          <Input />{' '}
        </Form.Item>
        <Form.Item name="description" label="Description">
          {' '}
          <Input.TextArea rows={2} />{' '}
        </Form.Item>
        <Form.Item name="command" label="Command" rules={[{ required: true }]}>
          {' '}
          <Input placeholder="e.g., execute, query, transform" />{' '}
        </Form.Item>
        <Form.Item name="parameters" label="Parameters (JSON)">
          {' '}
          <Input.TextArea rows={3} placeholder='{"param1": "value1", "param2": "value2"}' />{' '}
        </Form.Item>
        <Form.Item name="toolId" label="Tool ID" rules={[{ required: true }]}>
          {' '}
          <Input placeholder="Associated tool ID" />{' '}
        </Form.Item>
        <Form.Item name="enabled" label="Enabled" valuePropName="checked">
          {' '}
          <Input type="checkbox" />{' '}
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ToolCommandCreateModal;
