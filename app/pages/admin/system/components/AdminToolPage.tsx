import React, { useEffect, useState } from 'react';
import { Table, Button, Form, message, Space, Popconfirm, Tag, Tabs } from 'antd';
import { ToolApi } from '../../../../apis/admin.api.ts';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AdminToolCommandListPage from './AdminToolCommandListPage.tsx';
import CommonSearch from '../../../../components/CommonSearch.tsx';
import ToolModal from '../modal/ToolModal.tsx';

const { TabPane } = Tabs;

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
  const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [form] = Form.useForm();

  const fetchTools = async () => {
    setLoading(true);
    try {
      const response = await ToolApi.getTools();
      const toolsData = response.data.data.data || [];
      setTools(toolsData);
      setFilteredTools(toolsData);
      setAvailableTools(toolsData);
    } catch (error) {
      message.error('Failed to fetch tools');
    } finally {
      setLoading(false);
    }
  };

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
    let filtered = [...tools];

    // Apply search filter
    if (search) {
      filtered = filtered.filter(
        (tool) =>
          tool.name.toLowerCase().includes(search.toLowerCase()) ||
          tool.type.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply type filter
    if (filters.type) {
      filtered = filtered.filter((tool) => tool.type === filters.type);
    }

    // Apply enabled filter
    if (filters.enabled) {
      const isEnabled = filters.enabled === 'true';
      filtered = filtered.filter((tool) => tool.enabled === isEnabled);
    }

    setFilteredTools(filtered);
  };

  const refreshData = () => {
    fetchTools();
    setSearchValue('');
    setFilterValues({});
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
    // Populate form fields; if tool has relatedToolIds use it, otherwise empty
    form.setFieldsValue({
      ...tool,
      relatedToolIds: (tool as any).relatedToolIds || [],
    });
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

  const filters = [
    {
      key: 'type',
      label: 'Type',
      options: [
        { value: 'api', label: 'API' },
        { value: 'function', label: 'Function' },
        { value: 'script', label: 'Script' },
        { value: 'webhook', label: 'Webhook' },
      ],
    },
    {
      key: 'enabled',
      label: 'Status',
      options: [
        { value: 'true', label: 'Enabled' },
        { value: 'false', label: 'Disabled' },
      ],
    },
  ];

  const ToolListTab = () => (
    <div>
      <CommonSearch
        searchPlaceholder="Search tools by name or type..."
        searchValue={searchValue}
        onSearch={handleSearch}
        onRefresh={refreshData}
        loading={loading}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            Add Tool
          </Button>
        }
        style={{ marginBottom: 16 }}
      />
      <Table
        columns={columns}
        dataSource={filteredTools}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
      <ToolModal
        visible={modalVisible}
        editingTool={editingTool}
        availableTools={availableTools}
        form={form}
        onCancel={() => {
          setModalVisible(false);
          setEditingTool(null);
        }}
        onCreate={handleCreate}
        onEdit={handleEdit}
      />
    </div>
  );

  return (
    <div>
      <Tabs defaultActiveKey="tools">
        <TabPane tab="Tools" key="tools">
          <ToolListTab />
        </TabPane>
        <TabPane tab="Tool Commands" key="commands">
          <AdminToolCommandListPage />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AdminToolPage;
