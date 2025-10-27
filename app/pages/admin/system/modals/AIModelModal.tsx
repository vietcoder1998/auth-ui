import { Modal, Form, Input, Select } from 'antd';
import { useEffect } from 'react';
export interface AIModelModalProps {
  visible: boolean;
  editingModel?: any | null;
  onOk: (values: any) => void;
  onCancel: () => void;
  platformOptions?: Array<{ label: string; value: string }>;
}

export default function AIModelModal({
  visible,
  editingModel,
  onOk,
  onCancel,
  platformOptions = [],
}: AIModelModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (editingModel) {
      // Map platformId from platform object if present
      const initialValues = {
        ...editingModel,
        platformId:
          typeof editingModel.platformId === 'string'
            ? editingModel.platformId
            : editingModel.platform?.id || '',
      };
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [editingModel, form]);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        onOk(values);
      })
      .catch(() => {});
  };

  return (
    <Modal
      title={editingModel ? 'Edit AI Model' : 'Add AI Model'}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      okText={editingModel ? 'Update' : 'Create'}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please enter model name' }]}
        >
          <Input placeholder="Model name" />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <Input.TextArea placeholder="Model description" autoSize={{ minRows: 2, maxRows: 6 }} />
        </Form.Item>
        <Form.Item label="Type" name="type">
          <Input placeholder="Model type (e.g. gpt, claude, gemini)" />
        </Form.Item>
        <Form.Item label="Platform" name="platformId">
          <Select placeholder="Select platform" allowClear showSearch optionFilterProp="label">
            {platformOptions.map((opt: { label: string; value: string }) => (
              <Select.Option key={opt.value} value={opt.value} label={opt.label}>
                {opt.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
