import { SearchOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Badge, Button, Empty, Input, List, message, Space, Tag, Tooltip, Typography } from 'antd';
import React, { useMemo, useState } from 'react';
import { type GatewayServiceEndpoint } from '~/apis/gateway/index.ts';

const { Text } = Typography;

interface ApiEndpointsTabProps {
  endpoints?: GatewayServiceEndpoint[];
}

const ApiEndpointsTab: React.FC<ApiEndpointsTabProps> = ({ endpoints = [] }) => {
  const [searchText, setSearchText] = useState('');
  const [testingEndpoint, setTestingEndpoint] = useState<string | null>(null);
  const [endpointResults, setEndpointResults] = useState<
    Record<string, { status: number; time: number } | null>
  >({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter endpoints based on search text
  const filteredEndpoints = useMemo(() => {
    if (!searchText.trim()) {
      return endpoints;
    }

    const search = searchText.toLowerCase();
    return endpoints.filter(
      (endpoint) =>
        endpoint.path?.toLowerCase().includes(search) ||
        endpoint.method?.toLowerCase().includes(search) ||
        endpoint.gatewayPath?.toLowerCase().includes(search) ||
        endpoint.description?.toLowerCase().includes(search) ||
        endpoint.healthStatus?.toLowerCase().includes(search)
    );
  }, [endpoints, searchText]);

  // Reset to first page when search changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    setCurrentPage(1);
  };

  const handleTestEndpoint = async (endpoint: GatewayServiceEndpoint) => {
    if (!endpoint.gatewayPath) {
      message.error('Gateway path not configured for this endpoint');
      return;
    }

    // Get base URL and remove /api/v1 suffix if present to avoid duplication
    let gatewayBaseUrl = import.meta.env.VITE_GATEWAY_API_URL || 'http://localhost:5000/api/v1';
    gatewayBaseUrl = gatewayBaseUrl.replace(/\/api\/v1\/?$/, '');

    const fullUrl = `${gatewayBaseUrl}${endpoint.gatewayPath}`;

    setTestingEndpoint(endpoint.id);
    const startTime = Date.now();

    try {
      const response = await fetch(fullUrl, {
        method: endpoint.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseTime = Date.now() - startTime;

      setEndpointResults((prev) => ({
        ...prev,
        [endpoint.id]: { status: response.status, time: responseTime },
      }));

      const statusType = response.ok ? 'success' : 'error';
      message[statusType]({
        content: `${endpoint.method} ${endpoint.path} - Status: ${response.status} (${responseTime}ms)`,
        duration: 3,
      });
    } catch (error: any) {
      setEndpointResults((prev) => ({
        ...prev,
        [endpoint.id]: null,
      }));
      message.error(`Failed to ping ${endpoint.path}: ${error.message}`);
    } finally {
      setTestingEndpoint(null);
    }
  };

  return (
    <div style={{ padding: '16px 0' }}>
      {/* Search Bar */}
      <Input
        placeholder="Search endpoints by path, method, gateway path, or description..."
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={handleSearchChange}
        style={{ marginBottom: 16 }}
        allowClear
      />

      {/* Endpoints List */}
      {filteredEndpoints.length > 0 ? (
        <List
          bordered
          dataSource={filteredEndpoints}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredEndpoints.length,
            onChange: (page, size) => {
              setCurrentPage(page);
              if (size !== pageSize) {
                setPageSize(size);
                setCurrentPage(1); // Reset to first page when page size changes
              }
            },
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} endpoints`,
            pageSizeOptions: ['5', '10', '20', '50'],
          }}
          renderItem={(endpoint) => {
            const testResult = endpointResults[endpoint.id];
            // Get base URL and remove /api/v1 suffix if present to avoid duplication
            let gatewayBaseUrl =
              import.meta.env.VITE_GATEWAY_API_URL || 'http://localhost:5000/api/v1';
            gatewayBaseUrl = gatewayBaseUrl.replace(/\/api\/v1\/?$/, '');
            const fullGatewayUrl = `${gatewayBaseUrl}${endpoint.gatewayPath}`;

            return (
              <List.Item
                actions={[
                  <Tooltip key="test" title={fullGatewayUrl}>
                    <Button
                      icon={<ThunderboltOutlined />}
                      onClick={() => handleTestEndpoint(endpoint)}
                      loading={testingEndpoint === endpoint.id}
                      size="small"
                    >
                      Test
                    </Button>
                  </Tooltip>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Tag
                        color={
                          endpoint.method === 'GET'
                            ? 'blue'
                            : endpoint.method === 'POST'
                              ? 'green'
                              : endpoint.method === 'PUT'
                                ? 'orange'
                                : endpoint.method === 'DELETE'
                                  ? 'red'
                                  : 'default'
                        }
                      >
                        {endpoint.method}
                      </Tag>
                      <Text strong>{endpoint.path}</Text>
                      {endpoint.healthStatus && (
                        <Badge
                          status={
                            endpoint.healthStatus === 'healthy'
                              ? 'success'
                              : endpoint.healthStatus === 'unhealthy'
                                ? 'error'
                                : 'default'
                          }
                          text={endpoint.healthStatus}
                        />
                      )}
                      {!endpoint.enabled && <Tag color="default">Disabled</Tag>}
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      {endpoint.description && <Text type="secondary">{endpoint.description}</Text>}
                      <Text type="secondary">Gateway Path: {endpoint.gatewayPath}</Text>
                      {endpoint.responseTime && (
                        <Text type="secondary">Last Response: {endpoint.responseTime}ms</Text>
                      )}
                      {testResult && (
                        <Text type={testResult.status < 400 ? 'success' : 'danger'}>
                          Test Result: Status {testResult.status} ({testResult.time}ms)
                        </Text>
                      )}
                    </Space>
                  }
                />
              </List.Item>
            );
          }}
        />
      ) : (
        <Empty
          description={
            searchText
              ? `No endpoints found matching "${searchText}"`
              : 'No endpoints configured for this service'
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </div>
  );
};

export default ApiEndpointsTab;
