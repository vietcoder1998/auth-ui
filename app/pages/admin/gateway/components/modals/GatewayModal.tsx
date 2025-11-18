import { PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Switch,
  Tag,
  Typography,
  message,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { type GatewayService } from '~/apis/gateway/index.ts';

const { Title, Text } = Typography;
const { Option } = Select;

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
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState<string[]>(service?.tags || []);

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
      setTags(service.tags || []);
    } else {
      form.resetFields();
      setTags([]);
    }
  }, [service, form]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags((prev) => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (values: any) => {
    try {
      const serviceData: GatewayService = {
        ...values,
        tags,
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
      setTags([]);
      setNewTag('');
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
          <Card title="Basic Information" style={{ marginBottom: 16 }}>
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
                  <InputNumber min={1} max={65535} style={{ width: '100%' }} placeholder="80" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Path" name="path">
              <Input placeholder="/api/v1" />
            </Form.Item>
          </Card>

          <Card title="Configuration" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Retries" name="retries">
                  <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="5" />
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
          </Card>

          <Card title="Tags" style={{ marginBottom: 16 }}>
            <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag..."
                onPressEnter={handleAddTag}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddTag}
                disabled={!newTag.trim()}
              >
                Add
              </Button>
            </Space.Compact>

            {tags.length > 0 && (
              <div>
                <Text type="secondary">Tags:</Text>
                <div style={{ marginTop: 8 }}>
                  {tags.map((tag, index) => (
                    <Tag
                      key={index}
                      closable
                      onClose={() => handleRemoveTag(tag)}
                      style={{ marginBottom: 4 }}
                    >
                      {tag}
                    </Tag>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {service ? 'Update Service' : 'Create Service'}
            </Button>
          </Space>
        </Form>
      </Spin>
    </Modal>
  );
};

export default GatewayModal;
