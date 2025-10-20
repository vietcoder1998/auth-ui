import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Switch,
  DatePicker,
  Button,
  Space,
  message,
  Card,
  Row,
  Col,
  Tooltip,
  Alert,
} from 'antd';
import {
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  CopyOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { adminApi } from '../../../apis/admin.api.ts';
import dayjs from 'dayjs';

interface SSOEntry {
  id: string;
  url: string;
  key: string;
  ssoKey?: string;
  userId: string;
  deviceIP?: string;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    nickname?: string;
  };
  _count: {
    loginHistory: number;
  };
}

interface EditSSOModalProps {
  visible: boolean;
  ssoEntry: SSOEntry | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const EditSSOModal: React.FC<EditSSOModalProps> = ({ visible, ssoEntry, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [regeneratingKey, setRegeneratingKey] = useState(false);

  useEffect(() => {
    if (visible && ssoEntry) {
      form.setFieldsValue({
        url: ssoEntry.url,
        deviceIP: ssoEntry.deviceIP || '',
        isActive: ssoEntry.isActive,
        expiresAt: ssoEntry.expiresAt ? dayjs(ssoEntry.expiresAt) : null,
        ssoKey: ssoEntry.ssoKey || '',
      });
    }
  }, [visible, ssoEntry, form]);

  const handleSubmit = async (values: any) => {
    if (!ssoEntry) return;

    try {
      setLoading(true);

      const updateData = {
        url: values.url,
        deviceIP: values.deviceIP || null,
        isActive: values.isActive,
        expiresAt: values.expiresAt ? values.expiresAt.toISOString() : null,
        ssoKey: values.ssoKey || null,
      };

      await adminApi.updateSSO(ssoEntry.id, updateData);
      message.success('SSO entry updated successfully');
      onSuccess();
      onCancel();
    } catch (error: any) {
      console.error('Error updating SSO entry:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update SSO entry';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateKey = async () => {
    if (!ssoEntry) return;

    try {
      setRegeneratingKey(true);
      await adminApi.regenerateSSORKey(ssoEntry.id);
      message.success('SSO key regenerated successfully');
      onSuccess(); // Refresh parent component
      onCancel();
    } catch (error: any) {
      console.error('Error regenerating key:', error);
      const errorMessage = error.response?.data?.error || 'Failed to regenerate key';
      message.error(errorMessage);
    } finally {
      setRegeneratingKey(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success(`${label} copied to clipboard`);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      message.error('Failed to copy to clipboard');
    }
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <Modal
      title={
        <Space>
          <EditOutlined />
          Edit SSO Entry
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          <CloseOutlined /> Cancel
        </Button>,
        <Button
          key="regenerate"
          type="default"
          icon={<SyncOutlined />}
          loading={regeneratingKey}
          onClick={handleRegenerateKey}
          danger
        >
          Regenerate Key
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
          icon={<SaveOutlined />}
        >
          Save Changes
        </Button>,
      ]}
    >
      {ssoEntry && (
        <>
          {/* Basic Information Card */}
          <Card size="small" title="Basic Information" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ marginBottom: 8 }}>
                  <strong>User:</strong> {ssoEntry.user.email}
                  {ssoEntry.user.nickname && (
                    <span style={{ color: '#666' }}> ({ssoEntry.user.nickname})</span>
                  )}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong>Created:</strong> {new Date(ssoEntry.createdAt).toLocaleString()}
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: 8 }}>
                  <strong>Login Count:</strong> {ssoEntry._count.loginHistory}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong>Last Updated:</strong> {new Date(ssoEntry.updatedAt).toLocaleString()}
                </div>
              </Col>
            </Row>
          </Card>

          {/* Keys Information Card */}
          <Card size="small" title="Authentication Keys" style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 12 }}>
              <strong>Primary Key:</strong>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <Input
                  value={ssoEntry.key}
                  readOnly
                  size="small"
                  style={{ fontFamily: 'monospace', fontSize: '11px' }}
                />
                <Tooltip title="Copy Primary Key">
                  <Button
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(ssoEntry.key, 'Primary Key')}
                  />
                </Tooltip>
              </div>
            </div>
          </Card>

          {/* Status Alerts */}
          {!ssoEntry.isActive && (
            <Alert
              message="This SSO entry is currently inactive"
              type="warning"
              style={{ marginBottom: 16 }}
            />
          )}

          {ssoEntry.expiresAt && isExpired(ssoEntry.expiresAt) && (
            <Alert message="This SSO entry has expired" type="error" style={{ marginBottom: 16 }} />
          )}

          {/* Edit Form */}
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="url"
                  label="Target URL"
                  rules={[
                    { required: true, message: 'Please enter the target URL' },
                    { type: 'url', message: 'Please enter a valid URL' },
                  ]}
                >
                  <Input placeholder="https://example.com/app" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="deviceIP"
                  label="Device IP (Optional)"
                  rules={[
                    {
                      pattern: /^(\d{1,3}\.){3}\d{1,3}$/,
                      message: 'Please enter a valid IP address',
                    },
                  ]}
                >
                  <Input placeholder="192.168.1.1" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="ssoKey" label="SSO Key (Optional)">
                  <Input placeholder="Custom SSO key" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="isActive" label="Status" valuePropName="checked">
                  <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="expiresAt" label="Expiration Date (Optional)">
                  <DatePicker
                    showTime
                    style={{ width: '100%' }}
                    placeholder="Select expiration date"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </>
      )}
    </Modal>
  );
};

export default EditSSOModal;
