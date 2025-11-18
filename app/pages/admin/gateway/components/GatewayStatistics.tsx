import { ApiOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Card, Col, Row, Statistic } from 'antd';
import React from 'react';

interface GatewayStatisticsProps {
  totalServices: number;
  enabledServices: number;
  healthyServices: number;
  unhealthyServices: number;
}

const GatewayStatistics: React.FC<GatewayStatisticsProps> = ({
  totalServices,
  enabledServices,
  healthyServices,
  unhealthyServices,
}) => {
  return (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={6}>
        <Card>
          <Statistic title="Total Services" value={totalServices} prefix={<ApiOutlined />} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Enabled"
            value={enabledServices}
            valueStyle={{ color: '#3f8600' }}
            prefix={<CheckCircleOutlined />}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Healthy"
            value={healthyServices}
            valueStyle={{ color: '#3f8600' }}
            prefix={<CheckCircleOutlined />}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Unhealthy"
            value={unhealthyServices}
            valueStyle={{ color: '#cf1322' }}
            prefix={<CloseCircleOutlined />}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default GatewayStatistics;
