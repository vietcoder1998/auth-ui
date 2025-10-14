import React, { useEffect, useState } from 'react';
import { adminApi } from '../apis/admin.api.ts';
import { Table, Button, Spin, Input, Form, message } from 'antd';

interface Config {
  id?: string | number;
  key: string;
  value: any; // Can be any type since we now support JSON values
}

interface ConfigResponse {
  [key: string]: any;
}

export default function AdminConfigPage() {
  const [configs, setConfigs] = useState<Config[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm<Config>();

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await adminApi.getConfig();
      const configData = res.data as ConfigResponse;
      
      // Convert the key-value object to array format for the table
      const configArray: Config[] = Object.entries(configData).map(([key, value]) => ({
        key,
        value: value, // Keep the actual value without stringifying
        id: key // Use key as ID for editing
      }));
      
      setConfigs(configArray);
    } catch (error) {
      console.error('Failed to fetch configs:', error);
      setConfigs([]);
    }
    setLoading(false);
  };

  const columns = [
    { 
      title: 'Key', 
      dataIndex: 'key', 
      key: 'key',
      width: '30%'
    },
    { 
      title: 'Value', 
      dataIndex: 'value', 
      key: 'value',
      width: '50%',
      render: (value: any) => {
        // Handle different value types for display
        const renderValue = () => {
          if (value === null) return 'null';
          if (value === undefined) return 'undefined';
          if (typeof value === 'boolean') return value.toString();
          if (typeof value === 'number') return value.toString();
          if (typeof value === 'string') return value;
          if (Array.isArray(value)) {
            return value.map((item, index) => (
              <div key={index} style={{ marginLeft: '8px' }}>
                • {typeof item === 'object' ? JSON.stringify(item) : String(item)}
              </div>
            ));
          }
          if (typeof value === 'object') {
            return Object.entries(value).map(([key, val]) => (
              <div key={key} style={{ marginLeft: '8px' }}>
                <strong>{key}:</strong> {typeof val === 'object' ? JSON.stringify(val) : String(val)}
              </div>
            ));
          }
          return String(value);
        };

        return (
          <div style={{ 
            maxHeight: '120px',
            overflow: 'auto',
            fontFamily: 'monospace',
            fontSize: '12px',
            lineHeight: '1.4'
          }}>
            {renderValue()}
          </div>
        );
      }
    },
    { 
      title: 'Actions', 
      key: 'actions', 
      width: '20%',
      render: (_: unknown, c: Config) => (
        <>
          <Button 
            size="small"
            onClick={() => {
              // Convert value back to string format for editing
              const editValue = typeof c.value === 'object' ? JSON.stringify(c.value, null, 2) : String(c.value);
              form.setFieldsValue({ key: c.key, value: editValue, id: c.id });
            }}
            style={{ marginRight: 8 }}
          >
            Edit
          </Button>
          <Button
            danger
            size="small"
            disabled={c.id === undefined}
            onClick={() => {
              if (c.id !== undefined) {
                adminApi.deleteConfig(String(c.id)).then(fetchConfigs);
              }
            }}
          >
            Delete
          </Button>
        </>
      ) 
    },
  ];

  const onFinish = async (values: Config): Promise<void> => {
    try {
      // Try to parse value as JSON, if it fails, keep as string
      let parsedValue: any;
      try {
        parsedValue = JSON.parse(values.value);
      } catch {
        parsedValue = values.value;
      }

      if (values.id) {
        await adminApi.updateConfig(String(values.id), { key: values.key, value: parsedValue });
        message.success('Config updated successfully');
      } else {
        await adminApi.createConfig({ key: values.key, value: parsedValue });
        message.success('Config created successfully');
      }
      form.resetFields();
      fetchConfigs();
    } catch (error) {
      console.error('Error saving config:', error);
      message.error('Error saving config');
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Configuration Management</h2>
        <Button onClick={fetchConfigs}>Refresh</Button>
      </div>
      
      <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
        <h3 style={{ marginTop: 0 }}>Add/Edit Configuration</h3>
        <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: '#e6f7ff', borderRadius: '4px', fontSize: '12px' }}>
          <strong>Value Format Examples:</strong><br/>
          • String: <code>"Hello World"</code><br/>
          • Number: <code>123</code><br/>
          • Boolean: <code>true</code> or <code>false</code><br/>
          • Object: <code>{`{"theme": "dark", "timeout": 5000}`}</code><br/>
          • Array: <code>{`["auth", "dashboard", "reports"]`}</code>
        </div>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
            <Form.Item 
              name="key" 
              label="Configuration Key"
              rules={[{ required: true, message: 'Key is required' }]}
            > 
              <Input placeholder="e.g., cors_origin" /> 
            </Form.Item>
            <Form.Item 
              name="value" 
              label="Configuration Value"
              rules={[{ required: true, message: 'Value is required' }]}
            > 
              <Input.TextArea 
                placeholder='e.g., "http://localhost:3000" or {"theme": "dark", "notifications": true}'
                rows={4}
              /> 
            </Form.Item>
          </div>
          <Form.Item name="id" style={{ display: 'none' }}> 
            <Input type="hidden" /> 
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}> 
            <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
              Save Configuration
            </Button>
            <Button onClick={() => form.resetFields()}>Cancel</Button> 
          </Form.Item>
        </Form>
      </div>

      <Spin spinning={loading}>
        <Table
          dataSource={configs}
          columns={columns}
          rowKey="key"
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} configurations`
          }}
          scroll={{ x: 800 }}
        />
      </Spin>
    </div>
  );
}
