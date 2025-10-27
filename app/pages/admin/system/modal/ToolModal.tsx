import React from 'react';
import { Modal, Form, Input, Select, message } from 'antd';

interface Tool {
  id: string;
  name: string;
  type: string;
  config: string;
  enabled: boolean;
  createdAt: string;
}

interface ToolModalProps {
  visible: boolean;
  editingTool: Tool | null;
  availableTools: Tool[];
  form: any;
  onCancel: () => void;
  onCreate: (values: any) => Promise<void>;
  onEdit: (values: any) => Promise<void>;
}

const ToolModal: React.FC<ToolModalProps> = ({
  visible,
  editingTool,
  availableTools,
  form,
  onCancel,
  onCreate,
  onEdit,
}) => {
  const handleOk = () => {
    form
      .validateFields()
      .then((values: any) => {
        if (editingTool) {
          onEdit(values);
        } else {
          onCreate(values);
        }
      })
      .catch(() => {});
  };

  return (
    <Modal
      title={editingTool ? 'Edit Tool' : 'Add Tool'}
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      okText={editingTool ? 'Update' : 'Create'}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="type" label="Type" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        {/* Related tools: multi-select with search */}
        <Form.Item name="relatedToolIds" label="Related Tools">
          <Select
            mode="multiple"
            allowClear
            showSearch
            placeholder="Select related tools"
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
            }
          >
            {availableTools.map((t) => (
              <Select.Option key={t.id} value={t.id}>
                {t.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="config" label="Config">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name="enabled" label="Enabled" valuePropName="checked">
          <Input type="checkbox" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ToolModal;
