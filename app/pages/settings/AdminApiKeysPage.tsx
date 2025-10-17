import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Switch,
  Select,
  DatePicker,
  Tag,
  Space,
  Popconfirm,
  Card,
  Row,
  Col,
  Statistic,
  message,
  Tooltip,
  Typography,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  ReloadOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { adminApi } from '../../apis/admin.api.ts';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

const { TextArea } = Input;
const { Option } = Select;
const { Text, Paragraph } = Typography;

// Extend dayjs with relativeTime plugin
dayjs.extend(relativeTime);

interface ApiKey {
  id: string;
  name: string;
  key: string;
  description?: string;
  isActive: boolean;
  rateLimit?: number;
  allowedIPs?: string; // This is stored as JSON string in schema
  expiresAt?: string;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name?: string;
    email: string;
  };
  _count?: {
    apiUsageLogs: number; // Match the schema relation name
  };
}

interface ApiKeyUsage {
  totalKeys: number;
  activeKeys: number;
  expiredKeys: number;
  totalRequests: number;
  requestsToday: number;
  averageResponseTime: number;
}

export default function AdminApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [form] = Form.useForm();
  const [usage, setUsage] = useState<ApiKeyUsage>({
    totalKeys: 0,
    activeKeys: 0,
    expiredKeys: 0,
    totalRequests: 0,
    requestsToday: 0,
    averageResponseTime: 0,
  });
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchApiKeys();
    fetchUsageStats();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getApiKeys();
      setApiKeys(response.data.data);
    } catch (error) {
      message.error('Failed to fetch API keys');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsageStats = async () => {
    try {
      const response = await adminApi.getApiKeyStats();
      setUsage(response.data.data);
    } catch (error) {
      console.error('Failed to fetch usage stats:', error);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      const payload = {
        ...values,
        allowedIPs: values.allowedIPs ? JSON.stringify(values.allowedIPs.split('\n').map((ip: string) => ip.trim()).filter(Boolean)) : null,
        expiresAt: values.expiresAt ? values.expiresAt.toISOString() : null,
      };

      if (editingKey) {
        await adminApi.updateApiKey(editingKey.id, payload);
        message.success('API key updated successfully');
      } else {
        await adminApi.createApiKey(payload);
        message.success('API key created successfully');
      }

      setIsModalVisible(false);
      setEditingKey(null);
      form.resetFields();
      await fetchApiKeys();
      await fetchUsageStats();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to save API key');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (keyId: string) => {
    try {
      setLoading(true);
      await adminApi.deleteApiKey(keyId);
      message.success('API key deleted successfully');
      await fetchApiKeys();
      await fetchUsageStats();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to delete API key');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async (keyId: string) => {
    try {
      setLoading(true);
      const response = await adminApi.regenerateApiKey(keyId);
      message.success('API key regenerated successfully');
      
      // Show the new key in a modal
      Modal.info({
        title: 'New API Key Generated',
        content: (
          <div>
            <p>Your new API key has been generated. Please copy it now as it won't be shown again:</p>
            <Input.TextArea
              value={response.data.data.key}
              readOnly
              rows={3}
              style={{ fontFamily: 'monospace', backgroundColor: '#f5f5f5' }}
            />
            <Button
              type="link"
              icon={<CopyOutlined />}
              onClick={() => {
                navigator.clipboard.writeText(response.data.data.key);
                message.success('API key copied to clipboard');
              }}
            >
              Copy to clipboard
            </Button>
          </div>
        ),
        width: 500,
      });

      await fetchApiKeys();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to regenerate API key');
    } finally {
      setLoading(false);
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Copied to clipboard');
  };

  const getStatusTag = (apiKey: ApiKey) => {
    const now = dayjs();
    const expiresAt = apiKey.expiresAt ? dayjs(apiKey.expiresAt) : null;
    
    if (!apiKey.isActive) {
      return <Tag color="red" icon={<WarningOutlined />}>Disabled</Tag>;
    }
    
    if (expiresAt && expiresAt.isBefore(now)) {
      return <Tag color="orange" icon={<ClockCircleOutlined />}>Expired</Tag>;
    }
    
    return <Tag color="green" icon={<CheckCircleOutlined />}>Active</Tag>;
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ApiKey) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          {record.description && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.description}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'API Key',
      dataIndex: 'key',
      key: 'key',
      render: (key: string, record: ApiKey) => {
        const isVisible = visibleKeys.has(record.id);
        const displayKey = isVisible ? key : `${key.substring(0, 8)}${'*'.repeat(32)}`;
        
        return (
          <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
            <Text copyable={{ text: key, tooltips: ['Copy', 'Copied'] }}>
              {displayKey}
            </Text>
            <Button
              type="text"
              size="small"
              icon={isVisible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              onClick={() => toggleKeyVisibility(record.id)}
              style={{ marginLeft: 8 }}
            />
          </div>
        );
      },
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: ApiKey) => getStatusTag(record),
    },
    {
      title: 'Rate Limit',
      dataIndex: 'rateLimit',
      key: 'rateLimit',
      render: (limit: number) => limit ? `${limit}/hour` : 'Unlimited',
    },
    {
      title: 'Usage',
      key: 'usage',
      render: (record: ApiKey) => (
        <div>
          <div>{record._count?.apiUsageLogs || 0} requests</div>
          {record.lastUsedAt && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Last used: {dayjs(record.lastUsedAt).fromNow()}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Expires',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (date: string) => date ? dayjs(date).format('MMM D, YYYY') : 'Never',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: ApiKey) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingKey(record);
                const allowedIPs = record.allowedIPs ? JSON.parse(record.allowedIPs) : [];
                form.setFieldsValue({
                  ...record,
                  allowedIPs: Array.isArray(allowedIPs) ? allowedIPs.join('\n') : '',
                  expiresAt: record.expiresAt ? dayjs(record.expiresAt) : null,
                });
                setIsModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Regenerate Key">
            <Popconfirm
              title="Regenerate API Key"
              description="This will generate a new key and invalidate the current one. Are you sure?"
              onConfirm={() => handleRegenerate(record.id)}
            >
              <Button type="text" icon={<ReloadOutlined />} />
            </Popconfirm>
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete API Key"
              description="This action cannot be undone. Are you sure?"
              onConfirm={() => handleDelete(record.id)}
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{  }}>
      {/* Usage Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={4}>
          <Card>
            <Statistic title="Total Keys" value={usage.totalKeys} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="Active Keys" value={usage.activeKeys} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="Expired Keys" value={usage.expiredKeys} valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="Total Requests" value={usage.totalRequests} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="Requests Today" value={usage.requestsToday} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="Avg Response Time" value={usage.averageResponseTime} suffix="ms" />
          </Card>
        </Col>
      </Row>

      {/* API Keys Table */}
      <Card
        title="API Keys"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingKey(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
            Create API Key
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={apiKeys}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingKey ? 'Edit API Key' : 'Create API Key'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingKey(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter a name' }]}
          >
            <Input placeholder="e.g., Production API Access" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <TextArea 
              rows={3} 
              placeholder="Optional description of what this API key is used for"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Rate Limit (requests/hour)"
                name="rateLimit"
              >
                <Input type="number" placeholder="Leave empty for unlimited" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Expires At"
                name="expiresAt"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Allowed IP Addresses"
            name="allowedIPs"
          >
            <TextArea
              rows={4}
              placeholder="Enter IP addresses (one per line). Leave empty to allow all IPs.&#10;127.0.0.1&#10;192.168.1.0/24&#10;::1"
            />
          </Form.Item>

          <Form.Item
            label="Active"
            name="isActive"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>

          <Divider />

          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button 
                onClick={() => {
                  setIsModalVisible(false);
                  setEditingKey(null);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingKey ? 'Update' : 'Create'} API Key
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}