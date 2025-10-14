import React, { useEffect, useState } from 'react';
import { adminApi } from '../apis/admin.api.ts';
import { Table, Button, Spin, Space, Typography, Modal, Input, Form } from 'antd';
import { PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AddRoleModal from './modals/AddRoleModal.tsx';

const { Title } = Typography;

export default function AdminRolePage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchRoles();
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

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    form.setFieldsValue(role);
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

  interface Role {
    id: number;
    name: string;
    [key: string]: any;
  }

  interface ColumnType {
    title: string;
    dataIndex?: string;
    key: string;
    width?: number;
    render?: (value: any, record: Role, index: number) => React.ReactNode;
  }

  const columns: ColumnType[] = [
    { title: 'Role Name', dataIndex: 'name', key: 'name' },
    { 
      title: 'Description', 
      dataIndex: 'description', 
      key: 'description',
      render: (description: string) => description || <em style={{ color: '#999' }}>No description</em>
    },
    { 
      title: 'Permissions', 
      dataIndex: 'permissions', 
      key: 'permissions',
      render: (permissions: any[]) => permissions ? permissions.length : 0
    },
    { 
      title: 'Actions', 
      key: 'actions',
      width: 150,
      render: (_, r) => (
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
            danger 
            icon={<DeleteOutlined />}
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete role "${r.name}"?`)) {
                adminApi.deleteRole(r.id).then(fetchRoles);
              }
            }}
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
        
        <Space style={{ marginBottom: '16px' }}>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchRoles}
            loading={loading}
          >
            Refresh
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setAddModalVisible(true)}
          >
            Create Role
          </Button>
        </Space>
      </div>

      <Spin spinning={loading}>
        <Table
          dataSource={roles}
          columns={columns}
          rowKey="id"
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
        title="Edit Role"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingRole(null);
          form.resetFields();
        }}
        onOk={handleEditSave}
        confirmLoading={editLoading}
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
        </Form>
      </Modal>
    </div>
  );
}
