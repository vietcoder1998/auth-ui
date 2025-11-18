import { Col, Form, Input, InputNumber, Row, Select } from 'antd';
import React from 'react';

const { Option } = Select;

interface BasicInformationTabProps {
  // No specific props needed as it uses Form.useFormInstance() internally
}

const BasicInformationTab: React.FC<BasicInformationTabProps> = () => {
  return (
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
            <InputNumber min={1} max={65535} style={{ width: '100%' }} placeholder="80" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="Path" name="path">
        <Input placeholder="/api/v1" />
      </Form.Item>
    </div>
  );
};

export default BasicInformationTab;
