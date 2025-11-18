import { ApiOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Spin,
  Switch,
  Tabs,
  List,
  Space,
  Typography,
  Badge,
  message,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { type GatewayService } from '~/apis/gateway/index.ts';

const { Option } = Select;
const { Text } = Typography;

interface GatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: GatewayService) => Promise<void>;
  service?: GatewayService | null;
  loading?: boolean;
}

const GatewayModal: React.FC<GatewayModalProps> = ({
  isOpen,
  onClose,
  onSave,
  service,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [endpoints, setEndpoints] = useState<string[]>([]);
  const [newEndpoint, setNewEndpoint] = useState('');
  const [testingEndpoint, setTestingEndpoint] = useState<string | null>(null);

  useEffect(() => {
    if (service) {
      form.setFieldsValue({
        name: service.name,
        protocol: service.protocol,
        host: service.host,
        port: service.port,
        path: service.path,
        retries: service.retries,
        connectTimeout: service.connectTimeout,
        writeTimeout: service.writeTimeout,
        readTimeout: service.readTimeout,
        enabled: service.enabled,
      });
      // Load endpoints if service has any (can be extended later)
      setEndpoints([]);
    } else {
      form.resetFields();
      setEndpoints([]);
    }
  }, [service, form]);

  const handleAddEndpoint = () => {
    if (newEndpoint.trim() && !endpoints.includes(newEndpoint.trim())) {
      setEndpoints((prev) => [...prev, newEndpoint.trim()]);
      setNewEndpoint('');
    }
  };

  const handleRemoveEndpoint = (endpoint: string) => {
    setEndpoints((prev) => prev.filter((e) => e !== endpoint));
  };

  const handleTestEndpoint = async (endpoint: string) => {
    const formValues = form.getFieldsValue();
    const { protocol, host, port, path } = formValues;

    if (!host) {
      message.error('Please enter host first');
      return;
    }

    const baseUrl = `${protocol}://${host}:${port}${path}`;
    const fullUrl = `${baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

    setTestingEndpoint(endpoint);
    try {
      const response = await fetch(fullUrl, { method: 'GET' });
      const status = response.ok ? 'success' : 'error';

      message[status]({
        content: `${endpoint} - Status: ${response.status} ${response.statusText}`,
        duration: 3,
      });
    } catch (error: any) {
      message.error(`Failed to ping ${endpoint}: ${error.message}`);
    } finally {
      setTestingEndpoint(null);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const serviceData: GatewayService = {
        ...values,
        tags: service?.tags || [],
        id: service?.id,
      };
      await onSave(serviceData);
      message.success(service ? 'Service updated successfully!' : 'Service created successfully!');
      handleClose();
    } catch (error) {
      message.error('Failed to save service. Please try again.');
    }
  };

  const handleClose = () => {
    if (!loading) {
      form.resetFields();
      setEndpoints([]);
      setNewEndpoint('');
      onClose();
    }
  };

  return (
    <Modal
      title={service ? 'Edit Gateway Service' : 'Add Gateway Service'}
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      width={800}
      confirmLoading={loading}
      maskClosable={!loading}
    >
      <Spin spinning={loading} tip={service ? 'Updating service...' : 'Creating service...'}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            protocol: 'http',
            port: 80,
            path: '/',
            retries: 5,
            connectTimeout: 60000,
            writeTimeout: 60000,
            readTimeout: 60000,
            enabled: true,
          }}
        >
          <Tabs
            defaultActiveKey="1"
            items={[
              {
                key: '1',
                label: 'Basic Information',
                children: (
                  <div style={{ padding: '16px 0' }}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="Service Name"
                          name="name"
                          rules={[{ required: true, message: 'Please enter service name' }]}
                        >
                          <Input placeholder="my-service" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Protocol" name="protocol">
                          <Select>
                            <Option value="http">HTTP</Option>
                            <Option value="https">HTTPS</Option>
                            <Option value="tcp">TCP</Option>
                            <Option value="udp">UDP</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={16}>
                        <Form.Item
                          label="Host"
                          name="host"
                          rules={[{ required: true, message: 'Please enter host' }]}
                        >
                          <Input placeholder="example.com or 192.168.1.100" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item label="Port" name="port">
                          <InputNumber
                            min={1}
                            max={65535}
                            style={{ width: '100%' }}
                            placeholder="80"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item label="Path" name="path">
                      <Input placeholder="/api/v1" />
                    </Form.Item>
                  </div>
                ),
              },
              {
                key: '2',
                label: 'Configuration',
                children: (
                  <div style={{ padding: '16px 0' }}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="Retries" name="retries">
                          <InputNumber
                            min={0}
                            max={100}
                            style={{ width: '100%' }}
                            placeholder="5"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Connect Timeout (ms)" name="connectTimeout">
                          <InputNumber min={1000} style={{ width: '100%' }} placeholder="60000" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="Write Timeout (ms)" name="writeTimeout">
                          <InputNumber min={1000} style={{ width: '100%' }} placeholder="60000" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Read Timeout (ms)" name="readTimeout">
                          <InputNumber min={1000} style={{ width: '100%' }} placeholder="60000" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item label="Enable Service" name="enabled" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </div>
                ),
              },
              {
                key: '3',
                label: 'API Endpoints',
                children: (
                  <div style={{ padding: '16px 0' }}>
                    <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
                      <Input
                        value={newEndpoint}
                        onChange={(e) => setNewEndpoint(e.target.value)}
                        placeholder="Enter endpoint path (e.g., /users, /health)"
                        onPressEnter={handleAddEndpoint}
                        prefix={<ApiOutlined />}
                      />
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddEndpoint}
                        disabled={!newEndpoint.trim()}
                      >
                        Add
                      </Button>
                    </Space.Compact>

                    {endpoints.length > 0 ? (
                      <List
                        bordered
                        dataSource={endpoints}
                        renderItem={(endpoint) => {
                          const formValues = form.getFieldsValue();
                          const { protocol, host, port, path } = formValues;
                          const baseUrl = `${protocol || 'http'}://${host || 'localhost'}:${port || 80}${path || '/'}`;
                          const fullUrl = `${baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

                          return (
                            <List.Item
                              actions={[
                                <Button
                                  key="test"
                                  type="link"
                                  size="small"
                                  loading={testingEndpoint === endpoint}
                                  onClick={() => handleTestEndpoint(endpoint)}
                                >
                                  Test
                                </Button>,
                                <Button
                                  key="delete"
                                  type="link"
                                  danger
                                  size="small"
                                  icon={<DeleteOutlined />}
                                  onClick={() => handleRemoveEndpoint(endpoint)}
                                />,
                              ]}
                            >
                              <List.Item.Meta
                                title={
                                  <Space>
                                    <Badge status="default" />
                                    <Text strong>{endpoint}</Text>
                                  </Space>
                                }
                                description={
                                  <Text type="secondary" copyable={{ text: fullUrl }}>
                                    {fullUrl}
                                  </Text>
                                }
                              />
                            </List.Item>
                          );
                        }}
                      />
                    ) : (
                      <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                        <ApiOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                        <div>No endpoints added yet. Add an endpoint to test.</div>
                      </div>
                    )}
                  </div>
                ),
              },
            ]}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <Button onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {service ? 'Update Service' : 'Create Service'}
            </Button>
          </div>
        </Form>
      </Spin>
    </Modal>
  );
};

export default GatewayModal;
