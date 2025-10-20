// Backup of AdminJobList.tsx on 2025-10-20

import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Space, Tag, Typography, Popconfirm, message, Spin } from 'antd';
import {
  ReloadOutlined,
  PlayCircleOutlined,
  StopOutlined,
  EyeOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { adminApi } from '../../apis/admin.api.ts';

const { Title } = Typography;

export default function AdminJobList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewJob, setViewJob] = useState<any>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getJobs();
      setJobs(res.data.data || []);
    } catch {
      message.error('Failed to load jobs');
      setJobs([]);
    }
    setLoading(false);
  };

  const handleStartJob = async (id: string) => {
    try {
      await adminApi.startJob(id);
      message.success('Job started');
      fetchJobs();
    } catch {
      message.error('Failed to start job');
    }
  };

  const handleRestartJob = async (id: string) => {
    try {
      await adminApi.restartJob(id);
      message.success('Job restarted');
      fetchJobs();
    } catch {
      message.error('Failed to restart job');
    }
  };

  const handleCancelJob = async (id: string) => {
    try {
      await adminApi.cancelJob(id);
      message.success('Job cancelled');
      fetchJobs();
    } catch {
      message.error('Failed to cancel job');
    }
  };

  const columns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        if (status === 'completed') color = 'green';
        else if (status === 'failed') color = 'red';
        else if (status === 'running') color = 'orange';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d: string) => <span>{new Date(d).toLocaleString()}</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, job: any) => (
        <Space>
          <Button icon={<EyeOutlined />} type="text" onClick={() => setViewJob(job)} title="View" />
          <Button
            icon={<PlayCircleOutlined />}
            type="text"
            onClick={() => handleStartJob(job.id)}
            title="Start"
          />
          <Button
            icon={<ReloadOutlined />}
            type="text"
            onClick={() => handleRestartJob(job.id)}
            title="Restart"
          />
          <Popconfirm title="Cancel this job?" onConfirm={() => handleCancelJob(job.id)}>
            <Button icon={<StopOutlined />} type="text" danger title="Cancel" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <Title level={2}>Job List</Title>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        style={{ marginBottom: 16 }}
        onClick={() => setCreateModalVisible(true)}
      >
        Create Job
      </Button>
      <Spin spinning={loading}>
        <Table rowKey="id" columns={columns} dataSource={jobs} pagination={{ pageSize: 10 }} />
      </Spin>
      {/* View Job Modal */}
      <Modal open={!!viewJob} title="Job Details" onCancel={() => setViewJob(null)} footer={null}>
        {viewJob && (
          <div>
            <p>
              <b>Type:</b> {viewJob.type}
            </p>
            <p>
              <b>Status:</b> {viewJob.status}
            </p>
            <p>
              <b>Created:</b> {new Date(viewJob.createdAt).toLocaleString()}
            </p>
            <p>
              <b>Result:</b> <pre>{viewJob.result}</pre>
            </p>
            <p>
              <b>Error:</b> <pre>{viewJob.error}</pre>
            </p>
            <p>
              <b>Payload:</b> <pre>{viewJob.payload}</pre>
            </p>
          </div>
        )}
      </Modal>
      <JobCreateModal
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onCreated={() => {
          setCreateModalVisible(false);
          fetchJobs();
        }}
      />
    </div>
  );
}
