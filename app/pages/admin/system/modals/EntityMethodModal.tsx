import { Form, FormInstance, Input, Modal, Select, message, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { EntityMethodApiInstance, CreateEntityMethodData } from '~/apis/admin/EntityMethodApi.ts';
import { EntityApiInstance } from '~/apis/admin/EntityApi.ts';

interface EntityMethodModalProps {
  visible: boolean;
  editingEntityMethod: any;
  entities?: Array<{ id: string; name: string }>; // Make optional since we'll load them
  form: FormInstance;
  onCancel: () => void;
  onCreate: (values: any) => void;
  onEdit: (values: any) => void;
  onSuccess?: () => void;
}

const EntityMethodModal: React.FC<EntityMethodModalProps> = ({
  visible,
  editingEntityMethod,
  entities: propEntities,
  form,
  onCancel,
  onCreate,
  onEdit,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [entities, setEntities] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingEntities, setLoadingEntities] = useState(false);
  const [entitiesError, setEntitiesError] = useState(false);

  // Load entities when modal opens
  useEffect(() => {
    if (visible) {
      loadEntities();
    }
  }, [visible]);

  // Handle form data when modal opens or editing changes
  useEffect(() => {
    if (visible && editingEntityMethod) {
      // For editing, set entityId as an array since we're using multiple select
      const entityIds = Array.isArray(editingEntityMethod.entityId)
        ? editingEntityMethod.entityId
        : [editingEntityMethod.entityId];

      form.setFieldsValue({
        ...editingEntityMethod,
        entityIds, // Use entityIds for the form field
      });
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, editingEntityMethod, form]);

  // Use prop entities if provided, otherwise use loaded entities
  useEffect(() => {
    if (propEntities && propEntities.length > 0) {
      setEntities(propEntities);
    }
  }, [propEntities]);

  const loadEntities = async () => {
    if (propEntities && propEntities.length > 0) {
      // If entities are provided as props, use them
      setEntities(propEntities);
      setEntitiesError(false);
      return;
    }

    try {
      setLoadingEntities(true);
      setEntitiesError(false);

      const response = await EntityApiInstance.getAll();
      console.log(response);

      // Handle different response structures
      const entitiesData = response.data?.data || response.data || [];

      if (Array.isArray(entitiesData)) {
        const mappedEntities = entitiesData.map((entity: any) => ({
          id: entity.id,
          name: entity.name || entity.title || `Entity ${entity.id}`,
        }));
        setEntities(mappedEntities);

        if (mappedEntities.length === 0) {
          message.warning('No entities found. You may need to create entities first.');
        }
      } else {
        console.warn('Unexpected entities data structure:', entitiesData);
        setEntities([]);
        setEntitiesError(true);
      }
    } catch (error) {
      console.error('Failed to load entities:', error);
      setEntitiesError(true);
      message.error('Failed to load entities. Please try again.');
      setEntities([]);
    } finally {
      setLoadingEntities(false);
    }
  };

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      if (editingEntityMethod) {
        // For editing, use the original single entity approach
        const updateData = {
          ...values,
          entityId: Array.isArray(values.entityIds) ? values.entityIds[0] : values.entityIds,
        };
        delete updateData.entityIds;
        onEdit(updateData);
      } else {
        // For creating, handle multiple entities
        const createData: CreateEntityMethodData = {
          name: values.name,
          description: values.description,
          entityIds: values.entityIds || [],
        };

        if (createData.entityIds.length === 0) {
          message.error('Please select at least one entity');
          return;
        }

        if (entitiesError) {
          message.error('Please retry loading entities before creating methods');
          return;
        }

        // Use the API to create methods for multiple entities
        const results = await EntityMethodApiInstance.createForMultipleEntities(createData);

        // Check results and show appropriate messages
        const successCount = results.filter((r) => r.success).length;
        const failureCount = results.length - successCount;

        if (successCount > 0) {
          message.success(`Successfully created ${successCount} entity method(s)`);
        }

        if (failureCount > 0) {
          message.warning(`Failed to create ${failureCount} entity method(s)`);
        }

        // Call callbacks
        if (successCount > 0) {
          onCreate(createData);
          onSuccess?.();
        }
      }

      onCancel(); // Close modal after successful operation
    } catch (error) {
      console.error('Error in EntityMethodModal:', error);
      message.error('Failed to save entity method');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={editingEntityMethod ? 'Edit Entity Method' : 'Create Entity Method'}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      width={600}
      confirmLoading={loading}
      okText={editingEntityMethod ? 'Update' : 'Create'}
      okButtonProps={{ disabled: loadingEntities }}
    >
      <Spin spinning={loading || loadingEntities}>
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter method name' }]}
          >
            <Input placeholder="e.g., getById, create, update, delete" />
          </Form.Item>

          <Form.Item
            name="entityIds"
            label={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Entities
                {entitiesError && (
                  <span
                    onClick={loadEntities}
                    style={{
                      color: '#1890ff',
                      cursor: 'pointer',
                      fontSize: '12px',
                      textDecoration: 'underline',
                    }}
                  >
                    Retry
                  </span>
                )}
              </div>
            }
            rules={[{ required: true, message: 'Please select at least one entity' }]}
            help={
              entitiesError ? (
                <span style={{ color: '#ff4d4f' }}>
                  Failed to load entities. Click "Retry" to try again.
                </span>
              ) : editingEntityMethod ? (
                'Note: When editing, only the first selected entity will be used.'
              ) : (
                'Select multiple entities to create this method for all of them.'
              )
            }
          >
            <Select
              mode="multiple"
              placeholder={
                loadingEntities
                  ? 'Loading entities...'
                  : entitiesError
                    ? 'Failed to load entities'
                    : entities.length === 0
                      ? 'No entities available'
                      : 'Select entities'
              }
              showSearch
              optionFilterProp="children"
              loading={loadingEntities}
              disabled={loadingEntities || entitiesError}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={entities.map((entity) => ({
                value: entity.id,
                label: entity.name,
              }))}
              notFoundContent={
                loadingEntities
                  ? 'Loading...'
                  : entitiesError
                    ? 'Failed to load entities'
                    : 'No entities found'
              }
            />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} placeholder="Description of what this method does" />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default EntityMethodModal;
