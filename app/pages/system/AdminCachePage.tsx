import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Statistic,
  Row,
  Col,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Tag,
  Tooltip,
  Select,
  Divider
} from 'antd';
import { adminApi } from '../apis/admin.api.ts';
import {
  DeleteOutlined,
  ReloadOutlined,
  ClearOutlined,
  PlusOutlined,
  SearchOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface CacheItem {
  key: string;
  value: any;
  ttl: string;
  size: number;
}

interface CacheStats {
  totalKeys: number;
  totalMemoryUsage: string;
  uptime: string;
  connectedClients: string;
  dataSize: string;
  patterns: {
    [key: string]: number;
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const AdminCachePage: React.FC = () => {
  const [cacheData, setCacheData] = useState<CacheItem[]>([]);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  
  // Modals
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [clearPatternModalVisible, setClearPatternModalVisible] = useState(false);
  const [selectedCache, setSelectedCache] = useState<CacheItem | null>(null);
  
  // Form and filters
  const [form] = Form.useForm();
  const [clearPatternForm] = Form.useForm();
  const [searchPattern, setSearchPattern] = useState('*');

  // Fetch cache data
  const fetchCacheData = async (page = 1, limit = 20, pattern = '*') => {
    setLoading(true);
    try {
      const response = await adminApi.getCacheKeys({ page, limit, pattern });
      const result = response.data;
      
      if (result.success) {
        setCacheData(result.data || []);
        setPagination(result.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
      } else {
        message.error(result.message || 'Failed to fetch cache data');
      }
    } catch (error) {
      message.error('Failed to fetch cache data');
      console.error('Error fetching cache data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch cache statistics
  const fetchCacheStats = async () => {
    setStatsLoading(true);
    try {
      const response = await adminApi.getCacheStats();
      const result = response.data;
      
      if (result.success) {
        setCacheStats(result.data);
      } else {
        message.error(result.message || 'Failed to fetch cache statistics');
      }
    } catch (error) {
      message.error('Failed to fetch cache statistics');
      console.error('Error fetching cache stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Delete cache key
  const handleDeleteKey = async (key: string) => {
    try {
      const response = await adminApi.deleteCacheKey(key);
      const result = response.data;
      
      if (result.success) {
        message.success(`Cache key '${key}' deleted successfully`);
        fetchCacheData(pagination.page, pagination.limit, searchPattern);
        fetchCacheStats();
      } else {
        message.error(result.message || 'Failed to delete cache key');
      }
    } catch (error) {
      message.error('Failed to delete cache key');
      console.error('Error deleting cache key:', error);
    }
  };

  // Clear all cache
  const handleClearAllCache = async () => {
    try {
      const response = await adminApi.clearAllCache();
      const result = response.data;
      
      if (result.success) {
        message.success('All cache cleared successfully');
        fetchCacheData(1, pagination.limit, searchPattern);
        fetchCacheStats();
      } else {
        message.error(result.message || 'Failed to clear all cache');
      }
    } catch (error) {
      message.error('Failed to clear all cache');
      console.error('Error clearing all cache:', error);
    }
  };

  // Clear cache by pattern
  const handleClearByPattern = async (values: { pattern: string }) => {
    try {
      const response = await adminApi.clearCacheByPattern(values.pattern);
      const result = response.data;
      
      if (result.success) {
        message.success(`${result.data?.deleted || 0} cache keys deleted`);
        setClearPatternModalVisible(false);
        clearPatternForm.resetFields();
        fetchCacheData(pagination.page, pagination.limit, searchPattern);
        fetchCacheStats();
      } else {
        message.error(result.message || 'Failed to clear cache by pattern');
      }
    } catch (error) {
      message.error('Failed to clear cache by pattern');
      console.error('Error clearing cache by pattern:', error);
    }
  };

  // Add cache value
  const handleAddCache = async (values: { key: string; value: string; ttl?: number }) => {
    try {
      let parsedValue;
      try {
        parsedValue = JSON.parse(values.value);
      } catch {
        parsedValue = values.value; // Use as string if not valid JSON
      }

      const response = await adminApi.setCacheValue({
        key: values.key,
        value: parsedValue,
        ttl: values.ttl
      });
      const result = response.data;
      
      if (result.success) {
        message.success(`Cache key '${values.key}' set successfully`);
        setAddModalVisible(false);
        form.resetFields();
        fetchCacheData(pagination.page, pagination.limit, searchPattern);
        fetchCacheStats();
      } else {
        message.error(result.message || 'Failed to set cache value');
      }
    } catch (error) {
      message.error('Failed to set cache value');
      console.error('Error setting cache value:', error);
    }
  };

  // View cache value
  const handleViewCache = (record: CacheItem) => {
    setSelectedCache(record);
    setViewModalVisible(true);
  };

  // Handle search
  const handleSearch = (pattern: string) => {
    setSearchPattern(pattern);
    fetchCacheData(1, pagination.limit, pattern);
  };

  // Handle pagination change
  const handleTableChange = (page: number, pageSize: number) => {
    fetchCacheData(page, pageSize, searchPattern);
  };

  useEffect(() => {
    fetchCacheData();
    fetchCacheStats();
  }, []);

  const columns = [
    {
      title: 'Key',
      dataIndex: 'key',
      key: 'key',
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <Text code>{text}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'value',
      key: 'type',
      width: 100,
      render: (value: any) => {
        const type = Array.isArray(value) ? 'array' : typeof value;
        const color = type === 'object' ? 'blue' : type === 'string' ? 'green' : type === 'number' ? 'orange' : 'default';
        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: 'TTL',
      dataIndex: 'ttl',
      key: 'ttl',
      width: 120,
      render: (ttl: string) => (
        <Tag color={ttl === 'no expiry' ? 'red' : 'blue'}>{ttl}</Tag>
      ),
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      width: 100,
      render: (size: number) => `${size}B`,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: CacheItem) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<InfoCircleOutlined />}
            onClick={() => handleViewCache(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this cache key?"
            onConfirm={() => handleDeleteKey(record.key)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Cache Management</Title>
      
      {/* Statistics Cards */}
      {cacheStats && (
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Keys"
                value={cacheStats.totalKeys}
                loading={statsLoading}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Memory Usage"
                value={cacheStats.totalMemoryUsage}
                loading={statsLoading}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Uptime"
                value={cacheStats.uptime}
                loading={statsLoading}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Data Size"
                value={cacheStats.dataSize}
                loading={statsLoading}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Pattern Statistics */}
      {cacheStats && (
        <Card style={{ marginBottom: '24px' }}>
          <Title level={4}>Key Patterns</Title>
          <Row gutter={16}>
            {Object.entries(cacheStats.patterns).map(([pattern, count]) => (
              <Col span={6} key={pattern}>
                <Statistic title={pattern} value={count} />
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* Controls */}
      <Card style={{ marginBottom: '16px' }}>
        <Space style={{ marginBottom: '16px' }}>
          <Input.Search
            placeholder="Search pattern (e.g., auth:*, token:*)"
            defaultValue="*"
            onSearch={handleSearch}
            style={{ width: 300 }}
            suffix={<SearchOutlined />}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setAddModalVisible(true)}
          >
            Add Cache
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              fetchCacheData(pagination.page, pagination.limit, searchPattern);
              fetchCacheStats();
            }}
          >
            Refresh
          </Button>
          <Button
            icon={<ClearOutlined />}
            onClick={() => setClearPatternModalVisible(true)}
          >
            Clear Pattern
          </Button>
          <Popconfirm
            title="Are you sure you want to clear ALL cache?"
            description="This action cannot be undone."
            onConfirm={handleClearAllCache}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />}>
              Clear All
            </Button>
          </Popconfirm>
        </Space>
      </Card>

      {/* Cache Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={cacheData}
          loading={loading}
          rowKey="key"
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            onChange: handleTableChange,
            onShowSizeChange: handleTableChange,
          }}
        />
      </Card>

      {/* Add Cache Modal */}
      <Modal
        title="Add Cache Value"
        open={addModalVisible}
        onCancel={() => {
          setAddModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} onFinish={handleAddCache} layout="vertical">
          <Form.Item
            name="key"
            label="Cache Key"
            rules={[{ required: true, message: 'Please enter cache key' }]}
          >
            <Input placeholder="e.g., auth:user:123" />
          </Form.Item>
          
          <Form.Item
            name="value"
            label="Value (JSON)"
            rules={[{ required: true, message: 'Please enter cache value' }]}
          >
            <TextArea
              rows={6}
              placeholder='e.g., {"id": 1, "name": "John"} or "simple string"'
            />
          </Form.Item>
          
          <Form.Item
            name="ttl"
            label="TTL (seconds)"
            tooltip="Leave empty for no expiry"
          >
            <InputNumber
              min={1}
              placeholder="3600"
              style={{ width: '100%' }}
            />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Add Cache
              </Button>
              <Button onClick={() => {
                setAddModalVisible(false);
                form.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Cache Modal */}
      <Modal
        title={`Cache Value: ${selectedCache?.key}`}
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {selectedCache && (
          <div>
            <Divider orientation="left">Metadata</Divider>
            <Row gutter={16}>
              <Col span={8}>
                <Text strong>TTL: </Text><Tag color="blue">{selectedCache.ttl}</Tag>
              </Col>
              <Col span={8}>
                <Text strong>Size: </Text>{selectedCache.size}B
              </Col>
              <Col span={8}>
                <Text strong>Type: </Text>
                <Tag color="green">{Array.isArray(selectedCache.value) ? 'array' : typeof selectedCache.value}</Tag>
              </Col>
            </Row>
            
            <Divider orientation="left">Value</Divider>
            <TextArea
              value={JSON.stringify(selectedCache.value, null, 2)}
              readOnly
              rows={15}
              style={{ fontFamily: 'monospace' }}
            />
          </div>
        )}
      </Modal>

      {/* Clear Pattern Modal */}
      <Modal
        title="Clear Cache by Pattern"
        open={clearPatternModalVisible}
        onCancel={() => {
          setClearPatternModalVisible(false);
          clearPatternForm.resetFields();
        }}
        footer={null}
      >
        <Form form={clearPatternForm} onFinish={handleClearByPattern} layout="vertical">
          <Form.Item
            name="pattern"
            label="Pattern"
            rules={[{ required: true, message: 'Please enter pattern' }]}
            tooltip="Use * for wildcard, e.g., auth:*, token:user:*"
          >
            <Input placeholder="e.g., auth:*, token:*" />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" danger>
                Clear Pattern
              </Button>
              <Button onClick={() => {
                setClearPatternModalVisible(false);
                clearPatternForm.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminCachePage;