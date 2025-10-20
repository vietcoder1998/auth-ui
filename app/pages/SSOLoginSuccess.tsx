import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Card, Alert, Spin, Typography, Button, Result, Steps, Space } from 'antd';
import {
  CheckCircleOutlined,
  LoadingOutlined,
  KeyOutlined,
  ExclamationCircleOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { adminApi } from '../apis/admin.api.ts';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

interface User {
  id: string;
  email: string;
  nickname?: string;
}

const SSOLoginSuccess: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const userParam = searchParams.get('user');
  const ssoId = searchParams.get('ssoId');
  const callbackUrl = searchParams.get('callback');

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Parse user data from URL params
    if (userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        setUser(userData);
      } catch (error) {
        console.error('Failed to parse user data:', error);
        setError('Invalid user data received');
        setLoading(false);
        return;
      }
    } else {
      setError('No user data received');
      setLoading(false);
      return;
    }

    // Start token creation process
    createToken();
  }, [userParam, ssoId]);

  const createToken = async () => {
    if (!user || !ssoId) {
      setError('Missing required data for token creation');
      setLoading(false);
      return;
    }

    try {
      setCurrentStep(1); // Creating token

      // Call API to create token with SSO context
      const response = await adminApi.createToken({
        userId: user.id,
        ssoId: ssoId,
        deviceIP: undefined, // Will use client IP
        userAgent: navigator.userAgent,
        location: 'SSO Login Success',
        expiresIn: '24h', // Token valid for 24 hours
      });

      const tokenData = response.data;
      setToken(tokenData.token || tokenData.id);
      setCurrentStep(2); // Token created

      // Wait a moment before redirect
      setTimeout(() => {
        setCurrentStep(3); // Redirecting
        redirectToCallback();
      }, 1500);
    } catch (error: any) {
      console.error('Error creating token:', error);
      const errorMessage = error?.response?.data?.error || 'Failed to create authentication token';
      setError(errorMessage);
      setCurrentStep(0);
    } finally {
      setLoading(false);
    }
  };

  const redirectToCallback = () => {
    if (callbackUrl && token) {
      // Redirect to callback URL with token
      const separator = callbackUrl.includes('?') ? '&' : '?';
      const finalCallbackUrl = `${callbackUrl}${separator}token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify(user))}`;

      //   setTimeout(() => {
      //     window.location.replace(finalCallbackUrl);
      //   }, 3000);
    } else {
      // No callback URL, redirect to admin dashboard
      //   setTimeout(() => {
      //     navigate('/admin');
      //   }, 1000);
    }
  };

  const steps = [
    {
      title: 'Login Complete',
      status: 'finish' as 'wait' | 'process' | 'finish' | 'error',
      icon: <CheckCircleOutlined />,
    },
    {
      title: 'Creating Token',
      status: (currentStep > 1 ? 'finish' : currentStep === 1 ? 'process' : 'wait') as
        | 'wait'
        | 'process'
        | 'finish'
        | 'error',
      icon: <KeyOutlined />,
    },
    {
      title: 'Token Ready',
      status: (currentStep > 2 ? 'finish' : currentStep === 2 ? 'process' : 'wait') as
        | 'wait'
        | 'process'
        | 'finish'
        | 'error',
      icon: <CheckCircleOutlined />,
    },
    {
      title: 'Redirecting',
      status: (currentStep === 3 ? 'process' : 'wait') as 'wait' | 'process' | 'finish' | 'error',
      icon: <LoadingOutlined />,
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: '600px',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <CheckCircleOutlined
            style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }}
          />
          <Title level={2} style={{ margin: 0, color: '#333' }}>
            SSO Login Successful!
          </Title>
          {user && <Text type="secondary">Welcome back, {user.nickname || user.email}</Text>}
        </div>

        {/* Progress Steps */}
        <Steps current={currentStep} style={{ marginBottom: '32px' }}>
          {steps.map((step, index) => (
            <Step key={index} title={step.title} status={step.status} icon={step.icon} />
          ))}
        </Steps>

        {/* Error State */}
        {error && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Alert
              message="Token Creation Failed"
              description={error}
              type="error"
              showIcon
              style={{ marginBottom: '24px' }}
            />

            <Space>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
              <Button type="primary" onClick={() => navigate('/admin')}>
                <HomeOutlined /> Go to Dashboard
              </Button>
            </Space>
          </div>
        )}

        {/* Loading State */}
        {!error && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            {currentStep === 1 && (
              <>
                <Spin size="large" />
                <div style={{ marginTop: '16px' }}>
                  <Text>Creating authentication token...</Text>
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <CheckCircleOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
                <div style={{ marginTop: '16px' }}>
                  <Text>Token created successfully!</Text>
                </div>
              </>
            )}

            {currentStep === 3 && (
              <>
                <Spin size="large" />
                <div style={{ marginTop: '16px' }}>
                  <Text>
                    {callbackUrl
                      ? 'Redirecting to your application...'
                      : 'Redirecting to dashboard...'}
                  </Text>
                </div>
              </>
            )}
          </div>
        )}

        {/* Token Information */}
        {token && !error && (
          <div style={{ marginTop: '24px' }}>
            <Alert
              message="Authentication Token Created"
              description={
                <div>
                  <div>
                    <strong>Token:</strong> {`${token.substring(0, 12)}...`}
                  </div>
                  <div>
                    <strong>Expires:</strong> 24 hours
                  </div>
                  {callbackUrl && (
                    <div>
                      <strong>Callback:</strong> {callbackUrl}
                    </div>
                  )}
                </div>
              }
              type="success"
              showIcon
            />
          </div>
        )}

        {/* Manual Actions */}
        {currentStep >= 2 && !error && (
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Space>
              {callbackUrl ? (
                <Button type="primary" onClick={redirectToCallback}>
                  Continue to Application
                </Button>
              ) : (
                <Button type="primary" onClick={() => navigate('/admin')}>
                  <HomeOutlined /> Go to Dashboard
                </Button>
              )}

              <Button onClick={() => navigate('/admin')}>
                <HomeOutlined /> Admin Dashboard
              </Button>
            </Space>
          </div>
        )}

        {/* Help Text */}
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <Paragraph type="secondary" style={{ fontSize: '12px' }}>
            <ExclamationCircleOutlined /> If you're not automatically redirected, click the button
            above.
          </Paragraph>
        </div>
      </Card>
    </div>
  );
};

export default SSOLoginSuccess;
