import { Modal, Button, Select, message, Typography } from 'antd';
import { useState } from 'react';
import { adminApi } from '../../../apis/admin.api.ts';

export default function BackupModal({ open, onCancel, onBackedUp, job }: any) {
  const [db, setDb] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleBackup = async () => {
    setLoading(true);
    try {
      await adminApi.createJob({ type: 'backup', db });
      message.success('Database backup created');
      onBackedUp && onBackedUp();
      onCancel();
    } catch (err) {
      message.error('Failed to create database backup');
    }
    setLoading(false);
  };

  return (
    <Modal
      open={open}
      title="Backup Database"
      onCancel={onCancel}
      onOk={handleBackup}
      confirmLoading={loading}
    >
      <Typography.Text strong>Select a database to backup as JSON:</Typography.Text>
      <Select
        placeholder="Select Database"
        value={db}
        onChange={setDb}
        style={{ width: '100%' }}
        disabled={loading}
      >
        <Select.Option value="main">Main DB</Select.Option>
        <Select.Option value="analytics">Analytics DB</Select.Option>
      </Select>
    </Modal>
  );
}
