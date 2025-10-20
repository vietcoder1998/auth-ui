import React from 'react';
import { Card, Row, Col, Button, Space, Tag } from 'antd';

interface SeedOperation {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => Promise<any>;
  count: number;
}

interface Props {
  seedOperations: SeedOperation[];
  seedLoading: string | null;
  handleSeedOperation: (title: string, action: () => Promise<any>) => void;
}

const SeedOperationsList: React.FC<Props> = ({
  seedOperations,
  seedLoading,
  handleSeedOperation,
}) => (
  <Card title="Individual Seed Operations">
    <Row gutter={[16, 16]}>
      {seedOperations.map((operation) => (
        <Col xs={24} sm={12} lg={8} key={operation.key}>
          <Card
            size="small"
            hoverable
            style={{ height: '100%' }}
            actions={[
              <Button
                key="seed"
                type="primary"
                size="small"
                loading={seedLoading === operation.title}
                onClick={() => handleSeedOperation(operation.title, operation.action)}
                style={{ width: '80%' }}
              >
                Seed {operation.title}
              </Button>,
            ]}
          >
            <Card.Meta
              avatar={operation.icon}
              title={
                <Space>
                  <span>{operation.title}</span>
                  <Tag color={operation.count > 0 ? 'green' : 'default'}>{operation.count}</Tag>
                </Space>
              }
              description={operation.description}
            />
          </Card>
        </Col>
      ))}
    </Row>
  </Card>
);

export default SeedOperationsList;
