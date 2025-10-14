import React, { useEffect, useState } from 'react';
import { adminApi } from '../apis/admin.api.ts';
import { Table, Button, Spin, Input, Form, message } from 'antd';

interface Config {
  id?: string | number;
  key: string;
  value: string;
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
      setConfigs(res.data as Config[]);
    } catch {
      setConfigs([]);
    }
    setLoading(false);
  };

  const columns = [
    { title: 'Key', dataIndex: 'key', key: 'key' },
    { title: 'Value', dataIndex: 'value', key: 'value' },
    { title: 'Actions', key: 'actions', render: (_: unknown, c: Config) => (
      <>
        <Button onClick={() => form.setFieldsValue({ key: c.key, value: c.value, id: c.id })}>Edit</Button>
        <Button
          danger
          disabled={c.id === undefined}
          onClick={() => {
            if (c.id !== undefined) {
              adminApi.deleteConfig(c.id).then(fetchConfigs);
            }
          }}
        >
          Delete
        </Button>
      </>
    ) },
  ];

  const onFinish = async (values: Config): Promise<void> => {
    try {
      if (values.id) {
        await adminApi.updateConfig(values.id, { key: values.key, value: values.value });
        message.success('Config updated');
      } else {
        await adminApi.createConfig({ key: values.key, value: values.value });
        message.success('Config created');
      }
      form.resetFields();
      fetchConfigs();
    } catch {
      message.error('Error saving config');
    }
  };

  return (
    <div>
      <h2>Config Table</h2>
      <Form form={form} layout="inline" onFinish={onFinish} style={{ marginBottom: 16 }}>
        <Form.Item name="key" rules={[{ required: true, message: 'Key required' }]}> <Input placeholder="Config Key" /> </Form.Item>
        <Form.Item name="value" rules={[{ required: true, message: 'Value required' }]}> <Input placeholder="Config Value" /> </Form.Item>
        <Form.Item name="id" style={{ display: 'none' }}> <Input type="hidden" /> </Form.Item>
        <Form.Item> <Button type="primary" htmlType="submit">Save</Button> </Form.Item>
        <Form.Item> <Button onClick={() => form.resetFields()}>Cancel</Button> </Form.Item>
      </Form>
      <Spin spinning={loading}>
        <Table
          dataSource={configs}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Spin>
    </div>
  );
}
