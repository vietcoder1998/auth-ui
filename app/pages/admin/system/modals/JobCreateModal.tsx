import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, message, DatePicker } from 'antd';
import { adminApi } from '~/apis/admin/index.ts';

const jobTypes = [
  { value: 'fine-tuning', label: 'Fine-tuning' },
  { value: 'backup', label: 'Backup (DB)' },
  { value: 'extract', label: 'Extract File' },
];
const scheduleTypes = [
  { value: 'onetime', label: 'One time' },
  { value: 'schedule', label: 'Schedule (daily)' },
];

export default function JobCreateModal({
  open,
  onCancel,
  onCreated,
}: {
  open: boolean;
  onCancel: () => void;
  onCreated: () => void;
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<string>('fine-tuning');
  const [scheduleType, setScheduleType] = useState<string>('onetime');
  const [conversations, setConversations] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [databases, setDatabases] = useState<any[]>([]);

  useEffect(() => {
    if (type === 'fine-tuning') {
      adminApi.getConversations().then((res: any) => {
        setConversations(
          (res.data.data || []).map((c: any) => ({ value: c.id, label: c.title || c.id }))
        );
      });
    } else if (type === 'extract') {
      adminApi.getFiles?.().then((res: any) => {
        setDocuments((res.data.data || []).map((d: any) => ({ value: d.id, label: d.filename })));
      });
    } else if (type === 'backup') {
      adminApi.getDatabaseConnections?.().then((res: any) => {
        setDatabases((res.data.data || []).map((db: any) => ({ value: db.id, label: db.name })));
      });
    }
  }, [type]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await adminApi.createJob(values);
      message.success('Job created');
      form.resetFields();
      onCreated();
    } catch (err) {
      message.error('Failed to create job');
    }
    setLoading(false);
  };

  return (
    <Modal
      open={open}
      title="Create Job"
      onCancel={onCancel}
      onOk={handleCreate}
      confirmLoading={loading}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ type: 'fine-tuning', schedule: 'onetime' }}
      >
        <Form.Item name="type" label="Job Type" rules={[{ required: true }]}>
          <Select options={jobTypes} placeholder="Select job type" onChange={setType} />
        </Form.Item>
        <Form.Item name="schedule" label="Schedule Type" rules={[{ required: true }]}>
          <Select
            options={scheduleTypes}
            placeholder="Select schedule type"
            onChange={setScheduleType}
          />
        </Form.Item>
        {scheduleType === 'schedule' && (
          <Form.Item
            name="scheduleDateTime"
            label="Schedule Date & Time"
            rules={[{ required: true }]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
          </Form.Item>
        )}
        {type === 'fine-tuning' && (
          <Form.Item name="conversationIds" label="Conversations" rules={[{ required: true }]}>
            <Select
              options={conversations}
              mode="multiple"
              placeholder="Select conversations for training"
            />
          </Form.Item>
        )}
        {type === 'extract' && (
          <Form.Item name="documentId" label="Document" rules={[{ required: true }]}>
            <Select options={documents} placeholder="Select document to extract to FAQ" />
          </Form.Item>
        )}
        {type === 'backup' && (
          <Form.Item name="databaseId" label="Database" rules={[{ required: true }]}>
            <Select options={databases} placeholder="Select database for backup" />
          </Form.Item>
        )}
        <Form.Item name="payload" label="Payload">
          <Input.TextArea placeholder="Job payload (JSON or text)" rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
