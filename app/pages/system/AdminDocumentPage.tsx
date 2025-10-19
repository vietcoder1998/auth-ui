import React, { useEffect, useState } from 'react';
import { documentApi } from '../../apis/document.api.ts';
import { Table, Button, Tag, Space, Modal, Input, Select, Spin, Upload, message } from 'antd';
import { PlusOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';

export default function AdminDocumentPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('agent');
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [type]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await documentApi.listDocuments({ type });
      setDocuments(res.data.data || []);
    } catch (error) {
      message.error('Failed to load documents');
      setDocuments([]);
    }
    setLoading(false);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Delete Document',
      content: 'Are you sure you want to delete this document?',
      okType: 'danger',
      onOk: async () => {
        await documentApi.deleteDocument(id);
        fetchDocuments();
      },
    });
  };

  const handleUpload = async (info: any) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', info.file);
    formData.append('type', type);
    try {
      await documentApi.uploadFile(formData);
      message.success('File uploaded');
      setUploadModalVisible(false);
      fetchDocuments();
    } catch (error) {
      message.error('Upload failed');
    }
    setUploading(false);
  };

  const columns = [
    { title: 'Name', dataIndex: 'originalname', key: 'originalname' },
    { title: 'Type', dataIndex: 'type', key: 'type', render: (t: string) => <Tag color="blue">{t}</Tag> },
    { title: 'Size', dataIndex: 'size', key: 'size', render: (s: number) => `${(s / 1024).toFixed(2)} KB` },
    { title: 'Uploaded', dataIndex: 'createdAt', key: 'createdAt', render: (d: string) => new Date(d).toLocaleString() },
    {
      title: 'Actions', key: 'actions', render: (_: any, doc: any) => (
        <Space>
          <Button danger icon={<DeleteOutlined />} size="small" onClick={() => handleDelete(doc.id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>Admin Document Management</h2>
      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <Select value={type} onChange={setType} style={{ width: 180 }}>
          <Select.Option value="agent">Agent</Select.Option>
          <Select.Option value="other">Other</Select.Option>
        </Select>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setUploadModalVisible(true)}>
          Upload Document
        </Button>
      </div>
      <Spin spinning={loading}>
        <Table rowKey="id" columns={columns} dataSource={documents} pagination={{ pageSize: 10 }} />
      </Spin>
      <Modal
        title="Upload Document"
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={null}
      >
        <Upload.Dragger
          name="file"
          customRequest={handleUpload}
          multiple={false}
          showUploadList={false}
          disabled={uploading}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">Click or drag file to upload</p>
        </Upload.Dragger>
      </Modal>
    </div>
  );
}
