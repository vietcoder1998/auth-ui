import { Form, Modal, Select } from 'antd';
import React from 'react';
import AIGenerateInput from '../../../components/AIGenerateInput.tsx';

export interface AdminFaqCreateModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (values: any) => void;
  loading?: boolean;
  promptOptions?: Array<{ value: string; label: string }>;
}

const typeOptions = [
  { value: 'manual', label: 'Manual' },
  { value: 'agent', label: 'Agent' },
  { value: 'doc_input', label: 'Document Input' },
  { value: 'prompt', label: 'Prompt History' },
];

const AdminFaqCreateModal: React.FC<AdminFaqCreateModalProps> = ({
  open,
  onCancel,
  onOk,
  loading,
  promptOptions,
}) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onOk(values);
      form.resetFields();
    } catch {}
  };

  return (
    <Modal
      title="Add FAQ"
      open={open}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={handleOk}
      confirmLoading={loading}
      okText="Create"
      destroyOnHidden
    >
      <Form form={form} layout="vertical" initialValues={{ type: 'manual' }}>
        <Form.Item
          name="question"
          label="Question"
          rules={[{ required: true, message: 'Please enter the question' }]}
        >
          <AIGenerateInput
            textarea
            rows={2}
            placeholder="Enter question or generate with AI..."
            prompt="Generate a FAQ question"
          />
        </Form.Item>
        <Form.Item
          name="answer"
          label="Answer"
          rules={[{ required: true, message: 'Please enter the answer' }]}
        >
          <AIGenerateInput
            textarea
            rows={3}
            placeholder="Enter answer or generate with AI..."
            prompt="Generate a FAQ answer"
          />
        </Form.Item>
        <Form.Item name="type" label="Type" rules={[{ required: true }]}>
          <Select options={typeOptions} />
        </Form.Item>
        {promptOptions && (
          <Form.Item name="promptId" label="Prompt History" rules={[{ required: false }]}>
            <Select
              options={promptOptions}
              showSearch
              allowClear
              placeholder="Select prompt history (optional)"
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default AdminFaqCreateModal;
