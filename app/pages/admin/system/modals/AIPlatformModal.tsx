import { Modal, Form, Input, Select, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { adminApi } from '~/apis/admin/index.ts';

interface AIPlatformModalProps {
  visible: boolean;
  onOk: (values: any) => void;
  onCancel: () => void;
  editingPlatform?: any;
}

export default function AIPlatformModal({
  visible,
  onOk,
  onCancel,
  editingPlatform,
}: AIPlatformModalProps) {
  const [form] = Form.useForm();
  const [models, setModels] = useState<any[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setModelsLoading(true);
      adminApi
        .getAIModels()
        .then((res: any) => {
          setModels(res.data?.data || []);
        })
        .catch(() => setModels([]))
        .finally(() => setModelsLoading(false));
      if (editingPlatform) {
        form.setFieldsValue(editingPlatform);
      } else {
        form.resetFields();
      }
    }
  }, [visible, editingPlatform]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onOk(values);
    } catch {}
  };

  return (
    <Modal
      open={visible}
      title={editingPlatform ? 'Edit AI Platform' : 'Add AI Platform'}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Platform Name"
          rules={[{ required: true, message: 'Please input the platform name' }]}
        >
          <Input placeholder="Platform name" />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={2} placeholder="Description (optional)" />
        </Form.Item>
        <Form.Item name="endpoint" label="API Endpoint">
          <Input placeholder="API endpoint URL (optional)" />
        </Form.Item>
        <Form.Item name="aiModelIds" label="AI Models">
          {modelsLoading ? (
            <Spin />
          ) : (
            <Select
              mode="multiple"
              placeholder="Select AI Models for this platform"
              options={models.map((m) => ({ label: m.name || m.id, value: m.id }))}
              showSearch
              allowClear
            />
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
}
