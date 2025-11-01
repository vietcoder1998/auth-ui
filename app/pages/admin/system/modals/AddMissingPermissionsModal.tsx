import React, { useEffect, useState } from 'react';
import { Modal, Table, Button, Input, Space, Tag, Typography, message, Checkbox } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { adminApi } from '~/apis/admin/index.ts';

const { Text } = Typography;

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  route?: string;
  method?: string;
}

interface AddMissingPermissionsModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  role: {
    id: string;
    name: string;
    description: string;
  } | null;
}

export default function AddMissingPermissionsModal({
  visible,
  onCancel,
  onSuccess,
  role,
}: AddMissingPermissionsModalProps) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    if (visible && role) {
      fetchMissingPermissions();
    }
  }, [visible, role, pagination.current, pagination.pageSize, searchText]);

  const fetchMissingPermissions = async () => {
    if (!role) return;

    setLoading(true);
    try {
      const response = await adminApi.getPermissionsNotInRole(role.id, {
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchText,
      });

      setPermissions(response.data.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data.total || 0,
      }));
    } catch (error) {
      console.error('Failed to fetch missing permissions:', error);
      message.error('Failed to fetch available permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPermission = (permissionId: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions((prev) => [...prev, permissionId]);
    } else {
      setSelectedPermissions((prev) => prev.filter((id) => id !== permissionId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPermissions(permissions.map((p) => p.id));
    } else {
      setSelectedPermissions([]);
    }
  };

  const handleAddPermissions = async () => {
    if (!role || selectedPermissions.length === 0) return;

    setAdding(true);
    try {
      await adminApi.addPermissionsToRole(role.id, selectedPermissions);
      message.success(
        `Successfully added ${selectedPermissions.length} permission(s) to role "${role.name}"`
      );
      setSelectedPermissions([]);
      onSuccess();
    } catch (error) {
      console.error('Failed to add permissions:', error);
      message.error('Failed to add permissions to role');
    } finally {
      setAdding(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleTableChange = (paginationInfo: any) => {
    setPagination((prev) => ({
      ...prev,
      current: paginationInfo.current,
      pageSize: paginationInfo.pageSize,
    }));
  };

  const isAllSelected = permissions.length > 0 && selectedPermissions.length === permissions.length;
  const isIndeterminate =
    selectedPermissions.length > 0 && selectedPermissions.length < permissions.length;

  const columns = [
    {
      title: (
        <Checkbox
          indeterminate={isIndeterminate}
          checked={isAllSelected}
          onChange={(e) => handleSelectAll(e.target.checked)}
        >
          Select All
        </Checkbox>
      ),
      key: 'select',
      width: 120,
      render: (_: any, record: Permission) => (
        <Checkbox
          checked={selectedPermissions.includes(record.id)}
          onChange={(e) => handleSelectPermission(record.id, e.target.checked)}
        />
      ),
    },
    {
      title: 'Permission Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name: string) => (
        <Text strong style={{ fontSize: '13px' }}>
          {name}
        </Text>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 250,
      render: (description: string) => (
        <Text style={{ fontSize: '12px', color: '#666' }}>{description || 'No description'}</Text>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: string) => (
        <Tag color="blue" style={{ fontSize: '11px' }}>
          {category}
        </Tag>
      ),
    },
    {
      title: 'Route',
      dataIndex: 'route',
      key: 'route',
      width: 180,
      render: (route: string, record: Permission) => (
        <div>
          {route && (
            <div style={{ fontSize: '11px', fontFamily: 'monospace' }}>
              <Tag
                color={
                  record.method === 'GET'
                    ? 'green'
                    : record.method === 'POST'
                      ? 'orange'
                      : record.method === 'PUT'
                        ? 'blue'
                        : record.method === 'DELETE'
                          ? 'red'
                          : 'default'
                }
              >
                {record.method}
              </Tag>
              <span style={{ color: '#666' }}>{route}</span>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <Modal
      title={
        <div>
          <PlusOutlined style={{ marginRight: 8 }} />
          Add Missing Permissions to "{role?.name}"
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={900}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="add"
          type="primary"
          loading={adding}
          disabled={selectedPermissions.length === 0}
          onClick={handleAddPermissions}
        >
          Add {selectedPermissions.length} Permission(s)
        </Button>,
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text type="secondary">
              Role: <Text strong>{role?.name}</Text> • Available Permissions:{' '}
              <Text strong>{pagination.total}</Text> • Selected:{' '}
              <Text strong style={{ color: '#1890ff' }}>
                {selectedPermissions.length}
              </Text>
            </Text>
          </div>

          <Input.Search
            placeholder="Search permissions by name, description, or category..."
            allowClear
            enterButton={<SearchOutlined />}
            onSearch={handleSearch}
            style={{ width: '100%' }}
          />
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={permissions}
        loading={loading}
        rowKey="id"
        size="small"
        scroll={{ y: 400 }}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} permissions`,
        }}
        onChange={handleTableChange}
      />

      {selectedPermissions.length > 0 && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            background: '#f0f7ff',
            border: '1px solid #d6e4ff',
            borderRadius: 6,
          }}
        >
          <Text strong style={{ color: '#1890ff' }}>
            Selected {selectedPermissions.length} permission(s):
          </Text>
          <div style={{ marginTop: 8, maxHeight: 100, overflowY: 'auto' }}>
            {selectedPermissions.map((id) => {
              const permission = permissions.find((p) => p.id === id);
              return permission ? (
                <Tag key={id} style={{ margin: '2px 4px 2px 0', fontSize: '11px' }} color="blue">
                  {permission.name}
                </Tag>
              ) : null;
            })}
          </div>
        </div>
      )}
    </Modal>
  );
}
