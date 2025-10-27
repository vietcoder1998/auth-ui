import { Button, Divider, Form, Input, Modal, Select, Spin, Typography } from 'antd';
import React, { useEffect, useState } from 'react';

import { ToolApi, ToolCommandApi } from '../../../../apis/admin.api.ts';

interface ToolCommandUpdateModalProps {
  visible: boolean;
  onCancel: () => void;
  onUpdate: (values: any) => void;
  form: any;
  editingCommand: any;
}

const { Text, Title } = Typography;

const ToolCommandUpdateModal: React.FC<ToolCommandUpdateModalProps> = ({
  visible,
  onCancel,
  onUpdate,
  form,
  editingCommand,
}) => {
  const [processResult, setProcessResult] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toolOptions, setToolOptions] = useState<{ label: string; value: string }[]>([]);

  // Fetch command data by id when editingCommand changes
  useEffect(() => {
    const fetchCommand = async () => {
      if (visible && editingCommand && editingCommand.id) {
        setLoading(true);
        try {
          const res = await ToolCommandApi.getToolCommand(editingCommand.id);
          if (res?.data?.data) {
            form.setFieldsValue(res.data.data.data);
          }
        } catch (e) {
          // Optionally handle error
        } finally {
          setLoading(false);
        }
      }
    };
    const fetchTools = async () => {
      try {
        const res = await ToolApi.getTools();
        if (Array.isArray(res?.data?.data?.data)) {
          setToolOptions(
            res.data.data.data.map((tool: any) => ({
              label: tool.name || tool.label || tool.id,
              value: tool.id,
            }))
          );
        }
      } catch {}
    };
    fetchCommand();
    fetchTools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Dummy process function, replace with real API call
  const handleProcessCommand = async () => {
    setProcessing(true);
    setProcessResult(null);
    try {
      // Simulate API call
      const values = form.getFieldsValue();
      // TODO: Replace with actual process command API call
      const result = await ToolCommandApi.processCommand(values);
      setProcessResult(result);
    } catch (error: any) {
      setProcessResult({ success: false, error: error?.message || 'Error processing command' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Modal
      title="Edit Tool Command"
      open={visible}
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values: any) => {
            onUpdate(values);
          })
          .catch(() => {});
      }}
      okText="Update"
      width={800}
    >
      <Spin spinning={loading} tip="Loading...">
        <div style={{ display: 'flex', gap: 32 }}>
          <div style={{ flex: 1 }}>
            <Form form={form} layout="vertical">
              <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="description" label="Description">
                <Input.TextArea rows={2} />
              </Form.Item>
              {/* <Form.Item name="command" label="Command" rules={[{ required: true }]}>
                <Input placeholder="e.g., execute, query, transform" />
              </Form.Item> */}
              <Form.Item name="params" label="Parameters (JSON)">
                <Input.TextArea rows={4} placeholder='{"param1": "value1", "param2": "value2"}' />
              </Form.Item>
              <Form.Item name="exampleParams" label="Example Parameters (JSON)">
                <Input.TextArea rows={4} placeholder='{"param1": "value1", "param2": "value2"}' />
              </Form.Item>
              <Form.Item name="toolId" label="Tool(s)" rules={[{ required: true }]}>
                <Select
                  mode="multiple"
                  allowClear
                  placeholder="Select associated tool(s)"
                  options={toolOptions}
                  showSearch
                  optionFilterProp="label"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Form>
          </div>
          <div style={{ flex: 1, minWidth: 320, borderLeft: '1px solid #f0f0f0', paddingLeft: 24 }}>
            <Title level={5}>Process Command</Title>
            <Button
              type="primary"
              onClick={handleProcessCommand}
              loading={processing}
              style={{ marginBottom: 12 }}
            >
              Process
            </Button>
            <Divider style={{ margin: '12px 0' }} />
            <div style={{ marginBottom: 12 }}>
              <Text strong>Config (parameters):</Text>
              <pre
                style={{
                  margin: 0,
                  background: '#f6f8fa',
                  borderRadius: 4,
                  padding: 8,
                  fontSize: 13,
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {(() => {
                  try {
                    const params = form.getFieldValue('parameters');
                    if (!params) return 'No parameters.';
                    if (typeof params === 'string') {
                      return JSON.stringify(JSON.parse(params), null, 2);
                    }
                    return JSON.stringify(params, null, 2);
                  } catch {
                    return String(form.getFieldValue('parameters'));
                  }
                })()}
              </pre>
            </div>
            <div
              style={{
                minHeight: 120,
                background: '#fafafa',
                borderRadius: 4,
                padding: 12,
                fontSize: 13,
                fontFamily: 'monospace',
                overflow: 'auto',
              }}
            >
              <Text strong>Debug Output:</Text>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {processResult ? JSON.stringify(processResult, null, 2) : 'No output yet.'}
              </pre>
            </div>
          </div>
        </div>
      </Spin>
    </Modal>
  );
};

export default ToolCommandUpdateModal;
