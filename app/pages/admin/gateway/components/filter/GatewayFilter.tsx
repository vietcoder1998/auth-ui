import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Col, Input, Row, Space } from 'antd';
import React from 'react';

const { Search } = Input;

interface GatewayFilterProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  onAddService: () => void;
  onRefresh: () => void;
  loading?: boolean;
}

const GatewayFilter: React.FC<GatewayFilterProps> = ({
  searchText,
  onSearchChange,
  onAddService,
  onRefresh,
  loading = false,
}) => {
  return (
    <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
      <Col>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={onAddService}>
            Add Service
          </Button>
          <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading}>
            Refresh
          </Button>
        </Space>
      </Col>
      <Col>
        <Search
          placeholder="Search services..."
          allowClear
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ width: 300 }}
        />
      </Col>
    </Row>
  );
};

export default GatewayFilter;
