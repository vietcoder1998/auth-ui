import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Modal, Spin, message, Popconfirm, Typography } from 'antd';
import { DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import CommonSearch from '../../../components/CommonSearch.tsx';
import { getApiInstance } from '../../../apis/index.ts';
import UploadFileModal from '../../blog/modals/UploadFileModal.tsx';

export default function AdminFileListPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async (search?: string) => {
    setLoading(true);
    try {
      const axios = getApiInstance();
      const res = await axios.get('/admin/documents', { params: { search } });
      setFiles(res.data.data.data || []);
    } catch (error) {
      message.error('Failed to load files');
      setFiles([]);
    }
    setLoading(false);
  };
  const handleSearch = (value: string) => {
    setSearchValue(value);
    fetchFiles(value);
  };

  const handleDelete = async (id: string) => {
    const axios = getApiInstance();
    await axios.delete(`/admin/documents/${id}`);
    fetchFiles(searchValue);
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
      render: (_: any, file: any) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            icon={<DownloadOutlined />}
            type="text"
            size="small"
            onClick={() => {
              window.open(`/api/admin/files/download/${encodeURIComponent(file.filename)}`);
            }}
            title="Download"
          />
          <Popconfirm
            title="Are you sure you want to delete this file?"
            onConfirm={() => handleDelete(file.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} type="text" danger size="small" title="Delete" />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Typography.Title level={3} style={{ marginBottom: 16 }}>
        Admin File List
      </Typography.Title>
      <CommonSearch
        searchPlaceholder="Search files..."
        searchValue={searchValue}
        onSearch={handleSearch}
        style={{ marginBottom: 16 }}
      />
      <Button
        type="primary"
        style={{ marginBottom: 16 }}
        onClick={() => setUploadModalVisible(true)}
      >
        Upload File
      </Button>
      <Spin spinning={loading}>
        <Table rowKey="id" columns={columns} dataSource={files} pagination={{ pageSize: 10 }} />
      </Spin>
      <UploadFileModal
        visible={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        onSuccess={() => {
          setUploadModalVisible(false);
          fetchFiles(searchValue);
        }}
      />
    </div>
  );
}
