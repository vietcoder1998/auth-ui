import { ApiOutlined, CheckCircleOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { Badge, Button, Popconfirm, Space, Table, Tag, Tooltip, Typography } from 'antd';
import React from 'react';
import { type GatewayService } from '~/apis/gateway/index.ts';

const { Text } = Typography;

interface GatewayTableProps {
  services: GatewayService[];
  loading: boolean;
  onEdit: (service: GatewayService) => void;
  onDelete: (serviceId: string) => void;
  onTestConnection: (service: GatewayService) => void;
}

const GatewayTable: React.FC<GatewayTableProps> = ({
  services,
  loading,
  onEdit,
  onDelete,
  onTestConnection,
}) => {
  const columns: TableColumnsType<GatewayService> = [
    {
      title: 'Service Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: GatewayService) => (
        <Space>
          <ApiOutlined />
          <span style={{ fontWeight: 500 }}>{name}</span>
          {!record.enabled && <Tag color="default">Disabled</Tag>}
        </Space>
      ),
    },
    {
      title: 'Endpoint',
      key: 'endpoint',
      render: (_: any, record: GatewayService) => (
        <Text code>{`${record.protocol}://${record.host}:${record.port}${record.path}`}</Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: GatewayService) => {
        if (!record.enabled) {
          return <Badge status="default" text="Disabled" />;
        }

        switch (status) {
          case 'healthy':
            return (
              <Badge
                status="success"
                text={
                  <Space>
                    Healthy
                    {record.responseTime && <Text type="secondary">({record.responseTime}ms)</Text>}
                  </Space>
                }
              />
            );
          case 'unhealthy':
            return <Badge status="error" text="Unhealthy" />;
          default:
            return <Badge status="default" text="Unknown" />;
        }
      },
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[] | string) => {
        // Convert string to array if needed
        const tagArray =
          typeof tags === 'string'
            ? JSON.parse(tags)
                .map((t: string) => t.trim())
                .filter(Boolean)
            : Array.isArray(tags)
              ? tags
              : [];

        return (
          <>
            {tagArray.length > 0 ? (
              tagArray.map((tag: string) => (
                <Tag key={tag} color="blue">
                  {tag}
                </Tag>
              ))
            ) : (
              <Text type="secondary">No tags</Text>
            )}
          </>
        );
      },
    },
    {
      title: 'Last Checked',
      dataIndex: 'lastChecked',
      key: 'lastChecked',
      render: (lastChecked: string) =>
        lastChecked ? new Date(lastChecked).toLocaleString() : 'Never',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: GatewayService) => (
        <Space>
          <Tooltip title="Test Connection">
            <Button
              type="link"
              icon={<CheckCircleOutlined />}
              onClick={() => onTestConnection(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete Service"
              description="Are you sure you want to delete this service?"
              onConfirm={() => onDelete(record.id!)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" icon={<DeleteOutlined />} danger size="small" />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={services}
      loading={loading}
      rowKey="id"
      pagination={{
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} services`,
      }}
    />
  );
};

export default GatewayTable;
