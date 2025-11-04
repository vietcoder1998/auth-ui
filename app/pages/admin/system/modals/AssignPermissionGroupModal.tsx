import { Modal, Select, Tag, message, Spin } from 'antd';
import React, { useState, useEffect } from 'react';
import { adminApi } from '~/apis/admin/index.ts';

const { Option } = Select;

interface Permission {
  id: number;
  name: string;
  permissionGroup?: {
    id: string;
    name: string;
    description?: string;
  };
  [key: string]: any;
}

interface AssignPermissionGroupModalProps {
  visible: boolean;
  permission: Permission | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function AssignPermissionGroupModal({
  visible,
  permission,
  onCancel,
  onSuccess,
}: AssignPermissionGroupModalProps) {
  const [permissionGroups, setPermissionGroups] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fetchingGroups, setFetchingGroups] = useState(false);

  // Fetch permission groups when modal opens
  useEffect(() => {
    if (visible) {
      fetchPermissionGroups();
      // Set current group as selected
      setSelectedGroupId(permission?.permissionGroup?.id || '');
    }
  }, [visible, permission]);

  const fetchPermissionGroups = async () => {
    setFetchingGroups(true);
    try {
      const res = await adminApi.getPermissionGroups();
      setPermissionGroups(res.data.data || res.data || []);
    } catch (error) {
      console.error('Failed to fetch permission groups:', error);
      message.error('Failed to load permission groups');
      setPermissionGroups([]);
    } finally {
      setFetchingGroups(false);
    }
  };

  const handleSave = async () => {
    if (!permission) return;

    setLoading(true);
    try {
      if (selectedGroupId) {
        // Add permission to the selected group
        await adminApi.addPermissionsToGroup(selectedGroupId, {
          permissionIds: [permission.id.toString()],
        });
        message.success('Permission assigned to group successfully');
      } else {
        // Remove from current group if no group selected
        if (permission.permissionGroup?.id) {
          await adminApi.removePermissionsFromGroup(permission.permissionGroup.id, {
            permissionIds: [permission.id.toString()],
          });
          message.success('Permission removed from group successfully');
        }
      }

      onSuccess();
    } catch (error: any) {
      console.error('Failed to update permission group assignment:', error);
      message.error(
        `Failed to update permission group: ${
          error?.response?.data?.message || error.message || 'Unknown error'
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedGroupId('');
    onCancel();
  };

  return (
    <Modal
      title={`Assign "${permission?.name}" to Permission Group`}
      open={visible}
      onOk={handleSave}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Save Assignment"
      width={500}
      okButtonProps={{ disabled: fetchingGroups }}
    >
      <Spin spinning={fetchingGroups} tip="Loading permission groups...">
        <div style={{ marginBottom: 16 }}>
          <p>
            Select a permission group to assign this permission to, or select "None" to remove from
            current group:
          </p>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
            Current Group:
          </label>
          {permission?.permissionGroup ? (
            <Tag color="purple">{permission.permissionGroup.name}</Tag>
          ) : (
            <Tag color="default">Ungrouped</Tag>
          )}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
            Assign to Group:
          </label>
          <Select
            style={{ width: '100%' }}
            placeholder={fetchingGroups ? 'Loading groups...' : 'Select a permission group'}
            value={selectedGroupId || undefined}
            onChange={setSelectedGroupId}
            allowClear
            loading={fetchingGroups}
            disabled={fetchingGroups}
          >
            <Option value="">None (Remove from group)</Option>
            {permissionGroups.map((group: any) => (
              <Option key={group.id} value={group.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{group.name}</span>
                  {group.description && (
                    <span style={{ fontSize: '12px', color: '#666' }}>{group.description}</span>
                  )}
                </div>
              </Option>
            ))}
          </Select>
        </div>

        {selectedGroupId && !fetchingGroups && (
          <div style={{ marginTop: 12, padding: 12, backgroundColor: '#f0f2f5', borderRadius: 4 }}>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Selected Group:{' '}
              <strong>{permissionGroups.find((g) => g.id === selectedGroupId)?.name}</strong>
            </div>
            {permissionGroups.find((g) => g.id === selectedGroupId)?.description && (
              <div style={{ fontSize: '12px', color: '#888' }}>
                {permissionGroups.find((g) => g.id === selectedGroupId)?.description}
              </div>
            )}
          </div>
        )}
      </Spin>
    </Modal>
  );
}
