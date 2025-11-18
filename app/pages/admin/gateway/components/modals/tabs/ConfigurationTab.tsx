import { Col, Form, InputNumber, Row, Switch } from 'antd';
import React from 'react';

interface ConfigurationTabProps {
  // No specific props needed as it uses Form.useFormInstance() internally
}

const ConfigurationTab: React.FC<ConfigurationTabProps> = () => {
  return (
    <div style={{ padding: '16px 0' }}>
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
    </div>
  );
};

export default ConfigurationTab;
