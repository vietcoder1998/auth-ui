import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, Popconfirm, Select, Space, Spin, Table, Tag, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { adminApi } from '../../apis/admin.api.ts';
import CommonSearch from '../../components/CommonSearch.tsx';
import AddPermissionModal from '../modals/AddPermissionModal.tsx';
import EditPermissionModal from '../modals/EditPermissionModal.tsx';

const { Title } = Typography;

export default function AdminPermissionPage() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingPermission, setEditingPermission] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number, range: [number, number]) =>
      `${range[0]}-${range[1]} of ${total} permissions`,
  });
  const [form] = Form.useForm();
  const [roles, setRoles] = useState<any[]>([]);

  useEffect(() => {
    fetchPermissions();
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await adminApi.getRoles();
      setRoles(res.data.data || res.data || []);
    } catch (error) {
      setRoles([]);
    }
  };

  const handleTableChange = (paginationConfig: any, filters: any, sorter: any) => {
    const { current, pageSize } = paginationConfig;
    fetchPermissions({
      page: current,
      pageSize: pageSize,
    });
  };

  const fetchPermissions = async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    category?: string;
    method?: string;
  }) => {
    setLoading(true);
    try {
      const queryParams = {
        page: params?.page || pagination.current,
        pageSize: params?.pageSize || pagination.pageSize,
        q: params?.search || searchText,
        category: params?.category || categoryFilter,
        method: params?.method || methodFilter,
      };

      // Remove empty params
      Object.keys(queryParams).forEach(key => {
        if (!queryParams[key as keyof typeof queryParams]) {
          delete queryParams[key as keyof typeof queryParams];
        }
      });

      const res = await adminApi.getPermissions(queryParams);
      const responseData = res.data;

      // Handle both direct data and wrapped data response
      const permissionsData = responseData.data || responseData || [];
      const total = responseData.total || permissionsData.length;
      const currentPage = responseData.page || queryParams.page || 1;
      const pageSize = responseData.limit || queryParams.pageSize || 10;

      setPermissions(permissionsData);
      setPagination(prev => ({
        ...prev,
        current: currentPage,
        pageSize: pageSize,
        total: total,
      }));
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      setPermissions([]);
      setPagination(prev => ({ ...prev, total: 0 }));
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
      await adminApi.updatePermission(editingPermission.id, values, values.roles);
      setEditModalVisible(false);
      setEditingPermission(null);
      fetchPermissions();
    } catch (error) {
      console.error('Failed to update permission:', error);
    } finally {
      setEditLoading(false);
    }
  };

  const handleSearch = (searchValue: string) => {
    setSearchText(searchValue);
    // Reset to page 1 and fetch with new search term
    fetchPermissions({ search: searchValue, page: 1 });
  };

  const handleRefresh = () => {
    setSearchText('');
    setCategoryFilter('');
    setMethodFilter('');
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchPermissions({ search: '', category: '', method: '', page: 1 });
  };

  interface Permission {
    id: number;
    name: string;
    createdAt: string;
    roles?: any[];
    usageCount?: number;
    [key: string]: any;
  }

  interface ColumnType {
    title: string;
    dataIndex?: string;
    key: string;
    width?: number;
    render?: (value: any, record: Permission, index: number) => React.ReactNode;
    sorter?: (a: Permission, b: Permission) => number;
    defaultSortOrder?: 'ascend' | 'descend';
    fixed?: 'left' | 'right';
  }

  const columns: ColumnType[] = [
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      sorter: (a: Permission, b: Permission) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: 'descend' as const,
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
    {
      title: 'Permission Name',
      dataIndex: 'name',
      key: 'name',
      width: 220,
      sorter: (a: Permission, b: Permission) => a.name.localeCompare(b.name),
      render: (name: string) => <code style={{ backgroundColor: '#f6f8fa', padding: '2px 6px', borderRadius: '3px' }}>{name}</code>
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 250,
      render: (description: string) => description || <em style={{ color: '#999' }}>No description</em>
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      sorter: (a: Permission, b: Permission) => (a.category || 'other').localeCompare(b.category || 'other'),
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
      width: 200,
      render: (route: string) => route ? <code style={{ backgroundColor: '#f0f0f0', padding: '2px 4px', borderRadius: '2px' }}>{route}</code> : <em style={{ color: '#999' }}>-</em>
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      width: 100,
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
      title: 'Roles Using',
      dataIndex: 'roles',
      key: 'roles',
      width: 200,
      render: (roles: any[]) => {
        if (!roles || roles.length === 0) {
          return <em style={{ color: '#999' }}>No roles assigned</em>;
        }
        return (
          <div>
            <div style={{ marginBottom: '4px', fontSize: '12px', color: '#666' }}>
              {roles.length} role{roles.length > 1 ? 's' : ''}
            </div>
            <div>
              {roles.slice(0, 2).map((role: any) => (
                <Tag
                  key={role.id}
                  color={role.name === 'superadmin' ? 'red' :
                    role.name === 'admin' ? 'orange' : 'blue'}
                  style={{ margin: '1px', fontSize: '11px' }}
                >
                  {role.name}
                </Tag>
              ))}
              {roles.length > 2 && (
                <Tag style={{ margin: '1px', fontSize: '11px' }} color="default">
                  +{roles.length - 2} more
                </Tag>
              )}
            </div>
          </div>
        );
      }
    },
    {
      title: 'Usage Count',
      dataIndex: 'usageCount',
      key: 'usageCount',
      width: 120,
      sorter: (a: Permission, b: Permission) => (a.usageCount || 0) - (b.usageCount || 0),
      render: (usageCount: number) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: usageCount > 0 ? '#1890ff' : '#999' }}>
            {usageCount || 0}
          </div>
          <div style={{ fontSize: '11px', color: '#999' }}>
            requests
          </div>
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      fixed: 'right' as const,
      render: (_, p) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(p)}
          >
            Edit
          </Button>
          <Popconfirm
            title={`Delete Permission`}
            description={`Are you sure you want to delete permission "${p.name}"?`}
            okText="Delete"
            cancelText="Cancel"
            okType="danger"
            onConfirm={() => adminApi.deletePermission(p.id).then(() => fetchPermissions())}
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      )
    },
  ];

  return (
    <div style={{}}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ marginBottom: '16px' }}>Permission Management</Title>

        <CommonSearch
          searchPlaceholder="Search permissions by name, description, category, route, method, or role..."
          searchValue={searchText}
          onSearch={handleSearch}
          onRefresh={handleRefresh}
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
          scroll={{ x: 1590 }}
          onChange={handleTableChange}
          pagination={pagination}
          locale={{
            emptyText: searchText ?
              `No permissions found matching "${searchText}"` :
              'No permissions available'
          }}
          style={{ backgroundColor: 'white', borderRadius: '8px' }}
        />
      </Spin>

      <AddPermissionModal
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onSuccess={() => {
          setAddModalVisible(false);
          fetchPermissions();
        }}
      />

      <EditPermissionModal
        visible={editModalVisible}
        permission={editingPermission}
        roles={roles}
        form={form}
        loading={editLoading}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingPermission(null);
          form.resetFields();
        }}
        onSave={handleEditSave}
      />
    </div>
  );
}
