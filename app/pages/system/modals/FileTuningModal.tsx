import { Modal, Button, Select, message } from 'antd';
import { useState } from 'react';

export default function FileTuningModal({ open, onCancel, onTuned, job }: any) {
  const [modal, setModal] = useState<string>('');
  const [conversion, setConversion] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleTune = async () => {
    setLoading(true);
    // TODO: Call API to tune file
    setTimeout(() => {
      setLoading(false);
      message.success('File tuning job created');
      onTuned && onTuned();
      onCancel();
    }, 1000);
  };

  return (
    <Modal
      open={open}
      title="File Tuning"
      onCancel={onCancel}
      onOk={handleTune}
      confirmLoading={loading}
    >
      <Select
        placeholder="Select Modal"
        value={modal}
        onChange={setModal}
        style={{ width: '100%', marginBottom: 8 }}
      >
        <Select.Option value="modal1">Modal 1</Select.Option>
        <Select.Option value="modal2">Modal 2</Select.Option>
      </Select>
      <Select
        placeholder="Select Conversion"
        value={conversion}
        onChange={setConversion}
        style={{ width: '100%' }}
      >
        <Select.Option value="conv1">Conversion 1</Select.Option>
        <Select.Option value="conv2">Conversion 2</Select.Option>
      </Select>
    </Modal>
  );
}
