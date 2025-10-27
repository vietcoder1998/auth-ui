import React, { useEffect, useState } from 'react';
import { Table, Button, Form, message, Space, Popconfirm, Tag } from 'antd';
import { useNavigate } from 'react-router';
import CommonSearch from '../../../../components/CommonSearch.tsx';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import ToolCommandCreateModal from '../modals/ToolCommandCreateModal.tsx';
import ToolCommandUpdateModal from '../modals/ToolCommandUpdateModal.tsx';
import { ToolCommandApi } from '../../../../apis/admin.api.ts';

interface ToolCommand {
  id: string;
  toolId: string;
  name: string;
  description: string;
  command: string;
  parameters: string;
  enabled: boolean;
  createdAt: string;
}

const AdminToolCommandListPage: React.FC = () => {
  const navigate = useNavigate();
  const [commands, setCommands] = useState<ToolCommand[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [editingCommand, setEditingCommand] = useState<ToolCommand | null>(null);
  const [form] = Form.useForm();
  const [searchValue, setSearchValue] = useState('');

  const fetchCommands = async (search?: string) => {
    setLoading(true);
    try {
      const params = search ? { q: search } : undefined;
      const response = await ToolCommandApi.getToolCommands(params);
      setCommands(response.data.data.data || []);
    } catch (error) {
      message.error('Failed to fetch tool commands');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommands();
  }, []);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    fetchCommands(value);
  };

  const handleCreate = async (values: any) => {
    try {
      await ToolCommandApi.createToolCommand(values);
      message.success('Tool command created');
      setCreateModalVisible(false);
      form.resetFields();
      fetchCommands();
    } catch (error) {
      message.error('Failed to create tool command');
    }
  };

  const handleEdit = async (values: any) => {
    if (!editingCommand) return;
    try {
      await ToolCommandApi.updateToolCommand(editingCommand.id, values);
      message.success('Tool command updated');
      setUpdateModalVisible(false);
      setEditingCommand(null);
      form.resetFields();
      fetchCommands();
    } catch (error) {
      message.error('Failed to update tool command');
    }
  };

  const handleDelete = async (command: ToolCommand) => {
    try {
      await ToolCommandApi.deleteToolCommand(command.id);
      message.success('Tool command deleted');
      fetchCommands();
    } catch (error) {
      message.error('Failed to delete tool command');
    }
  };

  const openCreateModal = () => {
    setEditingCommand(null);
    form.resetFields();
    setCreateModalVisible(true);
  };

  const openEditModal = (command: ToolCommand) => {
    console.log(command);
    // Navigate to the new edit page instead of opening modal
    navigate(`/admin/system/tools/${command.id}`);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string, record: ToolCommand) => (
        <input type="checkbox" checked={!!id} readOnly style={{ pointerEvents: 'none' }} />
      ),
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
      title: 'Command',
      dataIndex: 'command',
      key: 'command',
      render: (command: string) => (
        <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: 4 }}>
          {command}
        </code>
      ),
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
      render: (_: any, record: ToolCommand) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          <Popconfirm title="Delete this command?" onConfirm={() => handleDelete(record)}>
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <CommonSearch
        searchPlaceholder="Search by name, description, or command"
        searchValue={searchValue}
        onSearch={handleSearch}
        onRefresh={() => fetchCommands(searchValue)}
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
        Add Tool Command
      </Button>
      <Table
        columns={columns}
        dataSource={commands}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
      <ToolCommandCreateModal
        visible={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onCreate={handleCreate}
        form={form}
      />
      <ToolCommandUpdateModal
        visible={updateModalVisible}
        onCancel={() => {
          setUpdateModalVisible(false);
          setEditingCommand(null);
        }}
        onUpdate={handleEdit}
        form={form}
        editingCommand={editingCommand}
      />
    </div>
  );
};

export default AdminToolCommandListPage;
