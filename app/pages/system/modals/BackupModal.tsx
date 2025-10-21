import { Modal, Button, Select, message } from 'antd';
import { useState } from 'react';

export default function BackupModal({ open, onCancel, onBackedUp, job }: any) {
  const [db, setDb] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleBackup = async () => {
    setLoading(true);
    // TODO: Call API to backup DB as JSON
    setTimeout(() => {
      setLoading(false);
      message.success('Database backup created');
      onBackedUp && onBackedUp();
      onCancel();
    }, 1000);
  };

  return (
    <Modal
      open={open}
      title="Backup Database"
      onCancel={onCancel}
      onOk={handleBackup}
      confirmLoading={loading}
    >
      <Select placeholder="Select Database" value={db} onChange={setDb} style={{ width: '100%' }}>
        <Select.Option value="main">Main DB</Select.Option>
        <Select.Option value="analytics">Analytics DB</Select.Option>
      </Select>
    </Modal>
  );
}
