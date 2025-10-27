import {
  ClearOutlined,
  ExportOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { adminApi } from '../../../../apis/admin.api.ts';
import CommonSearch from '../../../../components/CommonSearch.tsx';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Log level configuration
const LOG_LEVELS = {
  ERROR: { color: 'red', label: 'Error' },
  WARN: { color: 'orange', label: 'Warning' },
  INFO: { color: 'blue', label: 'Info' },
  DEBUG: { color: 'green', label: 'Debug' },
};

interface LogEntry {
  id: string;
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  message: string;
  metadata?: Record<string, any>;
  userId?: string;
  user?: {
    id: string;
    email: string;
    nickname?: string;
  };
  ipAddress?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  responseTime?: number;
  timestamp: string;
}

interface LogStats {
  totalLogs: number;
  errorCount: number;
  warnCount: number;
  infoCount: number;
  debugCount: number;
  todayLogs: number;
  avgResponseTime: number;
}

interface LogFilter {
  level?: string;
  userId?: string;
  endpoint?: string;
  method?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const AdminLogPage: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logStats, setLogStats] = useState<LogStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  // Modals and drawers
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [clearModalVisible, setClearModalVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  // Forms and filters
  const [createForm] = Form.useForm();
  const [clearForm] = Form.useForm();
  const [filters, setFilters] = useState<LogFilter>({});

  // Fetch logs
  const fetchLogs = async (newFilters: LogFilter = {}) => {
    setLoading(true);
    try {
      const allFilters = { ...filters, ...newFilters };
      const response = await adminApi.getLogs(allFilters);
      const result = response.data;

      if (result.success) {
        setLogs(result.data.logs || []);
        setPagination({
          page: result.data.page || 1,
          limit: result.data.limit || 50,
          total: result.data.total || 0,
          totalPages: result.data.totalPages || 0,
        });
        setFilters(allFilters);
      } else {
        message.error(result.message || 'Failed to fetch logs');
      }
    } catch (error) {
      message.error('Failed to fetch logs');
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch log statistics
  const fetchLogStats = async () => {
    setStatsLoading(true);
    try {
      const response = await adminApi.getLogStats();
      const result = response.data;

      if (result.success) {
        setLogStats(result.data);
      } else {
        message.error(result.message || 'Failed to fetch log statistics');
      }
    } catch (error) {
      message.error('Failed to fetch log statistics');
      console.error('Error fetching log stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Export logs
  const handleExportLogs = async () => {
    try {
      const response = await adminApi.exportLogs(filters);
      const result = response.data;

      if (result.success) {
        message.success('Logs exported successfully');
      } else {
        message.error(result.message || 'Failed to export logs');
      }
    } catch (error) {
      message.error('Failed to export logs');
      console.error('Error exporting logs:', error);
    }
  };

  // Clear old logs
  const handleClearOldLogs = async (values: { daysToKeep: number }) => {
    try {
      const response = await adminApi.clearOldLogs(values.daysToKeep);
      const result = response.data;

      if (result.success) {
        message.success(`Successfully deleted ${result.data?.deletedCount || 0} old log entries`);
        setClearModalVisible(false);
        clearForm.resetFields();
        fetchLogs();
        fetchLogStats();
      } else {
        message.error(result.message || 'Failed to clear old logs');
      }
    } catch (error) {
      message.error('Failed to clear old logs');
      console.error('Error clearing old logs:', error);
    }
  };

  // Create log entry
  const handleCreateLog = async (values: any) => {
    try {
      const logData = {
        ...values,
        metadata: values.metadata ? JSON.parse(values.metadata) : undefined,
      };

      const response = await adminApi.createLogEntry(logData);
      const result = response.data;

      if (result.success) {
        message.success('Log entry created successfully');
        setCreateModalVisible(false);
        createForm.resetFields();
        fetchLogs();
        fetchLogStats();
      } else {
        message.error(result.message || 'Failed to create log entry');
      }
    } catch (error) {
      message.error('Failed to create log entry');
      console.error('Error creating log entry:', error);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    fetchLogs(newFilters);
  };

  // Handle search
  const handleSearch = (searchText: string) => {
    handleFilterChange('search', searchText);
  };

  // Handle pagination change
  const handleTableChange = (page: number, pageSize: number) => {
    fetchLogs({ ...filters, page, limit: pageSize });
  };

  // Handle date range change
  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      handleFilterChange('startDate', dates[0].toISOString());
      handleFilterChange('endDate', dates[1].toISOString());
    } else {
      const newFilters = { ...filters };
      delete newFilters.startDate;
      delete newFilters.endDate;
      fetchLogs(newFilters);
    }
  };

  // View log details
  const viewLogDetails = (log: LogEntry) => {
    setSelectedLog(log);
    setDetailDrawerVisible(true);
  };

  useEffect(() => {
    fetchLogs();
    fetchLogStats();
  }, []);

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (timestamp: string) => (
        <Tooltip title={dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss.SSS')}>
          <Text code>{dayjs(timestamp).format('MM-DD HH:mm:ss')}</Text>
        </Tooltip>
      ),
      sorter: true,
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level: keyof typeof LOG_LEVELS) => {
        const config = LOG_LEVELS[level];
        return (
          <Tag color={config.color} style={{ margin: 0 }}>
            {config.label}
          </Tag>
        );
      },
      filters: Object.entries(LOG_LEVELS).map(([key, value]) => ({
        text: value.label,
        value: key,
      })),
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
      render: (message: string) => (
        <Tooltip title={message}>
          <Text>{message}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      width: 150,
      render: (user: any, record: LogEntry) => {
        if (user) {
          return (
            <Tooltip title={`ID: ${user.id}, Email: ${user.email}`}>
              <Text>{user.nickname || user.email}</Text>
            </Tooltip>
          );
        }
        return record.userId ? (
          <Text type="secondary">ID: {record.userId}</Text>
        ) : (
          <Text type="secondary">System</Text>
        );
      },
    },
    {
      title: 'Endpoint',
      dataIndex: 'endpoint',
      key: 'endpoint',
      width: 200,
      render: (endpoint: string, record: LogEntry) => {
        if (endpoint) {
          return (
            <Space size="small">
              <Tag color="blue" style={{ fontSize: '10px', padding: '0 4px' }}>
                {record.method}
              </Tag>
              <Text code style={{ fontSize: '11px' }}>
                {endpoint}
              </Text>
            </Space>
          );
        }
        return <Text type="secondary">-</Text>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'statusCode',
      key: 'statusCode',
      width: 100,
      render: (statusCode: number, record: LogEntry) => {
        if (statusCode) {
          let color = 'default';
          if (statusCode >= 200 && statusCode < 300) color = 'success';
          else if (statusCode >= 400 && statusCode < 500) color = 'warning';
          else if (statusCode >= 500) color = 'error';

          return (
            <div>
              <Tag color={color}>{statusCode}</Tag>
              {record.responseTime && (
                <div style={{ fontSize: '10px', color: '#666' }}>{record.responseTime}ms</div>
              )}
            </div>
          );
        }
        return <Text type="secondary">-</Text>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_: any, record: LogEntry) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => viewLogDetails(record)}
        />
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Log Management</Title>
      <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
        View and manage application logs, monitor system activity, and track user actions.
      </Text>

      {/* Statistics Cards */}
      {logStats && (
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={4}>
            <Card>
              <Statistic
                title="Total Logs"
                value={logStats.totalLogs}
                loading={statsLoading}
                prefix={<InfoCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Errors"
                value={logStats.errorCount}
                loading={statsLoading}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Warnings"
                value={logStats.warnCount}
                loading={statsLoading}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Info"
                value={logStats.infoCount}
                loading={statsLoading}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Today's Logs"
                value={logStats.todayLogs}
                loading={statsLoading}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Avg Response"
                value={logStats.avgResponseTime}
                loading={statsLoading}
                suffix="ms"
                precision={0}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col span={4}>
            <Select
              placeholder="Log Level"
              value={filters.level}
              onChange={(value) => handleFilterChange('level', value)}
              allowClear
              style={{ width: '100%' }}
            >
              {Object.entries(LOG_LEVELS).map(([key, value]) => (
                <Option key={key} value={key}>
                  <Tag color={value.color} style={{ margin: 0 }}>
                    {value.label}
                  </Tag>
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <Input
              placeholder="User ID"
              value={filters.userId}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Input
              placeholder="Endpoint"
              value={filters.endpoint}
              onChange={(e) => handleFilterChange('endpoint', e.target.value)}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="HTTP Method"
              value={filters.method}
              onChange={(value) => handleFilterChange('method', value)}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="PATCH">PATCH</Option>
              <Option value="DELETE">DELETE</Option>
            </Select>
          </Col>
          <Col span={8}>
            <RangePicker
              value={
                filters.startDate && filters.endDate
                  ? [dayjs(filters.startDate), dayjs(filters.endDate)]
                  : null
              }
              onChange={handleDateRangeChange}
              style={{ width: '100%' }}
              showTime
            />
          </Col>
        </Row>
      </Card>

      {/* Search and Controls */}
      <CommonSearch
        searchPlaceholder="Search in messages, endpoints, metadata..."
        searchValue={filters.search || ''}
        onSearch={handleSearch}
        onRefresh={() => {
          fetchLogs();
          fetchLogStats();
        }}
        loading={loading || statsLoading}
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
            >
              Create Log
            </Button>
            <Button icon={<ExportOutlined />} onClick={handleExportLogs}>
              Export
            </Button>
            <Popconfirm
              title="Clear Old Logs"
              description="This will permanently delete old log entries. Are you sure?"
              onConfirm={() => setClearModalVisible(true)}
              okText="Yes"
              cancelText="No"
            >
              <Button icon={<ClearOutlined />} danger>
                Clear Old Logs
              </Button>
            </Popconfirm>
          </Space>
        }
      />

      {/* Logs Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={logs}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} logs`,
            pageSizeOptions: ['20', '50', '100', '200'],
            onChange: handleTableChange,
            onShowSizeChange: handleTableChange,
          }}
          scroll={{ x: 1200 }}
          size="small"
        />
      </Card>

      {/* Create Log Modal */}
      <Modal
        title="Create Log Entry"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          createForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreateLog}>
          <Form.Item
            name="level"
            label="Log Level"
            rules={[{ required: true, message: 'Please select a log level' }]}
          >
            <Select placeholder="Select log level">
              {Object.entries(LOG_LEVELS).map(([key, value]) => (
                <Option key={key} value={key}>
                  <Tag color={value.color} style={{ margin: 0 }}>
                    {value.label}
                  </Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="message"
            label="Message"
            rules={[{ required: true, message: 'Please enter a message' }]}
          >
            <TextArea rows={3} placeholder="Enter log message" />
          </Form.Item>
          <Form.Item name="metadata" label="Metadata (JSON)" help="Optional JSON metadata object">
            <TextArea rows={4} placeholder='{"key": "value", "another": 123}' />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setCreateModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Create Log
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Clear Old Logs Modal */}
      <Modal
        title="Clear Old Logs"
        open={clearModalVisible}
        onCancel={() => {
          setClearModalVisible(false);
          clearForm.resetFields();
        }}
        footer={null}
      >
        <Alert
          message="Warning"
          description="This action will permanently delete old log entries and cannot be undone."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Form
          form={clearForm}
          layout="vertical"
          onFinish={handleClearOldLogs}
          initialValues={{ daysToKeep: 30 }}
        >
          <Form.Item
            name="daysToKeep"
            label="Days to Keep"
            rules={[
              { required: true, message: 'Please enter the number of days' },
              { type: 'number', min: 1, message: 'Must be at least 1 day' },
            ]}
          >
            <InputNumber
              min={1}
              max={365}
              placeholder="Number of days to keep"
              style={{ width: '100%' }}
              addonAfter="days"
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setClearModalVisible(false)}>Cancel</Button>
              <Button type="primary" danger htmlType="submit">
                Clear Old Logs
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Log Details Drawer */}
      <Drawer
        title="Log Details"
        placement="right"
        width={600}
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
      >
        {selectedLog && (
          <div>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="ID">
                <Text code>{selectedLog.id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Timestamp">
                {dayjs(selectedLog.timestamp).format('YYYY-MM-DD HH:mm:ss.SSS')}
              </Descriptions.Item>
              <Descriptions.Item label="Level">
                <Tag color={LOG_LEVELS[selectedLog.level].color}>
                  {LOG_LEVELS[selectedLog.level].label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Message">{selectedLog.message}</Descriptions.Item>
              {selectedLog.user && (
                <Descriptions.Item label="User">
                  <div>
                    <div>
                      <strong>Name:</strong> {selectedLog.user.nickname || 'N/A'}
                    </div>
                    <div>
                      <strong>Email:</strong> {selectedLog.user.email}
                    </div>
                    <div>
                      <strong>ID:</strong> {selectedLog.user.id}
                    </div>
                  </div>
                </Descriptions.Item>
              )}
              {selectedLog.userId && !selectedLog.user && (
                <Descriptions.Item label="User ID">{selectedLog.userId}</Descriptions.Item>
              )}
              {selectedLog.endpoint && (
                <Descriptions.Item label="Endpoint">
                  <Space>
                    <Tag color="blue">{selectedLog.method}</Tag>
                    <Text code>{selectedLog.endpoint}</Text>
                  </Space>
                </Descriptions.Item>
              )}
              {selectedLog.statusCode && (
                <Descriptions.Item label="Status Code">{selectedLog.statusCode}</Descriptions.Item>
              )}
              {selectedLog.responseTime && (
                <Descriptions.Item label="Response Time">
                  {selectedLog.responseTime}ms
                </Descriptions.Item>
              )}
              {selectedLog.ipAddress && (
                <Descriptions.Item label="IP Address">{selectedLog.ipAddress}</Descriptions.Item>
              )}
              {selectedLog.userAgent && (
                <Descriptions.Item label="User Agent">
                  <Text code style={{ wordBreak: 'break-all' }}>
                    {selectedLog.userAgent}
                  </Text>
                </Descriptions.Item>
              )}
              {selectedLog.metadata && (
                <Descriptions.Item label="Metadata">
                  <pre
                    style={{
                      background: '#f5f5f5',
                      padding: 8,
                      borderRadius: 4,
                      overflow: 'auto',
                      maxHeight: 200,
                    }}
                  >
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default AdminLogPage;
