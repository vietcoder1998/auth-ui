import React, { useEffect, useState } from 'react';
import { Spin, Alert, Button, Card, Descriptions, Space } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { adminApi } from '../../../apis/admin.api.ts';

interface TokenValidationPageProps {
  token?: string;
}

interface UserInfo {
  id: string;
  email: string;
  nickname: string;
  status: string;
  role?: {
    name: string;
    description: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function TokenValidationPage({ token: propToken }: TokenValidationPageProps) {
  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [error, setError] = useState<string>('');
  const [countdown, setCountdown] = useState(5);

  // Get token from URL params if not provided as prop
  const urlParams = new URLSearchParams(window.location.search);
  const token = propToken || urlParams.get('token') || '';

  useEffect(() => {
    if (token) {
      validateToken();
    } else {
      setError('No token provided');
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isValid && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (isValid && countdown === 0) {
      // Auto redirect to dashboard
      redirectToMainApp();
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isValid, countdown]);

  const validateToken = async () => {
    try {
      setLoading(true);
      setError('');

      // Validate token through API
      const response = await adminApi.validateUserToken(token);

      if (response.data.success && response.data.data) {
        setIsValid(true);
        setUserInfo(response.data.data);

        // Store token in localStorage for the new session
        localStorage.setItem('token', token);
        localStorage.setItem('userEmail', response.data.data.email);
        localStorage.setItem('userNickname', response.data.data.nickname);
      } else {
        setError(response.data.message || 'Token validation failed');
        setIsValid(false);
      }
    } catch (error: any) {
      console.error('Token validation error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to validate token');
      setIsValid(false);
    } finally {
      setLoading(false);
    }
  };

  const redirectToMainApp = () => {
    // Close this window and redirect parent or open main app
    if (window.opener) {
      // If opened as popup, close this window and redirect parent
      window.opener.location.href = '/dashboard';
      window.close();
    } else {
      // If opened in same window, redirect
      window.location.href = '/dashboard';
    }
  };

  const handleManualRedirect = () => {
    redirectToMainApp();
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          flexDirection: 'column',
        }}
      >
        <Spin size="large" />
        <p style={{ marginTop: 16, fontSize: 16 }}>Validating token...</p>
      </div>
    );
  }

  if (error || !isValid) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Card style={{ maxWidth: 500, width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <CloseCircleOutlined style={{ fontSize: 48, color: '#ff4d4f', marginBottom: 16 }} />
            <h2 style={{ color: '#ff4d4f', marginBottom: 16 }}>Token Validation Failed</h2>
            <Alert
              message="Authentication Error"
              description={error || 'Invalid or expired token'}
              type="error"
              showIcon
              style={{ marginBottom: 24, textAlign: 'left' }}
            />
            <Space>
              <Button onClick={() => window.close()}>Close Window</Button>
              <Button type="primary" onClick={() => window.location.reload()}>
                Retry Validation
              </Button>
            </Space>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card style={{ maxWidth: 600, width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
          <h2 style={{ color: '#52c41a', marginBottom: 8 }}>Token Validated Successfully!</h2>
          <p style={{ color: '#666', fontSize: 16 }}>
            You are now logged in as <strong>{userInfo?.nickname}</strong>
          </p>
        </div>

        <Alert
          message="Login Successful"
          description={`Authentication token validated. You will be redirected to the main application in ${countdown} seconds.`}
          type="success"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Descriptions title="User Information" bordered column={1} style={{ marginBottom: 24 }}>
          <Descriptions.Item
            label={
              <>
                <UserOutlined style={{ marginRight: 8 }} />
                Email
              </>
            }
          >
            {userInfo?.email}
          </Descriptions.Item>
          <Descriptions.Item label="Display Name">{userInfo?.nickname}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <span
              style={{
                color: userInfo?.status === 'active' ? '#52c41a' : '#fa8c16',
                fontWeight: 'bold',
                textTransform: 'capitalize',
              }}
            >
              {userInfo?.status}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Role">
            {userInfo?.role?.name || <em style={{ color: '#999' }}>No role assigned</em>}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <>
                <ClockCircleOutlined style={{ marginRight: 8 }} />
                Member Since
              </>
            }
          >
            {userInfo?.createdAt ? new Date(userInfo.createdAt).toLocaleDateString() : 'N/A'}
          </Descriptions.Item>
        </Descriptions>

        <div style={{ textAlign: 'center' }}>
          <Space size="large">
            <Button type="primary" size="large" onClick={handleManualRedirect}>
              Go to Dashboard Now
            </Button>
            <Button size="large" onClick={() => window.close()}>
              Close Window
            </Button>
          </Space>

          <div style={{ marginTop: 16, color: '#666' }}>
            <ClockCircleOutlined style={{ marginRight: 8 }} />
            Auto-redirecting in {countdown} seconds...
          </div>
        </div>
      </Card>
    </div>
  );
}
