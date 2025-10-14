import React, { useEffect, useState } from 'react';
import { adminApi } from '../apis/admin.api.ts';
import { Table, Button, Spin, Space, Typography, Tag } from 'antd';
import { PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AddPermissionModal from './modals/AddPermissionModal.tsx';

const { Title } = Typography;

export default function AdminPermissionPage() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);

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
      title: 'Actions', 
      key: 'actions',
      width: 150,
      render: (_, p) => (
        <Space size="small">
          <Button 
            size="small"
            icon={<EditOutlined />}
            onClick={() => alert('Edit permission: ' + p.name)}
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
        
        <Space style={{ marginBottom: '16px' }}>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchPermissions}
            loading={loading}
          >
            Refresh
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setAddModalVisible(true)}
          >
            Create Permission
          </Button>
        </Space>
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
    </div>
  );
}
