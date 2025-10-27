import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, Tag } from 'antd';
import { ToolApi } from '../../../../apis/admin.api.ts';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

interface Tool {
  id: string;
  name: string;
  type: string;
  config: string;
  enabled: boolean;
  createdAt: string;
}

const AdminToolPage: React.FC = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [form] = Form.useForm();

  const fetchTools = async () => {
    setLoading(true);
    try {
      const response = await ToolApi.getTools();
      setTools(response.data.data || []);
    } catch (error) {
      message.error('Failed to fetch tools');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const handleCreate = async (values: any) => {
    try {
      await ToolApi.createTool(values);
      message.success('Tool created');
      setModalVisible(false);
      form.resetFields();
      fetchTools();
    } catch (error) {
      message.error('Failed to create tool');
    }
  };

  const handleEdit = async (values: any) => {
    if (!editingTool) return;
    try {
      await ToolApi.updateTool(editingTool.id, values);
      message.success('Tool updated');
      setModalVisible(false);
      setEditingTool(null);
      form.resetFields();
      fetchTools();
    } catch (error) {
      message.error('Failed to update tool');
    }
  };

  const handleDelete = async (tool: Tool) => {
    try {
      await ToolApi.deleteTool(tool.id);
      message.success('Tool deleted');
      fetchTools();
    } catch (error) {
      message.error('Failed to delete tool');
    }
  };

  const openCreateModal = () => {
    setEditingTool(null);
    form.resetFields();
    setModalVisible(true);
  };

  const openEditModal = (tool: Tool) => {
    setEditingTool(tool);
    form.setFieldsValue(tool);
    setModalVisible(true);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag color="blue">{type}</Tag>,
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
      render: (_: any, record: Tool) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          <Popconfirm title="Delete this tool?" onConfirm={() => handleDelete(record)}>
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
        Add Tool
      </Button>
      <Table
        columns={columns}
        dataSource={tools}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title={editingTool ? 'Edit Tool' : 'Add Tool'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingTool(null);
        }}
        onOk={() => {
          form
            .validateFields()
            .then((values) => {
              if (editingTool) {
                handleEdit(values);
              } else {
                handleCreate(values);
              }
            })
            .catch(() => {});
        }}
        okText={editingTool ? 'Update' : 'Create'}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            {' '}
            <Input />{' '}
          </Form.Item>
          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            {' '}
            <Input />{' '}
          </Form.Item>
          <Form.Item name="config" label="Config">
            {' '}
            <Input.TextArea rows={3} />{' '}
          </Form.Item>
          <Form.Item name="enabled" label="Enabled" valuePropName="checked">
            <Input type="checkbox" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminToolPage;
