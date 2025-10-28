import { Form, FormInstance, Input, Modal, Select } from 'antd';
import React, { useEffect } from 'react';

interface EntityMethodModalProps {
  visible: boolean;
  editingEntityMethod: any;
  entities: Array<{ id: string; name: string }>;
  form: FormInstance;
  onCancel: () => void;
  onCreate: (values: any) => void;
  onEdit: (values: any) => void;
}

const EntityMethodModal: React.FC<EntityMethodModalProps> = ({
  visible,
  editingEntityMethod,
  entities,
  form,
  onCancel,
  onCreate,
  onEdit,
}) => {
  useEffect(() => {
    if (visible && editingEntityMethod) {
      form.setFieldsValue(editingEntityMethod);
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, editingEntityMethod, form]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      if (editingEntityMethod) {
        onEdit(values);
      } else {
        onCreate(values);
      }
    });
  };

  return (
    <Modal
      title={editingEntityMethod ? 'Edit Entity Method' : 'Create Entity Method'}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Please enter method name' }]}
        >
          <Input placeholder="e.g., getById, create, update, delete" />
        </Form.Item>

        <Form.Item
          name="entityId"
          label="Entity"
          rules={[{ required: true, message: 'Please select at least one entity' }]}
        >
          <Select
            mode="multiple"
            placeholder="Select entities"
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={entities.map((entity) => ({
              value: entity.id,
              label: entity.name,
            }))}
          />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={4} placeholder="Description of what this method does" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EntityMethodModal;
