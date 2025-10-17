import { Button, Card, Space, Typography } from 'antd';
import React from 'react';
import { handleApiError } from '../utils/errorHandler.ts';

const { Title, Text } = Typography;

export const ErrorTestComponent: React.FC = () => {
  
  const test403Error = async () => {
    try {
      // This will likely fail with 403 if user doesn't have proper permissions
      const response = await fetch('/api/admin/seed/data', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(`Request failed with status code ${response.status}`);
        (error as any).response = {
          status: response.status,
          statusText: response.statusText,
          data: errorData,
        };
        (error as any).config = {
          url: '/api/admin/seed/data',
          method: 'GET',
        };
        (error as any).code = 'ERR_BAD_REQUEST';
        
        throw error;
      }
      
      console.log('Request succeeded!');
    } catch (error) {
      handleApiError(error, 'Test 403 Error');
    }
  };

  const testNetworkError = () => {
    const error = {
      message: 'Network Error',
      code: 'ERR_NETWORK',
      request: {},
      config: {
        url: '/api/nonexistent',
        method: 'GET',
      },
    };
    
    handleApiError(error, 'Test Network Error');
  };

  const testCustomError = () => {
    handleApiError(
      {
        response: {
          status: 500,
          data: {
            message: 'Internal server error occurred',
            details: 'This is a test error for demonstration',
          },
        },
        config: {
          url: '/api/test',
          method: 'POST',
        },
        code: 'ERR_INTERNAL_SERVER',
      },
      'Test Custom Error'
    );
  };

  return (
    <Card title="Error Handling Test" style={{ margin: '16px 0' }}>
      <div style={{ marginBottom: '16px' }}>
        <Text type="secondary">
          Click these buttons to test different types of errors. 
          Errors will appear at the top of the page.
        </Text>
      </div>
      
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button type="primary" onClick={test403Error}>
          Test 403 Forbidden Error (Like Your Example)
        </Button>
        
        <Button onClick={testNetworkError}>
          Test Network Error
        </Button>
        
        <Button onClick={testCustomError}>
          Test Custom 500 Error
        </Button>
      </Space>
    </Card>
  );
};

export default ErrorTestComponent;