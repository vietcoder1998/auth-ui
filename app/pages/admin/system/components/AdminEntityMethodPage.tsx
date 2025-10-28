import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, message, Popconfirm, Space, Table, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { EntityApiInstance } from '~/apis/adminApi/EntityApi.ts';
import { EntityMethodApiInstance } from '~/apis/adminApi/EntityMethodApi.ts';
import CommonSearch from '../../../../components/CommonSearch.tsx';
import EntityMethodModal from '../modals/EntityMethodModal.tsx';

interface EntityMethod {
  id: string;
  entityId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface Entity {
  id: string;
  name: string;
}

const AdminEntityMethodPage: React.FC = () => {
  const [entityMethods, setEntityMethods] = useState<EntityMethod[]>([]);
  const [filteredEntityMethods, setFilteredEntityMethods] = useState<EntityMethod[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEntityMethod, setEditingEntityMethod] = useState<EntityMethod | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [form] = Form.useForm();

  const fetchEntityMethods = async () => {
    setLoading(true);
    try {
      const response = await EntityMethodApiInstance.getAll();
      const data = response.data.data || [];
      setEntityMethods(data);
      setFilteredEntityMethods(data);
    } catch (error) {
      message.error('Failed to fetch entity methods');
    } finally {
      setLoading(false);
    }
  };

  const fetchEntities = async () => {
    try {
      const response = await EntityApiInstance.getAll();
      const data = response.data.data || [];
      setEntities(data);
    } catch (error) {
      message.error('Failed to fetch entities');
    }
  };

  useEffect(() => {
    fetchEntityMethods();
    fetchEntities();
  }, []);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    applyFilters(value, filterValues);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filterValues, [key]: value };
    setFilterValues(newFilters);
    applyFilters(searchValue, newFilters);
  };

  const applyFilters = (search: string, filters: Record<string, string>) => {
    let filtered = [...entityMethods];

    // Apply search filter
    if (search) {
      filtered = filtered.filter(
        (method) =>
          method.name.toLowerCase().includes(search.toLowerCase()) ||
          method.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply entity filter
    if (filters.entityId) {
      filtered = filtered.filter((method) => method.entityId === filters.entityId);
    }

    setFilteredEntityMethods(filtered);
  };

  const refreshData = () => {
    fetchEntityMethods();
    setSearchValue('');
    setFilterValues({});
  };

  const handleCreate = async (values: any) => {
    try {
      await EntityMethodApiInstance.create(values);
      message.success('Entity method created');
      setModalVisible(false);
      form.resetFields();
      fetchEntityMethods();
    } catch (error) {
      message.error('Failed to create entity method');
    }
  };

  const handleEdit = async (values: any) => {
    if (!editingEntityMethod) return;
    try {
      await EntityMethodApiInstance.update(editingEntityMethod.id, values);
      message.success('Entity method updated');
      setModalVisible(false);
      setEditingEntityMethod(null);
      form.resetFields();
      fetchEntityMethods();
    } catch (error) {
      message.error('Failed to update entity method');
    }
  };

  const handleDelete = async (entityMethod: EntityMethod) => {
    try {
      await EntityMethodApiInstance.delete(entityMethod.id);
      message.success('Entity method deleted');
      fetchEntityMethods();
    } catch (error) {
      message.error('Failed to delete entity method');
    }
  };

  const openCreateModal = () => {
    setEditingEntityMethod(null);
    form.resetFields();
    setModalVisible(true);
  };

  const openEditModal = (entityMethod: EntityMethod) => {
    setEditingEntityMethod(entityMethod);
    form.setFieldsValue(entityMethod);
    setModalVisible(true);
  };

  const getEntityName = (entityId: string) => {
    const entity = entities.find((e) => e.id === entityId);
    return entity?.name || 'Unknown';
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Entity',
      dataIndex: 'entityId',
      key: 'entityId',
      render: (entityId: string) => <Tag color="blue">{getEntityName(entityId)}</Tag>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: EntityMethod) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          <Popconfirm title="Delete this entity method?" onConfirm={() => handleDelete(record)}>
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filters = [
    {
      key: 'entityId',
      label: 'Entity',
      options: entities.map((entity) => ({
        value: entity.id,
        label: entity.name,
      })),
    },
  ];

  return (
    <div>
      <CommonSearch
        searchPlaceholder="Search entity methods by name or description..."
        searchValue={searchValue}
        onSearch={handleSearch}
        onRefresh={refreshData}
        loading={loading}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            Add Entity Method
          </Button>
        }
        style={{ marginBottom: 16 }}
      />
      <Table
        columns={columns}
        dataSource={filteredEntityMethods}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
      <EntityMethodModal
        visible={modalVisible}
        editingEntityMethod={editingEntityMethod}
        entities={entities}
        form={form}
        onCancel={() => {
          setModalVisible(false);
          setEditingEntityMethod(null);
        }}
        onCreate={handleCreate}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default AdminEntityMethodPage;
