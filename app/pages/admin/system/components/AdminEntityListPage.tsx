import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, message, Popconfirm, Space, Table, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { EntityApiInstance } from '~/apis/admin/EntityApi.ts';
import CommonSearch from '../../../../components/CommonSearch.tsx';
import EntityCreateModal from '../modals/EntityCreateModal.tsx';
import EntityUpdateModal from '../modals/EntityUpdateModal.tsx';

interface Entity {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  createdAt: string;
}

const AdminEntityListPage: React.FC = () => {
  const navigate = useNavigate();
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [form] = Form.useForm();
  const [searchValue, setSearchValue] = useState('');

  const fetchEntities = async (search?: string) => {
    setLoading(true);
    try {
      const params = search ? { q: search } : undefined;
      const response = await EntityApiInstance.getAll(params);
      setEntities(response.data.data || []);
    } catch (error) {
      message.error('Failed to fetch entities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntities();
  }, []);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    fetchEntities(value);
  };

  const handleCreate = async (values: any) => {
    try {
      await EntityApiInstance.create(values);
      message.success('Entity created');
      setCreateModalVisible(false);
      form.resetFields();
      fetchEntities();
    } catch (error) {
      message.error('Failed to create entity');
    }
  };

  const handleEdit = async (values: any) => {
    if (!editingEntity) return;
    try {
      await EntityApiInstance.update(editingEntity.id, values);
      message.success('Entity updated');
      setUpdateModalVisible(false);
      setEditingEntity(null);
      form.resetFields();
      fetchEntities();
    } catch (error) {
      message.error('Failed to update entity');
    }
  };

  const handleDelete = async (entity: Entity) => {
    try {
      await EntityApiInstance.delete(entity.id);
      message.success('Entity deleted');
      fetchEntities();
    } catch (error) {
      message.error('Failed to delete entity');
    }
  };

  const openCreateModal = () => {
    setEditingEntity(null);
    form.resetFields();
    setCreateModalVisible(true);
  };

  const openEditModal = (entity: Entity) => {
    setEditingEntity(entity);
    form.setFieldsValue(entity);
    setUpdateModalVisible(true);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Enabled',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean) => (
        <Tag color={enabled ? 'green' : 'red'}>{enabled ? 'Enabled' : 'Disabled'}</Tag>
      ),
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
      render: (_: any, record: Entity) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          <Popconfirm title="Delete this entity?" onConfirm={() => handleDelete(record)}>
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <CommonSearch
        searchPlaceholder="Search by name or description"
        searchValue={searchValue}
        onSearch={handleSearch}
        onRefresh={() => fetchEntities(searchValue)}
        loading={loading}
        showRefresh
        style={{ marginBottom: 16 }}
      />
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={openCreateModal}
        style={{ marginBottom: 16 }}
      >
        Add Entity
      </Button>
      <Table
        columns={columns}
        dataSource={entities}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
      <EntityCreateModal
        visible={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        initialValues={form}
      />
      <EntityUpdateModal
        visible={updateModalVisible}
        onCancel={() => {
          setUpdateModalVisible(false);
          setEditingEntity(null);
        }}
        initialValues={form}
        onSubmit={function (values: any): Promise<void> | void {
          throw new Error('Function not implemented.');
        }}
      />
    </div>
  );
};

export default AdminEntityListPage;
