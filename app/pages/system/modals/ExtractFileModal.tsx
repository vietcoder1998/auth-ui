import { Modal, Button, Upload, message, Typography } from 'antd';
import { useState } from 'react';
import { adminApi } from '../../../apis/admin.api.ts';

export default function ExtractFileModal({ open, onCancel, onExtracted, job }: any) {
  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleExtract = async () => {
    setLoading(true);
    try {
      // Example: upload file and create extract job
      // You may need to adjust API and payload
      const formData = new FormData();
      formData.append('file', file);
      await adminApi.createJob({ type: 'extract', file });
      message.success('File extracted and conversion job created');
      onExtracted && onExtracted();
      onCancel();
    } catch (err) {
      message.error('Failed to extract file');
    }
    setLoading(false);
  };

  return (
    <Modal
      open={open}
      title="Extract File to Conversion"
      onCancel={onCancel}
      onOk={handleExtract}
      confirmLoading={loading}
    >
      <Typography.Text strong>Select a document file to extract and convert:</Typography.Text>
      <Upload
        beforeUpload={(file) => {
          setFile(file);
          return false;
        }}
        showUploadList={false}
        disabled={loading}
      >
        <Button disabled={loading}>Select Document File</Button>
      </Upload>
      {file && <div style={{ marginTop: 8 }}>Selected: {file.name}</div>}
    </Modal>
  );
}
