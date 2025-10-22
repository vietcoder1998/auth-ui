import { Modal, Form, Input } from 'antd';
import { useEffect } from 'react';

interface AIModelModalProps {
  visible: boolean;
  editingModel?: any | null;
  onOk: (values: any) => void;
  onCancel: () => void;
}

export default function AIModelModal({ visible, editingModel, onOk, onCancel }: AIModelModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (editingModel) {
      form.setFieldsValue(editingModel);
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
      destroyOnClose
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
        <Form.Item label="Platform ID" name="platformId">
          <Input placeholder="Platform ID (optional)" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
