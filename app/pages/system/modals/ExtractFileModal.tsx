import { Modal, Button, Upload, message } from 'antd';
import { useState } from 'react';

export default function ExtractFileModal({ open, onCancel, onExtracted, job }: any) {
  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleExtract = async () => {
    setLoading(true);
    // TODO: Call API to extract file and create conversion job
    setTimeout(() => {
      setLoading(false);
      message.success('File extracted and conversion job created');
      onExtracted && onExtracted();
      onCancel();
    }, 1000);
  };

  return (
    <Modal
      open={open}
      title="Extract File to Conversion"
      onCancel={onCancel}
      onOk={handleExtract}
      confirmLoading={loading}
    >
      <Upload
        beforeUpload={(file) => {
          setFile(file);
          return false;
        }}
        showUploadList={false}
      >
        <Button>Select Document File</Button>
      </Upload>
      {file && <div style={{ marginTop: 8 }}>Selected: {file.name}</div>}
    </Modal>
  );
}
