import React, { useState } from 'react';
import { Modal, Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { getApiInstance } from '../../apis/index.ts';

interface UploadFileModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const UploadFileModal: React.FC<UploadFileModalProps> = ({ visible, onCancel, onSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('Please select a file to upload.');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    fileList.forEach(file => {
      formData.append('files', file.originFileObj);
    });
    try {
      const axios = getApiInstance();
      await axios.post('/admin/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      message.success('File(s) uploaded successfully!');
      setFileList([]);
      onSuccess();
    } catch (error) {
      message.error('Failed to upload file(s)');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      title="Upload File"
      open={visible}
      onCancel={onCancel}
      onOk={handleUpload}
      confirmLoading={uploading}
      okText="Upload"
      destroyOnClose
    >
      <Upload.Dragger
        multiple
        fileList={fileList}
        beforeUpload={() => false}
        onChange={({ fileList }) => setFileList(fileList)}
        accept="*"
        style={{ marginBottom: 16 }}
      >
        <p className="ant-upload-drag-icon">
          <UploadOutlined style={{ fontSize: 32 }} />
        </p>
        <p className="ant-upload-text">Click or drag file(s) to this area to upload</p>
      </Upload.Dragger>
    </Modal>
  );
};

export default UploadFileModal;
