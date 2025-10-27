import { Modal, Button, Select, message, Typography } from 'antd';
import { useState } from 'react';
import { adminApi } from '../../../../apis/admin.api.ts';

export default function FileTuningModal({ open, onCancel, onTuned, job }: any) {
  const [modal, setModal] = useState<string>('');
  const [conversion, setConversion] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleTune = async () => {
    setLoading(true);
    try {
      await adminApi.createJob({ type: 'file-tuning', modal, conversion });
      message.success('File tuning job created');
      onTuned && onTuned();
      onCancel();
    } catch (err) {
      message.error('Failed to create file tuning job');
    }
    setLoading(false);
  };

  return (
    <Modal
      open={open}
      title="File Tuning"
      onCancel={onCancel}
      onOk={handleTune}
      confirmLoading={loading}
    >
      <Typography.Text strong>Select a modal and conversion for file tuning:</Typography.Text>
      <Select
        placeholder="Select Modal"
        value={modal}
        onChange={setModal}
        style={{ width: '100%', marginBottom: 8 }}
        disabled={loading}
      >
        <Select.Option value="modal1">Modal 1</Select.Option>
        <Select.Option value="modal2">Modal 2</Select.Option>
      </Select>
      <Select
        placeholder="Select Conversion"
        value={conversion}
        onChange={setConversion}
        style={{ width: '100%' }}
        disabled={loading}
      >
        <Select.Option value="conv1">Conversion 1</Select.Option>
        <Select.Option value="conv2">Conversion 2</Select.Option>
      </Select>
    </Modal>
  );
}
