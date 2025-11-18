import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Popconfirm,
  message,
  Typography,
  Row,
  Col,
  Statistic,
  Badge,
  Tooltip,
  Input,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
  ApiOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import GatewayConnectionModal from './GatewayConnectionModal.tsx';
import { gatewayApi, type GatewayService } from '~/apis/gateway/index.ts';

const { Title, Text } = Typography;
const { Search } = Input;

const GatewayManagement: React.FC = () => {
  const [services, setServices] = useState<GatewayService[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<GatewayService | null>(null);
  const [searchText, setSearchText] = useState('');

  // Mock data for demonstration
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    try {
      const fetchedServices = await gatewayApi.getServices();
      setServices(fetchedServices);
      message.success('Services loaded successfully!');
    } catch (error) {
      console.error('Failed to load services:', error);
      message.error('Failed to load services. Using mock data for demonstration.');

      // Fallback to mock data if API fails
      const mockServices: GatewayService[] = [
        {
          id: '1',
          name: 'auth-service',
          protocol: 'https',
          host: 'auth.example.com',
          port: 443,
          path: '/api/v1',
          retries: 3,
          connectTimeout: 30000,
          writeTimeout: 30000,
          readTimeout: 30000,
          enabled: true,
          tags: ['auth', 'production'],
          status: 'healthy',
          lastChecked: new Date().toISOString(),
          responseTime: 120,
        },
        {
          id: '2',
          name: 'user-service',
          protocol: 'http',
          host: 'localhost',
          port: 3001,
          path: '/api/users',
          retries: 5,
          connectTimeout: 60000,
          writeTimeout: 60000,
          readTimeout: 60000,
          enabled: false,
          tags: ['users', 'development'],
          status: 'unknown',
          lastChecked: undefined,
          responseTime: undefined,
        },
      ];
      setServices(mockServices);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = async (serviceData: GatewayService) => {
    try {
      const newService = await gatewayApi.createService(serviceData);
      setServices((prev) => [...prev, newService]);
      setModalVisible(false);
      message.success('Service created successfully!');
    } catch (error) {
      console.error('Failed to create service:', error);
      message.error('Failed to create service');
      throw error;
    }
  };

  const handleUpdateService = async (serviceData: GatewayService) => {
    try {
      if (!serviceData.id) {
        throw new Error('Service ID is required for update');
      }
      const updatedService = await gatewayApi.updateService(serviceData.id, serviceData);
      setServices((prev) =>
        prev.map((service) => (service.id === updatedService.id ? updatedService : service))
      );
      setModalVisible(false);
      setEditingService(null);
      message.success('Service updated successfully!');
    } catch (error) {
      console.error('Failed to update service:', error);
      message.error('Failed to update service');
      throw error;
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      await gatewayApi.deleteService(serviceId);
      setServices((prev) => prev.filter((service) => service.id !== serviceId));
      message.success('Service deleted successfully!');
    } catch (error) {
      console.error('Failed to delete service:', error);
      message.error('Failed to delete service');
    }
  };

  const handleTestConnection = async (service: GatewayService) => {
    if (!service.id) {
      message.error('Service ID is required for testing');
      return;
    }

    try {
      message.loading({ content: 'Testing connection...', key: 'test' });

      const result = await gatewayApi.testConnection(service.id);

      setServices((prev) =>
        prev.map((s) =>
          s.id === service.id
            ? {
                ...s,
                status: result.status,
                lastChecked: new Date().toISOString(),
                responseTime: result.responseTime,
              }
            : s
        )
      );

      message.success({
        content:
          result.status === 'healthy'
            ? `Connection successful! Response time: ${result.responseTime}ms`
            : `Connection failed! ${result.error || ''}`,
        key: 'test',
      });
    } catch (error) {
      console.error('Failed to test connection:', error);
      message.error({ content: 'Test failed', key: 'test' });
    }
  };

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchText.toLowerCase()) ||
      service.host.toLowerCase().includes(searchText.toLowerCase()) ||
      service.tags.some((tag: string) => tag.toLowerCase().includes(searchText.toLowerCase()))
  );

  const healthyCount = services.filter((s) => s.status === 'healthy').length;
  const unhealthyCount = services.filter((s) => s.status === 'unhealthy').length;
  const enabledCount = services.filter((s) => s.enabled).length;

  const columns: TableColumnsType<GatewayService> = [
    {
      title: 'Service Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: GatewayService) => (
        <Space>
          <ApiOutlined />
          <span style={{ fontWeight: 500 }}>{name}</span>
          {!record.enabled && <Tag color="default">Disabled</Tag>}
        </Space>
      ),
    },
    {
      title: 'Endpoint',
      key: 'endpoint',
      render: (_: any, record: GatewayService) => (
        <Text code>{`${record.protocol}://${record.host}:${record.port}${record.path}`}</Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: GatewayService) => {
        if (!record.enabled) {
          return <Badge status="default" text="Disabled" />;
        }

        switch (status) {
          case 'healthy':
            return (
              <Badge
                status="success"
                text={
                  <Space>
                    Healthy
                    {record.responseTime && <Text type="secondary">({record.responseTime}ms)</Text>}
                  </Space>
                }
              />
            );
          case 'unhealthy':
            return <Badge status="error" text="Unhealthy" />;
          default:
            return <Badge status="default" text="Unknown" />;
        }
      },
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <>
          {tags.map((tag) => (
            <Tag key={tag} color="blue">
              {tag}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: 'Last Checked',
      dataIndex: 'lastChecked',
      key: 'lastChecked',
      render: (lastChecked: string) =>
        lastChecked ? new Date(lastChecked).toLocaleString() : 'Never',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: GatewayService) => (
        <Space>
          <Tooltip title="Test Connection">
            <Button
              type="link"
              icon={<CheckCircleOutlined />}
              onClick={() => handleTestConnection(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingService(record);
                setModalVisible(true);
              }}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete Service"
              description="Are you sure you want to delete this service?"
              onConfirm={() => handleDeleteService(record.id!)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" icon={<DeleteOutlined />} danger size="small" />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Gateway Services Management</Title>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="Total Services" value={services.length} prefix={<ApiOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Enabled"
              value={enabledCount}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Healthy"
              value={healthyCount}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Unhealthy"
              value={unhealthyCount}
              valueStyle={{ color: '#cf1322' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Actions */}
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingService(null);
                  setModalVisible(true);
                }}
              >
                Add Service
              </Button>
              <Button icon={<ReloadOutlined />} onClick={loadServices} loading={loading}>
                Refresh
              </Button>
            </Space>
          </Col>
          <Col>
            <Search
              placeholder="Search services..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
            />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredServices}
          loading={loading}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} services`,
          }}
        />
      </Card>

      <GatewayConnectionModal
        isOpen={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingService(null);
        }}
        onSave={editingService ? handleUpdateService : handleCreateService}
        service={editingService}
      />
    </div>
  );
};

export default GatewayManagement;
