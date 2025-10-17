import React, { useEffect, useState } from 'react';
import { adminApi } from '../../apis/admin.api.ts';
import { Table, Button, Spin, Space, Typography, Modal, Input, Form, Select, Tag } from 'antd';
import { PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined, KeyOutlined, SearchOutlined } from '@ant-design/icons';
import AddRoleModal from '../modals/AddRoleModal.tsx';
import AddMissingPermissionsModal from './modals/AddMissingPermissionsModal.tsx';

import CommonSearch from '../../components/CommonSearch.tsx';

const { Title } = Typography;

export default function AdminRolePage() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addPermissionModalVisible, setAddPermissionModalVisible] = useState(false);
  const [missingPermissionsModalVisible, setMissingPermissionsModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [selectedRoleForPermission, setSelectedRoleForPermission] = useState<any>(null);
  const [selectedRoleForMissingPermissions, setSelectedRoleForMissingPermissions] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [form] = Form.useForm();
  const [permissionForm] = Form.useForm();

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getRoles();
      setRoles(res.data.data);
    } catch {
      setRoles([]);
    }
    setLoading(false);
  };

  const fetchPermissions = async () => {
    setPermissionsLoading(true);
    try {
      const res = await adminApi.getPermissions();
      setPermissions(res.data.data);
    } catch {
      setPermissions([]);
    }
    setPermissionsLoading(false);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    form.setFieldsValue({
      name: role.name,
      description: role.description,
      permissions: role.permissions?.map((p: any) => p.id) || []
    });
    setEditModalVisible(true);
  };

  const handleEditSave = async () => {
    try {
      const values = await form.validateFields();
      setEditLoading(true);
      await adminApi.updateRole(editingRole.id, values);
      setEditModalVisible(false);
      setEditingRole(null);
      fetchRoles();
    } catch (error) {
      console.error('Failed to update role:', error);
    } finally {
      setEditLoading(false);
    }
  };

  const handleAddPermissionToRole = (role: Role) => {
    setSelectedRoleForPermission(role);
    setAddPermissionModalVisible(true);
  };

  const handlePermissionCreated = () => {
    fetchRoles();
    fetchPermissions();
    setAddPermissionModalVisible(false);
    setSelectedRoleForPermission(null);
  };

  const handleFindMissingPermissions = (role: Role) => {
    setSelectedRoleForMissingPermissions(role);
    setMissingPermissionsModalVisible(true);
  };

  const handleMissingPermissionsSuccess = () => {
    fetchRoles();
    setMissingPermissionsModalVisible(false);
    setSelectedRoleForMissingPermissions(null);
  };

  interface Role {
    id: number;
    name: string;
    createdAt?: string;
    [key: string]: any;
  }

  interface Permission {
    id: number;
    name: string;
    category?: string;
    [key: string]: any;
  }

  interface ColumnType {
    title: string;
    dataIndex?: string;
    key: string;
    width?: number;
    render?: (value: any, record: Role, index: number) => React.ReactNode;
    fixed?: 'left' | 'right';
  }

  const columns: ColumnType[] = [
    { 
      title: 'Created Date', 
      dataIndex: 'createdAt', 
      key: 'createdAt',
      width: 120,
      render: (createdAt: string) => {
        if (!createdAt) return <em style={{ color: '#999' }}>-</em>;
        const date = new Date(createdAt);
        return (
          <div>
            <div>{date.toLocaleDateString()}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{date.toLocaleTimeString()}</div>
          </div>
        );
      }
    },
    { title: 'Role Name', dataIndex: 'name', key: 'name', width: 150 },
    { 
      title: 'Description', 
      dataIndex: 'description', 
      key: 'description',
      width: 200,
      render: (description: string) => description || <em style={{ color: '#999' }}>No description</em>
    },
    { 
      title: 'Permissions', 
      dataIndex: 'permissions', 
      key: 'permissions',
      width: 350,
      render: (permissions: any[]) => (
        <div>
          <span style={{ marginRight: 8 }}>{permissions ? permissions.length : 0} permissions</span>
          {permissions && permissions.length > 0 && (
            <div style={{ marginTop: 4 }}>
              {permissions.slice(0, 3).map((perm: any) => (
                <Tag key={perm.id} style={{ margin: '2px', fontSize: '12px' }}>
                  {perm.name}
                </Tag>
              ))}
              {permissions.length > 3 && (
                <Tag style={{ margin: '2px', fontSize: '12px' }}>
                  +{permissions.length - 3} more
                </Tag>
              )}
            </div>
          )}
        </div>
      )
    },
    { 
      title: 'Actions', 
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, r) => (
        <Space size="small" direction="vertical">
          <Space size="small">
            <Button 
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(r)}
            >
              Edit
            </Button>
            <Button 
              size="small"
              icon={<KeyOutlined />}
              onClick={() => handleAddPermissionToRole(r)}
            >
              Add Permission
            </Button>
          </Space>
          <Space size="small">
            <Button 
              size="small"
              icon={<SearchOutlined />}
              onClick={() => handleFindMissingPermissions(r)}
              type="dashed"
            >
              Find Missing
            </Button>
          </Space>
          <Button 
            size="small"
            danger 
            icon={<DeleteOutlined />}
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete role "${r.name}"?`)) {
                adminApi.deleteRole(r.id).then(fetchRoles);
              }
            }}
            style={{ width: '100%' }}
          >
            Delete
          </Button>
        </Space>
      ) 
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ marginBottom: '16px' }}>Role Management</Title>
        
        <CommonSearch
          searchPlaceholder="Search roles..."
          onSearch={() => {}} // No search functionality for roles currently
          onRefresh={fetchRoles}
          loading={loading}
          extra={
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setAddModalVisible(true)}
            >
              Create Role
            </Button>
          }
        />
      </div>

      <Spin spinning={loading}>
        <Table
          dataSource={roles}
          columns={columns}
          rowKey="id"
          scroll={{ x: 1000 }}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} roles`
          }}
          style={{ backgroundColor: 'white', borderRadius: '8px' }}
        />
      </Spin>

      <AddRoleModal
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onSuccess={fetchRoles}
      />

      <Modal
        title={`Add New Permission to Role: ${selectedRoleForPermission?.name}`}
        open={addPermissionModalVisible}
        onCancel={() => {
          setAddPermissionModalVisible(false);
          setSelectedRoleForPermission(null);
          permissionForm.resetFields();
        }}
        onOk={async () => {
          try {
            const values = await permissionForm.validateFields();
            const permissionData = {
              ...values,
              roles: [selectedRoleForPermission?.id]
            };
            await adminApi.createPermission(permissionData);
            permissionForm.resetFields();
            handlePermissionCreated();
          } catch (error) {
            console.error('Failed to create permission:', error);
          }
        }}
        width={600}
      >
        <Form form={permissionForm} layout="vertical">
          <Form.Item
            name="name"
            label="Permission Name"
            rules={[{ required: true, message: 'Please input permission name!' }]}
          >
            <Input placeholder="Enter permission name (e.g., manage_reports)" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please input description!' }]}
          >
            <Input.TextArea rows={3} placeholder="Enter permission description" />
          </Form.Item>
          <Form.Item
            name="category"
            label="Category"
            initialValue="other"
          >
            <Select placeholder="Select category">
              <Select.Option value="user">User</Select.Option>
              <Select.Option value="role">Role</Select.Option>
              <Select.Option value="permission">Permission</Select.Option>
              <Select.Option value="system">System</Select.Option>
              <Select.Option value="content">Content</Select.Option>
              <Select.Option value="report">Report</Select.Option>
              <Select.Option value="api">API</Select.Option>
              <Select.Option value="other">Other</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="route"
            label="Route (Optional)"
          >
            <Input placeholder="e.g., /api/admin/reports" />
          </Form.Item>
          <Form.Item
            name="method"
            label="HTTP Method (Optional)"
          >
            <Select placeholder="Select HTTP method" allowClear>
              <Select.Option value="GET">GET</Select.Option>
              <Select.Option value="POST">POST</Select.Option>
              <Select.Option value="PUT">PUT</Select.Option>
              <Select.Option value="DELETE">DELETE</Select.Option>
              <Select.Option value="PATCH">PATCH</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Edit Role"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingRole(null);
          form.resetFields();
        }}
        onOk={handleEditSave}
        confirmLoading={editLoading}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Role Name"
            rules={[{ required: true, message: 'Please input role name!' }]}
          >
            <Input placeholder="Enter role name" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={3} placeholder="Enter role description" />
          </Form.Item>
          <Form.Item
            name="permissions"
            label="Permissions"
          >
            <Select
              mode="multiple"
              placeholder="Select permissions"
              loading={permissionsLoading}
              showSearch
              optionFilterProp="label"
              style={{ width: '100%' }}
              options={permissions.map((perm: any) => ({
                value: perm.id,
                label: perm.name,
                title: perm.description
              }))}
              tagRender={(props) => {
                const { label, closable, onClose } = props;
                return (
                  <Tag
                    color="blue"
                    closable={closable}
                    onClose={onClose}
                    style={{ margin: '2px' }}
                  >
                    {label}
                  </Tag>
                );
              }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Missing Permissions Modal */}
      <AddMissingPermissionsModal
        visible={missingPermissionsModalVisible}
        onCancel={() => setMissingPermissionsModalVisible(false)}
        onSuccess={handleMissingPermissionsSuccess}
        role={selectedRoleForMissingPermissions}
      />
    </div>
  );
}
