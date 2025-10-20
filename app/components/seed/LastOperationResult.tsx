import React from 'react';
import { Card, Alert, Tag, Typography } from 'antd';
import { CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
const { Text } = Typography;
interface DatabaseStats {
  users: number;
  roles: number;
  permissions: number;
  configs: number;
  agents: number;
  apiKeys: number;
  conversations?: number;
  messages?: number;
}

interface SeedResult {
  success: boolean;
  message: string;
  data?: DatabaseStats;
  errors?: string[];
}

interface Props {
  lastResult: SeedResult | null;
}

const LastOperationResult: React.FC<Props> = ({ lastResult }) => {
  if (!lastResult) return null;
  return (
    <Card title="Last Operation Result" style={{ marginTop: '24px' }}>
      <Alert
        message={lastResult.message}
        type={lastResult.success ? 'success' : 'error'}
        showIcon
        icon={lastResult.success ? <CheckCircleOutlined /> : <WarningOutlined />}
        style={{ marginBottom: lastResult.errors ? '16px' : 0 }}
      />
      {lastResult.errors && lastResult.errors.length > 0 && (
        <Alert
          message="Errors encountered:"
          description={
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {lastResult.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          }
          type="error"
          showIcon
        />
      )}
      {lastResult.data && (
        <div style={{ marginTop: '16px' }}>
          <Text strong>Operation Results:</Text>
          <div style={{ marginTop: '8px' }}>
            {Object.entries(lastResult.data).map(([key, value]) => (
              <Tag key={key} style={{ margin: '2px' }}>
                {key}: {value}
              </Tag>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default LastOperationResult;
