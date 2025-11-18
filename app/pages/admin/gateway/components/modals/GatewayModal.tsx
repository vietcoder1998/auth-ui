import { Button, Form, message, Modal, Spin, Tabs } from 'antd';
import React, { useEffect } from 'react';
import { type GatewayService } from '~/apis/gateway/index.ts';
import { ApiEndpointsTab, BasicInformationTab, ConfigurationTab } from './tabs/index.ts';

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
    } else {
      form.resetFields();
    }
  }, [service, form]);

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
                children: <BasicInformationTab />,
              },
              {
                key: '2',
                label: 'Configuration',
                children: <ConfigurationTab />,
              },
              {
                key: '3',
                label: 'API Endpoints',
                children: <ApiEndpointsTab endpoints={service?.endpoints} />,
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
