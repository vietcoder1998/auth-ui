import React, { useEffect, useState } from 'react';
import { adminApi } from '../../apis/admin.api.ts';
import { Table, Button, Spin, Space, Typography, Tag, Modal, Input, Form, Select } from 'antd';
import { PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AddPermissionModal from '../modals/AddPermissionModal.tsx';
import CommonSearch from '../../components/CommonSearch.tsx';

const { Title } = Typography;

export default function AdminPermissionPage() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingPermission, setEditingPermission] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getPermissions();
      setPermissions(res.data.data);
    } catch {
      setPermissions([]);
    }
    setLoading(false);
  };

  const handleEdit = (permission: Permission) => {
    setEditingPermission(permission);
    form.setFieldsValue(permission);
    setEditModalVisible(true);
  };

  const handleEditSave = async () => {
    try {
      const values = await form.validateFields();
      setEditLoading(true);
      await adminApi.updatePermission(editingPermission.id, values);
      setEditModalVisible(false);
      setEditingPermission(null);
      fetchPermissions();
    } catch (error) {
      console.error('Failed to update permission:', error);
    } finally {
      setEditLoading(false);
    }
  };

  interface Permission {
    id: number;
    name: string;
    [key: string]: any;
  }

  interface ColumnType {
    title: string;
    dataIndex?: string;
    key: string;
    width?: number;
    render?: (value: any, record: Permission, index: number) => React.ReactNode;
  }

  const columns: ColumnType[] = [
    { 
      title: 'Permission Name', 
      dataIndex: 'name', 
      key: 'name',
      render: (name: string) => <code style={{ backgroundColor: '#f6f8fa', padding: '2px 6px', borderRadius: '3px' }}>{name}</code>
    },
    { 
      title: 'Description', 
      dataIndex: 'description', 
      key: 'description',
      render: (description: string) => description || <em style={{ color: '#999' }}>No description</em>
    },
    { 
      title: 'Category', 
      dataIndex: 'category', 
      key: 'category',
      render: (category: string) => {
        const colors = {
          user: 'blue',
          role: 'green',
          permission: 'purple',
          system: 'red',
          content: 'orange',
          report: 'cyan',
          api: 'magenta',
          other: 'default'
        };
        return <Tag color={colors[category as keyof typeof colors] || 'default'}>{category || 'other'}</Tag>;
      }
    },
    { 
      title: 'Route', 
      dataIndex: 'route', 
      key: 'route',
      render: (route: string) => route ? <code style={{ backgroundColor: '#f0f0f0', padding: '2px 4px', borderRadius: '2px' }}>{route}</code> : <em style={{ color: '#999' }}>-</em>
    },
    { 
      title: 'Method', 
      dataIndex: 'method', 
      key: 'method',
      render: (method: string) => {
        if (!method) return <em style={{ color: '#999' }}>-</em>;
        const colors = {
          GET: 'green',
          POST: 'blue',
          PUT: 'orange',
          DELETE: 'red',
          PATCH: 'purple'
        };
        return <Tag color={colors[method as keyof typeof colors] || 'default'}>{method}</Tag>;
      }
    },
    { 
      title: 'Actions', 
      key: 'actions',
      width: 150,
      render: (_, p) => (
        <Space size="small">
          <Button 
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(p)}
          >
            Edit
          </Button>
          <Button 
            size="small"
            danger 
            icon={<DeleteOutlined />}
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete permission "${p.name}"?`)) {
                adminApi.deletePermission(p.id).then(fetchPermissions);
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
        <Title level={2} style={{ marginBottom: '16px' }}>Permission Management</Title>
        
        <CommonSearch
          searchPlaceholder="Search permissions..."
          onSearch={() => {}} // No search functionality for permissions currently
          onRefresh={fetchPermissions}
          loading={loading}
          extra={
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setAddModalVisible(true)}
            >
              Create Permission
            </Button>
          }
        />
      </div>

      <Spin spinning={loading}>
        <Table
          dataSource={permissions}
          columns={columns}
          rowKey="id"
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} permissions`
          }}
          style={{ backgroundColor: 'white', borderRadius: '8px' }}
        />
      </Spin>

      <AddPermissionModal
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onSuccess={fetchPermissions}
      />

      <Modal
        title="Edit Permission"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingPermission(null);
          form.resetFields();
        }}
        onOk={handleEditSave}
        confirmLoading={editLoading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Permission Name"
            rules={[{ required: true, message: 'Please input permission name!' }]}
          >
            <Input placeholder="Enter permission name" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={3} placeholder="Enter permission description" />
          </Form.Item>
          <Form.Item
            name="category"
            label="Category"
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
            <Input placeholder="e.g., /admin/users, /api/reports" />
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
    </div>
  );
}
