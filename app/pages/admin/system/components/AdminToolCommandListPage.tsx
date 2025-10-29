import React, { useEffect, useState } from 'react';
import { Table, Button, Form, message, Space, Popconfirm, Tag, Tooltip, Badge } from 'antd';
import { useNavigate } from 'react-router';
import CommonSearch from '../../../../components/CommonSearch.tsx';
import { PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons';
import ToolCommandCreateModal from '../modals/ToolCommandCreateModal.tsx';
import ToolCommandUpdateModal from '../modals/ToolCommandUpdateModal.tsx';
import CommandExecutionModal from '../modals/CommandExecutionModal.tsx';
import { ToolCommandApi } from '../../../../apis/admin.api.ts';

interface Entity {
  id: string;
  name: string;
  description?: string;
}

interface EntityMethod {
  id: string;
  name: string;
  code?: string;
  description?: string;
  entityId?: string;
  entity?: Entity;
  createdAt: string;
  updatedAt: string;
}

interface CommandEntityMethod {
  id: string;
  commandId: string;
  entityMethodId: string;
  createdAt: string;
  entityMethod: EntityMethod;
}

interface Tool {
  id: string;
  name: string;
  type: string;
  description?: string;
  enabled: boolean;
}

interface ToolCommand {
  id: string;
  toolId: string;
  name: string;
  description: string;
  command: string;
  parameters: string;
  enabled: boolean;
  createdAt: string;
  tool?: Tool;
  entityMethods?: CommandEntityMethod[];
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
  const [executionModalVisible, setExecutionModalVisible] = useState(false);
  const [selectedCommand, setSelectedCommand] = useState<ToolCommand | null>(null);

  const fetchCommands = async (search?: string) => {
    setLoading(true);
    try {
      const params = search ? { q: search } : undefined;
      const response = await ToolCommandApi.getToolCommands(params);
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

  const openExecutionModal = (command: ToolCommand) => {
    setSelectedCommand(command);
    setExecutionModalVisible(true);
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
      title: 'Tool',
      key: 'tool',
      render: (_: any, record: ToolCommand) => {
        if (!record.tool) {
          return <Tag color="default">No Tool</Tag>;
        }

        return (
          <div>
            <Tag color="cyan" title={record.tool.description}>
              {record.tool.name}
            </Tag>
            <br />
            <Tag color="purple">{record.tool.type}</Tag>
          </div>
        );
      },
      width: 150,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Entity Methods',
      key: 'entityMethods',
      render: (_: any, record: ToolCommand) => {
        if (!record.entityMethods || record.entityMethods.length === 0) {
          return <Tag color="default">No Methods</Tag>;
        }

        const methodCount = record.entityMethods.length;

        return (
          <div>
            <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Badge count={methodCount} color="#1890ff" />
              <span style={{ fontSize: '12px', color: '#666' }}>
                {methodCount} method{methodCount !== 1 ? 's' : ''}
              </span>
            </div>
            <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                {record.entityMethods.map((em) => (
                  <div key={em.id} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}
                    >
                      <Tooltip
                        title={
                          <div>
                            <div>
                              <strong>Description:</strong>{' '}
                              {em.entityMethod.description || 'No description'}
                            </div>
                            {em.entityMethod.code && (
                              <div style={{ marginTop: 8 }}>
                                <strong>Code:</strong>
                                <pre
                                  style={{
                                    background: '#f5f5f5',
                                    padding: 8,
                                    borderRadius: 4,
                                    fontSize: '12px',
                                    marginTop: 4,
                                    whiteSpace: 'pre-wrap',
                                  }}
                                >
                                  {em.entityMethod.code}
                                </pre>
                              </div>
                            )}
                          </div>
                        }
                        placement="topLeft"
                      >
                        <Tag color="blue" style={{ cursor: 'help' }}>
                          {em.entityMethod.name}
                        </Tag>
                      </Tooltip>
                      {em.entityMethod.entity && (
                        <Tag color="geekblue">{em.entityMethod.entity.name}</Tag>
                      )}
                    </div>
                  </div>
                ))}
              </Space>
            </div>
          </div>
        );
      },
      width: 280,
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
          <Tooltip title="Test Execute Command">
            <Button
              icon={<PlayCircleOutlined />}
              onClick={() => openExecutionModal(record)}
              disabled={!record.enabled}
              type="default"
              style={{
                color: record.enabled ? '#52c41a' : '#d9d9d9',
                borderColor: record.enabled ? '#52c41a' : '#d9d9d9',
              }}
            />
          </Tooltip>
          <Button icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          <Popconfirm title="Delete this command?" onConfirm={() => handleDelete(record)}>
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
      width: 140,
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
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
          Add Tool Command
        </Button>
        <Button
          icon={<PlayCircleOutlined />}
          onClick={() => {
            const enabledCommands = commands.filter((cmd) => cmd.enabled);
            if (enabledCommands.length === 0) {
              message.warning('No enabled commands available for testing');
              return;
            }

            message.info(
              `Found ${enabledCommands.length} enabled commands. Use individual test buttons to execute them.`
            );
          }}
          disabled={commands.filter((cmd) => cmd.enabled).length === 0}
        >
          Show Enabled Commands
        </Button>
      </Space>
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
      <CommandExecutionModal
        visible={executionModalVisible}
        onCancel={() => {
          setExecutionModalVisible(false);
          setSelectedCommand(null);
        }}
        command={selectedCommand}
      />
    </div>
  );
};

export default AdminToolCommandListPage;
