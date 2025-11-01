import { UploadOutlined } from '@ant-design/icons';
import { message, Modal, Upload, Select } from 'antd';
import React, { useState } from 'react';
import { getApiInstance } from '~/apis/index.ts';

interface UploadFileModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const UploadFileModal: React.FC<UploadFileModalProps> = ({ visible, onCancel, onSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [docType, setDocType] = useState<'backup' | 'document'>('document');

  // Clear fileList when modal is closed
  const handleCancel = () => {
    setFileList([]);
    onCancel();
  };

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('Please select a file to upload.');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append('file', file.originFileObj);
    });
    formData.append('type', docType);
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
      onCancel={handleCancel}
      onOk={handleUpload}
      confirmLoading={uploading}
      okText="Upload"
      destroyOnHidden
    >
      <Select value={docType} onChange={setDocType} style={{ width: '100%', marginBottom: 16 }}>
        <Select.Option value="document">Document</Select.Option>
        <Select.Option value="backup">Backup</Select.Option>
      </Select>
      <Upload.Dragger
        multiple={false}
        fileList={fileList}
        beforeUpload={() => false}
        onChange={({ fileList }) => setFileList(fileList.slice(-1))}
        accept="*"
        style={{ marginBottom: 16 }}
      >
        <p className="ant-upload-drag-icon">
          <UploadOutlined style={{ fontSize: 32 }} />
        </p>
        <p className="ant-upload-text">Click or drag a file to this area to upload</p>
      </Upload.Dragger>
    </Modal>
  );
};

export default UploadFileModal;
