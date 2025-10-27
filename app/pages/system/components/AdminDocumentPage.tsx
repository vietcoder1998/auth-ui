import React, { useEffect, useState } from 'react';
import { documentApi } from '../../../apis/document.api.ts';
import {
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Spin,
  Upload,
  message,
  Popconfirm,
  Typography,
} from 'antd';
import {
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import CommonSearch from '../../../components/CommonSearch.tsx';

export default function AdminDocumentPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  // Always use type 'document'
  const [searchValue, setSearchValue] = useState('');
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async (search?: string) => {
    setLoading(true);
    try {
      const res = await documentApi.listDocuments({ type: 'document', search });
      setDocuments(res.data.data.data || []);
    } catch (error) {
      message.error('Failed to load documents');
      setDocuments([]);
    }
    setLoading(false);
  };
  const handleSearch = (value: string) => {
    setSearchValue(value);
    fetchDocuments(value);
  };

  const handleDelete = async (id: string) => {
    await documentApi.deleteDocument(id);
    fetchDocuments(searchValue);
  };

  const handleUpload = async (info: any) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', info.file);
    formData.append('type', 'document');
    try {
      await documentApi.uploadFile(formData);
      // Optionally, add a new record to documents table if not handled by backend
      // await documentApi.createDocument({ name: info.file.name, type: 'document', ... });
      message.success('File uploaded');
      setUploadModalVisible(false);
      await fetchDocuments();
    } catch (error) {
      message.error('Upload failed');
    }
    setUploading(false);
  };

  const handleStartExtractJob = async (doc: any) => {
    try {
      await documentApi.startExtractJob(doc.id);
      message.success('Extract job started');
    } catch (error) {
      message.error('Failed to start extract job');
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'originalname', key: 'originalname' },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (t: string) => <Tag color="blue">{t}</Tag>,
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      render: (s: number) => `${(s / 1024).toFixed(2)} KB`,
    },
    {
      title: 'Uploaded',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d: string) => new Date(d).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, doc: any) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Popconfirm
            title="Are you sure you want to delete this document?"
            onConfirm={() => handleDelete(doc.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} type="text" danger size="small" title="Delete" />
          </Popconfirm>
          <Button
            icon={<PlayCircleOutlined />}
            type="text"
            size="small"
            onClick={() => handleStartExtractJob(doc)}
            title="Extract"
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <Typography.Title level={3} style={{ marginBottom: 16 }}>
        Admin Document Management
      </Typography.Title>
      <CommonSearch
        searchPlaceholder="Search documents..."
        searchValue={searchValue}
        onSearch={handleSearch}
        style={{ marginBottom: 16 }}
      />
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setUploadModalVisible(true)}
        style={{ marginBottom: 16 }}
      >
        Upload Document
      </Button>
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
