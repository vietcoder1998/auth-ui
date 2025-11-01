// Backup of AdminJobList.tsx on 2025-10-20

import {
  EyeOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { Button, message, Modal, Popconfirm, Space, Spin, Table, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { adminApi } from '~/apis/admin/index.ts';
import JobCreateModal from '../modals/JobCreateModal.tsx';
import CommonSearch from '~/components/CommonSearch.tsx';

const { Title } = Typography;

export default function AdminJobList() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewJob, setViewJob] = useState<any>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getJobs();
      const jobsData = res.data.data || [];
      setJobs(jobsData);
      setFilteredJobs(jobsData);
    } catch {
      message.error('Failed to load jobs');
      setJobs([]);
      setFilteredJobs([]);
    }
    setLoading(false);
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    applyFilters(value, filterValues);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilterValues = { ...filterValues, [key]: value };
    setFilterValues(newFilterValues);
    applyFilters(searchValue, newFilterValues);
  };

  const applyFilters = (search: string, filters: Record<string, string>) => {
    let filtered = [...jobs];

    // Apply search filter
    if (search.trim()) {
      filtered = filtered.filter(
        (job: any) =>
          job.type?.toLowerCase().includes(search.toLowerCase()) ||
          job.status?.toLowerCase().includes(search.toLowerCase()) ||
          job.id?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter((job: any) => job.status === filters.status);
    }

    // Apply type filter
    if (filters.type) {
      filtered = filtered.filter((job: any) => job.type === filters.type);
    }

    setFilteredJobs(filtered);
  };

  const handleStartJob = (job: any) => {
    adminApi
      .startJob(job.id)
      .then(() => {
        message.success('Job started');
        fetchJobs();
      })
      .catch(() => {
        message.error('Failed to start job');
      });
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
      title: 'Total Run',
      dataIndex: 'totalRun',
      key: 'totalRun',
      render: (totalRun: number) => <Tag color="purple">{totalRun ?? 0}</Tag>,
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
            onClick={() => handleStartJob(job)}
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

  // Define filter options
  const filterOptions = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'running', label: 'Running' },
        { value: 'completed', label: 'Completed' },
        { value: 'failed', label: 'Failed' },
        { value: 'cancelled', label: 'Cancelled' },
      ],
    },
    {
      key: 'type',
      label: 'Type',
      options: [
        { value: 'extract', label: 'Extract' },
        { value: 'file-tuning', label: 'File Tuning' },
        { value: 'backup', label: 'Backup' },
        { value: 'sync', label: 'Sync' },
        { value: 'cleanup', label: 'Cleanup' },
      ],
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <Title level={2} style={{ marginBottom: 16 }}>
        Job List
      </Title>
      <CommonSearch
        searchPlaceholder="Search jobs by type, status, or ID..."
        searchValue={searchValue}
        onSearch={handleSearch}
        onRefresh={fetchJobs}
        loading={loading}
        showRefresh={true}
        filters={filterOptions}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            Create Job
          </Button>
        }
      />
      <Spin spinning={loading}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredJobs}
          pagination={{ pageSize: 10 }}
        />
      </Spin>
      {/* View Job Modal - switch by job type */}
      <Modal open={!!viewJob} title="Job Details" onCancel={() => setViewJob(null)} footer={null}>
        {viewJob && !['extract', 'file-tuning', 'backup'].includes(viewJob.type) && (
          <div>
            <p>
              <b>Type:</b> <Tag color="blue">{viewJob.type}</Tag>
            </p>
            <p>
              <b>Total Run:</b> <Tag color="purple">{viewJob.totalRun ?? 0}</Tag>
            </p>
            <p>
              <b>Status:</b>{' '}
              <Tag
                color={
                  viewJob.status === 'completed'
                    ? 'green'
                    : viewJob.status === 'failed'
                      ? 'red'
                      : viewJob.status === 'running'
                        ? 'orange'
                        : 'default'
                }
              >
                {viewJob.status}
              </Tag>
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
