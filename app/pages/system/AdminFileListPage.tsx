import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Modal, Spin, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { getApiInstance } from '../../apis/index.ts';

export default function AdminFileListPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const axios = getApiInstance();
      const res = await axios.get('/admin/documents'); // Use document API for all files
      setFiles(res.data.data.data || []);
    } catch (error) {
      message.error('Failed to load files');
      setFiles([]);
    }
    setLoading(false);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Delete File',
      content: 'Are you sure you want to delete this file?',
      okType: 'danger',
      onOk: async () => {
        const axios = getApiInstance();
        await axios.delete(`/admin/documents/${id}`);
        fetchFiles();
      },
    });
  };

  const columns = [
    { title: 'Name', dataIndex: 'originalname', key: 'originalname' },
    { title: 'Type', dataIndex: 'type', key: 'type', render: (t: string) => <Tag color="blue">{t}</Tag> },
    { title: 'Size', dataIndex: 'size', key: 'size', render: (s: number) => `${(s / 1024).toFixed(2)} KB` },
    { title: 'Uploaded', dataIndex: 'createdAt', key: 'createdAt', render: (d: string) => new Date(d).toLocaleString() },
    {
      title: 'Actions', key: 'actions', render: (_: any, file: any) => (
        <Space>
          <Button danger icon={<DeleteOutlined />} size="small" onClick={() => handleDelete(file.id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>Admin File List</h2>
      <Spin spinning={loading}>
        <Table rowKey="id" columns={columns} dataSource={files} pagination={{ pageSize: 10 }} />
      </Spin>
    </div>
  );
}
