import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, Tag, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
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
  const [commands, setCommands] = useState<ToolCommand[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCommand, setEditingCommand] = useState<ToolCommand | null>(null);
  const [form] = Form.useForm();

  const fetchCommands = async () => {
    setLoading(true);
    try {
      const response = await ToolCommandApi.getToolCommands();
      setCommands(response.data.data || []);
    } catch (error) {
      message.error('Failed to fetch tool commands');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommands();
  }, []);

  const handleCreate = async (values: any) => {
    try {
      await ToolCommandApi.createToolCommand(values);
      message.success('Tool command created');
      setModalVisible(false);
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
      setModalVisible(false);
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
    setModalVisible(true);
  };

  const openEditModal = (command: ToolCommand) => {
    setEditingCommand(command);
    form.setFieldsValue(command);
    setModalVisible(true);
  };

  const columns = [
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
      <Modal
        title={editingCommand ? 'Edit Tool Command' : 'Add Tool Command'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingCommand(null);
        }}
        onOk={() => {
          form
            .validateFields()
            .then((values) => {
              if (editingCommand) {
                handleEdit(values);
              } else {
                handleCreate(values);
              }
            })
            .catch(() => {});
        }}
        okText={editingCommand ? 'Update' : 'Create'}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="command" label="Command" rules={[{ required: true }]}>
            <Input placeholder="e.g., execute, query, transform" />
          </Form.Item>
          <Form.Item name="parameters" label="Parameters (JSON)">
            <Input.TextArea rows={3} placeholder='{"param1": "value1", "param2": "value2"}' />
          </Form.Item>
          <Form.Item name="toolId" label="Tool ID" rules={[{ required: true }]}>
            <Input placeholder="Associated tool ID" />
          </Form.Item>
          <Form.Item name="enabled" label="Enabled" valuePropName="checked">
            <Input type="checkbox" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminToolCommandListPage;
