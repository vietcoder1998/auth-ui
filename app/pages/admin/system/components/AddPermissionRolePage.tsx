import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  UserAddOutlined,
  TeamOutlined,
  GroupOutlined,
} from '@ant-design/icons';
import {
  Button,
  Form,
  Popconfirm,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  Card,
  Tabs,
  message,
  Modal,
  Select,
  Transfer,
  Input,
  Row,
  Col,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { adminApi } from '~/apis/admin/index.ts';
import CommonSearch from '~/components/CommonSearch.tsx';
import AddPermissionModal from '../../../blog/modals/AddPermissionModal.tsx';
import EditPermissionModal from '../../../blog/modals/EditPermissionModal.tsx';

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

interface Permission {
  id: string;
  name: string;
  description?: string;
  category?: string;
  route?: string;
  method?: string;
  createdAt: string;
  roles?: any[];
  usageCount?: number;
  permissionGroup?: any;
}

interface PermissionGroup {
  id: string;
  name: string;
  description?: string;
  roles?: Role[]; // Changed from single role to array of roles for n:n relationship
  permissions?: Permission[];
  _count?: {
    permissions: number;
    roles?: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
  permissionGroups?: PermissionGroup[];
}

export default function AddPermissionRolePage() {
  // Permission state
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionLoading, setPermissionLoading] = useState(false);
  const [addPermissionModalVisible, setAddPermissionModalVisible] = useState(false);
  const [editPermissionModalVisible, setEditPermissionModalVisible] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [permissionSearchText, setPermissionSearchText] = useState('');
  const [permissionPagination, setPermissionPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number, range: [number, number]) =>
      `${range[0]}-${range[1]} of ${total} permissions`,
  });

  // Permission Group state
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [groupLoading, setGroupLoading] = useState(false);
  const [addGroupModalVisible, setAddGroupModalVisible] = useState(false);
  const [editGroupModalVisible, setEditGroupModalVisible] = useState(false);
  const [editingGroup, setEditingGroup] = useState<PermissionGroup | null>(null);
  const [groupSearchText, setGroupSearchText] = useState('');
  const [groupPagination, setGroupPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number, range: [number, number]) =>
      `${range[0]}-${range[1]} of ${total} groups`,
  });

  // Add permissions to group modal state
  const [addPermissionsToGroupModalVisible, setAddPermissionsToGroupModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<PermissionGroup | null>(null);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferTargetKeys, setTransferTargetKeys] = useState<string[]>([]);

  // Roles state
  const [roles, setRoles] = useState<Role[]>([]);
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleSearchText, setRoleSearchText] = useState('');
  const [rolePagination, setRolePagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number, range: [number, number]) =>
      `${range[0]}-${range[1]} of ${total} roles`,
  });

  // Assign roles to group modal state
  const [assignRolesToGroupModalVisible, setAssignRolesToGroupModalVisible] = useState(false);
  const [selectedGroupForRoles, setSelectedGroupForRoles] = useState<PermissionGroup | null>(null);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [roleTransferLoading, setRoleTransferLoading] = useState(false);
  const [roleTransferTargetKeys, setRoleTransferTargetKeys] = useState<string[]>([]);

  // Forms
  const [permissionForm] = Form.useForm();
  const [groupForm] = Form.useForm();

  // Active tab
  const [activeTab, setActiveTab] = useState('permissions');

  useEffect(() => {
    if (activeTab === 'permissions') {
      fetchPermissions();
    } else if (activeTab === 'groups') {
      fetchPermissionGroups();
    } else if (activeTab === 'roles') {
      fetchRolesWithGroups();
    }
  }, [activeTab]);

  useEffect(() => {
    fetchRoles(); // Fetch roles for dropdowns
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await adminApi.getRoles();
      setRoles(res.data.data || res.data || []);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      setRoles([]);
    }
  };

  // Roles with permission groups for the roles tab
  const fetchRolesWithGroups = async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
  }) => {
    setRoleLoading(true);
    try {
      const queryParams = {
        page: params?.page || rolePagination.current,
        pageSize: params?.pageSize || rolePagination.pageSize,
        q: params?.search || roleSearchText,
        includePermissionGroups: true,
      };

      Object.keys(queryParams).forEach((key) => {
        if (!queryParams[key as keyof typeof queryParams]) {
          delete queryParams[key as keyof typeof queryParams];
        }
      });

      const res = await adminApi.getRoles(queryParams);
      const responseData = res.data;

      const rolesData = responseData.data || responseData || [];
      const total = responseData.total || rolesData.length;
      const currentPage = responseData.page || queryParams.page || 1;
      const pageSize = responseData.limit || queryParams.pageSize || 10;

      setRoles(rolesData);
      setRolePagination((prev) => ({
        ...prev,
        current: currentPage,
        pageSize: pageSize,
        total: total,
      }));
    } catch (error) {
      console.error('Failed to fetch roles with groups:', error);
      message.error('Failed to fetch roles');
      setRoles([]);
      setRolePagination((prev) => ({ ...prev, total: 0 }));
    }
    setRoleLoading(false);
  };

  // Permission Functions
  const fetchPermissions = async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
  }) => {
    setPermissionLoading(true);
    try {
      const queryParams = {
        page: params?.page || permissionPagination.current,
        pageSize: params?.pageSize || permissionPagination.pageSize,
        q: params?.search || permissionSearchText,
      };

      Object.keys(queryParams).forEach((key) => {
        if (!queryParams[key as keyof typeof queryParams]) {
          delete queryParams[key as keyof typeof queryParams];
        }
      });

      const res = await adminApi.getPermissions(queryParams);
      const responseData = res.data;

      const permissionsData = responseData.data || responseData || [];
      const total = responseData.total || permissionsData.length;
      const currentPage = responseData.page || queryParams.page || 1;
      const pageSize = responseData.limit || queryParams.pageSize || 10;

      setPermissions(permissionsData);
      setPermissionPagination((prev) => ({
        ...prev,
        current: currentPage,
        pageSize: pageSize,
        total: total,
      }));
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      message.error('Failed to fetch permissions');
      setPermissions([]);
      setPermissionPagination((prev) => ({ ...prev, total: 0 }));
    }
    setPermissionLoading(false);
  };

  // Permission Group Functions
  const fetchPermissionGroups = async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
  }) => {
    setGroupLoading(true);
    try {
      const queryParams = {
        page: params?.page || groupPagination.current,
        pageSize: params?.pageSize || groupPagination.pageSize,
        q: params?.search || groupSearchText,
        includePermissions: true,
        includeRoles: true,
      };

      Object.keys(queryParams).forEach((key) => {
        if (!queryParams[key as keyof typeof queryParams]) {
          delete queryParams[key as keyof typeof queryParams];
        }
      });

      // Using the admin API permission group endpoints
      const res = await adminApi.getPermissionGroups(queryParams);
      const responseData = res.data;

      const groupsData = responseData.data || [];
      const total = responseData.total || groupsData.length;
      const currentPage = responseData.page || queryParams.page || 1;
      const pageSize = responseData.limit || queryParams.pageSize || 10;

      setPermissionGroups(groupsData);
      setGroupPagination((prev) => ({
        ...prev,
        current: currentPage,
        pageSize: pageSize,
        total: total,
      }));
    } catch (error) {
      console.error('Failed to fetch permission groups:', error);
      message.error('Failed to fetch permission groups');
      setPermissionGroups([]);
      setGroupPagination((prev) => ({ ...prev, total: 0 }));
    }
    setGroupLoading(false);
  };

  const handlePermissionEdit = (permission: Permission) => {
    setEditingPermission(permission);
    permissionForm.setFieldsValue(permission);
    setEditPermissionModalVisible(true);
  };

  const handlePermissionEditSave = async () => {
    try {
      const values = await permissionForm.validateFields();
      setEditLoading(true);
      await adminApi.updatePermission(editingPermission!.id, values, values.roles);
      setEditPermissionModalVisible(false);
      setEditingPermission(null);
      fetchPermissions();
      message.success('Permission updated successfully');
    } catch (error) {
      console.error('Failed to update permission:', error);
      message.error('Failed to update permission');
    } finally {
      setEditLoading(false);
    }
  };

  const handlePermissionSearch = (searchValue: string) => {
    setPermissionSearchText(searchValue);
    fetchPermissions({ search: searchValue, page: 1 });
  };

  const handlePermissionRefresh = () => {
    setPermissionSearchText('');
    setPermissionPagination((prev) => ({ ...prev, current: 1 }));
    fetchPermissions({ search: '', page: 1 });
  };

  const handleGroupSearch = (searchValue: string) => {
    setGroupSearchText(searchValue);
    fetchPermissionGroups({ search: searchValue, page: 1 });
  };

  const handleGroupRefresh = () => {
    setGroupSearchText('');
    setGroupPagination((prev) => ({ ...prev, current: 1 }));
    fetchPermissionGroups({ search: '', page: 1 });
  };

  const handleRoleSearch = (searchValue: string) => {
    setRoleSearchText(searchValue);
    fetchRolesWithGroups({ search: searchValue, page: 1 });
  };

  const handleRoleRefresh = () => {
    setRoleSearchText('');
    setRolePagination((prev) => ({ ...prev, current: 1 }));
    fetchRolesWithGroups({ search: '', page: 1 });
  };

  // Group Management Functions
  const handleCreateGroup = async (values: any) => {
    try {
      await adminApi.createPermissionGroup(values);
      message.success('Permission group created successfully');
      setAddGroupModalVisible(false);
      groupForm.resetFields();
      fetchPermissionGroups();
    } catch (error: any) {
      console.error('Failed to create permission group:', error);
      message.error(
        `Failed to create permission group: ${error?.response?.data?.message || error.message || 'Unknown error'}`
      );
    }
  };

  const handleEditGroup = (group: PermissionGroup) => {
    setEditingGroup(group);
    groupForm.setFieldsValue({
      name: group.name,
      description: group.description,
    });
    setEditGroupModalVisible(true);
  };

  const handleEditGroupSave = async () => {
    try {
      const values = await groupForm.validateFields();
      await adminApi.updatePermissionGroup(editingGroup!.id, values);
      message.success('Permission group updated successfully');
      setEditGroupModalVisible(false);
      setEditingGroup(null);
      groupForm.resetFields();
      fetchPermissionGroups();
    } catch (error: any) {
      console.error('Failed to update permission group:', error);
      message.error(
        `Failed to update permission group: ${error?.response?.data?.message || error.message || 'Unknown error'}`
      );
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      await adminApi.deletePermissionGroup(groupId);
      message.success('Permission group deleted successfully');
      fetchPermissionGroups();
    } catch (error: any) {
      console.error('Failed to delete permission group:', error);
      message.error(
        `Failed to delete permission group: ${error?.response?.data?.message || error.message || 'Unknown error'}`
      );
    }
  };

  // Add Permissions to Group Functions
  const handleAddPermissionsToGroup = async (group: PermissionGroup) => {
    setSelectedGroup(group);
    setTransferLoading(true);

    try {
      // Fetch available permissions that are not in this group
      const res = await adminApi.getPermissionsNotInGroup(group.id);
      setAvailablePermissions(res.data.data || res.data || []);
      setTransferTargetKeys([]);
      setAddPermissionsToGroupModalVisible(true);
    } catch (error: any) {
      console.error('Failed to fetch available permissions:', error);
      message.error('Failed to fetch available permissions');
    } finally {
      setTransferLoading(false);
    }
  };

  const handleTransferPermissions = async () => {
    if (!selectedGroup || transferTargetKeys.length === 0) {
      message.warning('Please select permissions to add');
      return;
    }

    setTransferLoading(true);
    try {
      await adminApi.addPermissionsToGroup(selectedGroup.id, {
        permissionIds: transferTargetKeys,
      });
      message.success(`Successfully added ${transferTargetKeys.length} permissions to group`);
      setAddPermissionsToGroupModalVisible(false);
      setSelectedGroup(null);
      setTransferTargetKeys([]);
      fetchPermissionGroups();
    } catch (error: any) {
      console.error('Failed to add permissions to group:', error);
      message.error(
        `Failed to add permissions to group: ${error?.response?.data?.message || error.message || 'Unknown error'}`
      );
    } finally {
      setTransferLoading(false);
    }
  };

  // Assign Roles to Group Functions
  const handleAssignRolesToGroup = async (group: PermissionGroup) => {
    setSelectedGroupForRoles(group);
    setRoleTransferLoading(true);

    try {
      // Fetch all available roles
      const res = await adminApi.getRoles();
      setAvailableRoles(res.data.data || res.data || []);

      // Set currently assigned roles as selected
      const currentRoleIds = group.roles?.map((role) => role.id) || [];
      setRoleTransferTargetKeys(currentRoleIds);

      setAssignRolesToGroupModalVisible(true);
    } catch (error: any) {
      console.error('Failed to fetch roles:', error);
      message.error('Failed to fetch roles');
    } finally {
      setRoleTransferLoading(false);
    }
  };

  const handleTransferRoles = async () => {
    if (!selectedGroupForRoles) {
      message.warning('No group selected');
      return;
    }

    setRoleTransferLoading(true);
    try {
      // Since the current API only supports 1:n relationship, we'll assign the group to the first selected role
      // and unassign if no roles are selected. This is a temporary implementation until the backend
      // supports n:n relationships between permission groups and roles.

      if (roleTransferTargetKeys.length > 0) {
        // Assign to the first selected role (limitation of current API)
        const primaryRoleId = roleTransferTargetKeys[0];
        await adminApi.assignGroupToRole(selectedGroupForRoles.id, primaryRoleId);

        if (roleTransferTargetKeys.length > 1) {
          message.warning(
            'Multiple role assignment not fully supported yet. Only the first role will be assigned.'
          );
        }
      } else {
        // Unassign from role
        await adminApi.unassignGroupFromRole(selectedGroupForRoles.id);
      }

      message.success(`Successfully updated role assignments for "${selectedGroupForRoles.name}"`);
      setAssignRolesToGroupModalVisible(false);
      setSelectedGroupForRoles(null);
      setRoleTransferTargetKeys([]);
      fetchPermissionGroups(); // Refresh the groups list
    } catch (error: any) {
      console.error('Failed to update role assignments:', error);
      message.error(
        `Failed to update role assignments: ${error?.response?.data?.message || error.message || 'Unknown error'}`
      );
    } finally {
      setRoleTransferLoading(false);
    }
  };

  const permissionColumns = [
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      sorter: (a: Permission, b: Permission) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
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
      },
    },
    {
      title: 'Permission Name',
      dataIndex: 'name',
      key: 'name',
      width: 220,
      sorter: (a: Permission, b: Permission) => a.name.localeCompare(b.name),
      render: (name: string) => (
        <code style={{ backgroundColor: '#f6f8fa', padding: '2px 6px', borderRadius: '3px' }}>
          {name}
        </code>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 250,
      render: (description: string) =>
        description || <em style={{ color: '#999' }}>No description</em>,
    },
    {
      title: 'Permission Group',
      dataIndex: 'permissionGroup',
      key: 'permissionGroup',
      width: 150,
      render: (permissionGroup: any) => {
        if (permissionGroup) {
          return (
            <Tag color="purple" title={permissionGroup.description}>
              {permissionGroup.name}
            </Tag>
          );
        }
        return <Tag color="default">Ungrouped</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, permission: Permission) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handlePermissionEdit(permission)}
          >
            Edit
          </Button>
          <Popconfirm
            title={`Delete Permission`}
            description={`Are you sure you want to delete permission "${permission.name}"?`}
            okText="Delete"
            cancelText="Cancel"
            okType="danger"
            onConfirm={() =>
              adminApi.deletePermission(permission.id).then(() => fetchPermissions())
            }
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const groupColumns = [
    {
      title: 'Group Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name: string) => (
        <div style={{ fontWeight: 'bold', color: '#1890ff' }}>
          <GroupOutlined style={{ marginRight: 8 }} />
          {name}
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 250,
      render: (description: string) =>
        description || <em style={{ color: '#999' }}>No description</em>,
    },
    {
      title: 'Assigned Roles',
      dataIndex: 'roles',
      key: 'roles',
      width: 200,
      render: (roles: Role[]) => {
        if (!roles || roles.length === 0) {
          return <em style={{ color: '#999' }}>No roles assigned</em>;
        }
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {roles.map((role) => (
              <Tag
                key={role.id}
                color={
                  role.name === 'superadmin' ? 'red' : role.name === 'admin' ? 'orange' : 'blue'
                }
              >
                <TeamOutlined style={{ marginRight: 4 }} />
                {role.name}
              </Tag>
            ))}
          </div>
        );
      },
    },
    {
      title: 'Counts',
      dataIndex: '_count',
      key: 'counts',
      width: 120,
      render: (_count: any, group: PermissionGroup) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1890ff' }}>
            {_count?.permissions || 0}
          </div>
          <div style={{ fontSize: '10px', color: '#999' }}>permissions</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#52c41a' }}>
            {group.roles?.length || 0}
          </div>
          <div style={{ fontSize: '10px', color: '#999' }}>roles</div>
        </div>
      ),
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (createdAt: string) => {
        if (!createdAt) return <em style={{ color: '#999' }}>-</em>;
        const date = new Date(createdAt);
        return (
          <div>
            <div>{date.toLocaleDateString()}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{date.toLocaleTimeString()}</div>
          </div>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 280,
      fixed: 'right' as const,
      render: (_: any, group: PermissionGroup) => (
        <Space size="small" wrap>
          <Button
            size="small"
            icon={<UserAddOutlined />}
            onClick={() => handleAddPermissionsToGroup(group)}
          >
            Add Permissions
          </Button>
          <Button
            size="small"
            icon={<TeamOutlined />}
            onClick={() => handleAssignRolesToGroup(group)}
          >
            Assign Roles
          </Button>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEditGroup(group)}>
            Edit
          </Button>
          <Popconfirm
            title={`Delete Permission Group`}
            description={`Are you sure you want to delete group "${group.name}"?`}
            okText="Delete"
            cancelText="Cancel"
            okType="danger"
            onConfirm={() => handleDeleteGroup(group.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const roleColumns = [
    {
      title: 'Role Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name: string) => (
        <div style={{ fontWeight: 'bold', color: '#1890ff' }}>
          <TeamOutlined style={{ marginRight: 8 }} />
          {name}
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 250,
      render: (description: string) =>
        description || <em style={{ color: '#999' }}>No description</em>,
    },
    {
      title: 'Permission Groups',
      dataIndex: 'permissionGroups',
      key: 'permissionGroups',
      width: 300,
      render: (permissionGroups: PermissionGroup[]) => {
        if (!permissionGroups || permissionGroups.length === 0) {
          return <em style={{ color: '#999' }}>No permission groups assigned</em>;
        }
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {permissionGroups.map((group) => (
              <Tag key={group.id} color="purple">
                <GroupOutlined style={{ marginRight: 4 }} />
                {group.name}
              </Tag>
            ))}
          </div>
        );
      },
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (createdAt: string) => {
        if (!createdAt) return <em style={{ color: '#999' }}>-</em>;
        const date = new Date(createdAt);
        return (
          <div>
            <div>{date.toLocaleDateString()}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{date.toLocaleTimeString()}</div>
          </div>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, role: Role) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />}>
            Edit
          </Button>
          <Popconfirm
            title={`Delete Role`}
            description={`Are you sure you want to delete role "${role.name}"?`}
            okText="Delete"
            cancelText="Cancel"
            okType="danger"
            onConfirm={() => {
              // Add delete role functionality here if needed
              message.info('Role deletion not implemented yet');
            }}
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ marginBottom: '16px' }}>
          Permission & Role Management
        </Title>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Permissions" key="permissions">
          <Card>
            <CommonSearch
              searchPlaceholder="Search permissions by name, description, category..."
              searchValue={permissionSearchText}
              onSearch={handlePermissionSearch}
              onRefresh={handlePermissionRefresh}
              loading={permissionLoading}
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setAddPermissionModalVisible(true)}
                >
                  Create Permission
                </Button>
              }
            />

            <Spin spinning={permissionLoading}>
              <Table
                dataSource={permissions}
                columns={permissionColumns}
                rowKey="id"
                scroll={{ x: 1400 }}
                onChange={(paginationConfig) => {
                  const { current, pageSize } = paginationConfig;
                  fetchPermissions({ page: current, pageSize });
                }}
                pagination={permissionPagination}
                locale={{
                  emptyText: permissionSearchText
                    ? `No permissions found matching "${permissionSearchText}"`
                    : 'No permissions available',
                }}
                style={{ marginTop: '16px' }}
              />
            </Spin>
          </Card>
        </TabPane>

        <TabPane tab="Permission Groups" key="groups">
          <Card>
            <CommonSearch
              searchPlaceholder="Search permission groups by name, description..."
              searchValue={groupSearchText}
              onSearch={handleGroupSearch}
              onRefresh={handleGroupRefresh}
              loading={groupLoading}
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setAddGroupModalVisible(true)}
                >
                  Create Permission Group
                </Button>
              }
            />

            <Spin spinning={groupLoading}>
              <Table
                dataSource={permissionGroups}
                columns={groupColumns}
                rowKey="id"
                scroll={{ x: 1200 }}
                onChange={(paginationConfig) => {
                  const { current, pageSize } = paginationConfig;
                  fetchPermissionGroups({ page: current, pageSize });
                }}
                pagination={groupPagination}
                locale={{
                  emptyText: groupSearchText
                    ? `No permission groups found matching "${groupSearchText}"`
                    : 'No permission groups available',
                }}
                style={{ marginTop: '16px' }}
              />
            </Spin>
          </Card>
        </TabPane>

        <TabPane tab="Roles" key="roles">
          <Card>
            <CommonSearch
              searchPlaceholder="Search roles by name, description..."
              searchValue={roleSearchText}
              onSearch={handleRoleSearch}
              onRefresh={handleRoleRefresh}
              loading={roleLoading}
            />

            <Spin spinning={roleLoading}>
              <Table
                dataSource={roles}
                columns={roleColumns}
                rowKey="id"
                scroll={{ x: 1000 }}
                onChange={(paginationConfig) => {
                  const { current, pageSize } = paginationConfig;
                  fetchRolesWithGroups({ page: current, pageSize });
                }}
                pagination={rolePagination}
                locale={{
                  emptyText: roleSearchText
                    ? `No roles found matching "${roleSearchText}"`
                    : 'No roles available',
                }}
                style={{ marginTop: '16px' }}
              />
            </Spin>
          </Card>
        </TabPane>
      </Tabs>

      {/* Add Permission Modal */}
      <AddPermissionModal
        visible={addPermissionModalVisible}
        onCancel={() => setAddPermissionModalVisible(false)}
        onSuccess={() => {
          setAddPermissionModalVisible(false);
          fetchPermissions();
        }}
      />

      {/* Edit Permission Modal */}
      <EditPermissionModal
        visible={editPermissionModalVisible}
        permission={editingPermission}
        roles={roles}
        form={permissionForm}
        loading={editLoading}
        onCancel={() => {
          setEditPermissionModalVisible(false);
          setEditingPermission(null);
          permissionForm.resetFields();
        }}
        onSave={handlePermissionEditSave}
      />

      {/* Add Permission Group Modal */}
      <Modal
        title="Create Permission Group"
        open={addGroupModalVisible}
        onOk={() => groupForm.submit()}
        onCancel={() => {
          setAddGroupModalVisible(false);
          groupForm.resetFields();
        }}
        width={600}
      >
        <Form form={groupForm} layout="vertical" onFinish={handleCreateGroup}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="name"
                label="Group Name"
                rules={[{ required: true, message: 'Please enter group name' }]}
              >
                <Input placeholder="Enter permission group name" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="description" label="Description">
                <Input.TextArea rows={3} placeholder="Enter group description (optional)" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Edit Permission Group Modal */}
      <Modal
        title="Edit Permission Group"
        open={editGroupModalVisible}
        onOk={handleEditGroupSave}
        onCancel={() => {
          setEditGroupModalVisible(false);
          setEditingGroup(null);
          groupForm.resetFields();
        }}
        width={600}
      >
        <Form form={groupForm} layout="vertical">
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="name"
                label="Group Name"
                rules={[{ required: true, message: 'Please enter group name' }]}
              >
                <Input placeholder="Enter permission group name" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="description" label="Description">
                <Input.TextArea rows={3} placeholder="Enter group description (optional)" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Add Permissions to Group Modal */}
      <Modal
        title={`Add Permissions to "${selectedGroup?.name}"`}
        open={addPermissionsToGroupModalVisible}
        onOk={handleTransferPermissions}
        onCancel={() => {
          setAddPermissionsToGroupModalVisible(false);
          setSelectedGroup(null);
          setTransferTargetKeys([]);
        }}
        width={800}
        confirmLoading={transferLoading}
        okText={`Add ${transferTargetKeys.length} Permission${transferTargetKeys.length !== 1 ? 's' : ''}`}
        okButtonProps={{
          disabled: transferTargetKeys.length === 0,
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <p>Select permissions to add to the "{selectedGroup?.name}" group:</p>
        </div>

        <Spin spinning={transferLoading}>
          <Transfer
            dataSource={availablePermissions.map((permission) => ({
              key: permission.id,
              title: permission.name,
              description: permission.description || 'No description',
              group: permission.permissionGroup?.name || 'Ungrouped',
            }))}
            targetKeys={transferTargetKeys}
            onChange={(targetKeys) => setTransferTargetKeys(targetKeys as string[])}
            render={(item) => (
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{item.title}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>{item.description}</div>
                </div>
                <Tag color={item.group === 'Ungrouped' ? 'default' : 'purple'}>{item.group}</Tag>
              </div>
            )}
            listStyle={{
              width: 350,
              height: 400,
            }}
            titles={['Available Permissions', 'Selected Permissions']}
            showSearch
            filterOption={(inputValue, item) =>
              item.title!.toLowerCase().includes(inputValue.toLowerCase()) ||
              item.description!.toLowerCase().includes(inputValue.toLowerCase())
            }
          />
        </Spin>
      </Modal>

      {/* Assign Roles to Group Modal */}
      <Modal
        title={`Assign Roles to "${selectedGroupForRoles?.name}"`}
        open={assignRolesToGroupModalVisible}
        onOk={handleTransferRoles}
        onCancel={() => {
          setAssignRolesToGroupModalVisible(false);
          setSelectedGroupForRoles(null);
          setRoleTransferTargetKeys([]);
        }}
        width={800}
        confirmLoading={roleTransferLoading}
        okText={`Update Role Assignments`}
      >
        <div style={{ marginBottom: 16 }}>
          <p>Select a role to assign to the "{selectedGroupForRoles?.name}" group:</p>
          <div
            style={{
              backgroundColor: '#fff7e6',
              border: '1px solid #ffd591',
              padding: '8px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              color: '#d46b08',
            }}
          >
            <strong>Note:</strong> Currently, each permission group can only be assigned to one
            role. Multi-role assignment will be available when the backend supports many-to-many
            relationships.
          </div>
        </div>

        <Spin spinning={roleTransferLoading}>
          <Transfer
            dataSource={availableRoles.map((role) => ({
              key: role.id,
              title: role.name,
              description: role.description || 'No description',
            }))}
            targetKeys={roleTransferTargetKeys}
            onChange={(targetKeys) => setRoleTransferTargetKeys(targetKeys as string[])}
            render={(item) => (
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{item.title}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>{item.description}</div>
                </div>
              </div>
            )}
            listStyle={{
              width: 350,
              height: 400,
            }}
            titles={['Available Roles', 'Assigned Roles']}
            showSearch
            filterOption={(inputValue, item) =>
              item.title!.toLowerCase().includes(inputValue.toLowerCase()) ||
              item.description!.toLowerCase().includes(inputValue.toLowerCase())
            }
          />
        </Spin>
      </Modal>
    </div>
  );
}
