import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Alert, 
  Spin, 
  Typography, 
  Space, 
  Divider,
  Steps,
  Result
} from 'antd';
import { 
  KeyOutlined, 
  LoginOutlined, 
  UserOutlined, 
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { ssoLogin, validateSSOKey } from '../apis/auth.api.ts';
import { useAuth } from '../hooks/useAuth.tsx';
import AuthStatus from '../layouts/AuthStatus.tsx';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

interface SSOValidationResult {
  valid: boolean;
  matchedKeyType?: 'key' | 'ssoKey';
  sso?: {
    id: string;
    url: string;
    userId: string;
    isActive: boolean;
    expiresAt?: string;
  };
  user?: {
    id: string;
    email: string;
    nickname?: string;
  };
  error?: string;
}

const SSOLogin: React.FC = () => {
  const [form] = Form.useForm();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [validationResult, setValidationResult] = useState<SSOValidationResult | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated, loading: authLoading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      const redirect = searchParams.get('redirect');
      navigate(redirect || '/admin');
    }
  }, [isAuthenticated, authLoading, navigate, searchParams]);

  // Get SSO key from URL parameters if available
  useEffect(() => {
    const ssoKeyParam = searchParams.get('ssoKey');
    if (ssoKeyParam) {
      form.setFieldsValue({ ssoKey: ssoKeyParam });
      handleValidateKey(ssoKeyParam);
    }
  }, [searchParams]);

  const handleValidateKey = async (ssoKey: string = form.getFieldValue('ssoKey')) => {
    if (!ssoKey) {
      setError('Please enter an SSO key');
      return;
    }

    setValidating(true);
    setError(null);
    
    try {
      const result = await validateSSOKey(ssoKey);
      setValidationResult(result);
      
      if (result.valid) {
        setCurrentStep(1);
      } else {
        setError(result.error || 'Invalid SSO key');
        setCurrentStep(0);
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || 'Failed to validate SSO key';
      setError(errorMessage);
      setValidationResult(null);
      setCurrentStep(0);
    } finally {
      setValidating(false);
    }
  };

  const handleSSOLogin = async () => {
    const ssoKey = form.getFieldValue('ssoKey');
    
    if (!ssoKey || !validationResult?.valid) {
      setError('Please validate your SSO key first');
      return;
    }

    setLoading(true);
    setError(null);
    setCurrentStep(2);
    
    try {
      const result = await ssoLogin({
        ssoKey,
        deviceIP: undefined, // Will default to client IP
        userAgent: navigator.userAgent,
        location: 'SSO Web Login',
      });

      // The result should contain loginHistory and user info
      if (result.data && result.data.user) {
        // For SSO login, we need to create a compatible token format
        // The backend should provide this, but for now we'll handle it
        const userData = result.data.user;
        const mockToken = btoa(JSON.stringify({
          userId: userData.id,
          email: userData.email,
          type: 'sso',
          ssoId: result.data.loginHistory?.ssoId
        }));

        await login(mockToken, userData);
        setCurrentStep(3);
        
        // Redirect after a short delay to show success
        setTimeout(() => {
          const redirect = searchParams.get('redirect');
          navigate(redirect || '/admin');
        }, 2000);
      } else {
        throw new Error('Invalid login response');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || 'SSO login failed';
      setError(errorMessage);
      setCurrentStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyChange = () => {
    setValidationResult(null);
    setCurrentStep(0);
    setError(null);
  };

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  const steps = [
    {
      title: 'Enter SSO Key',
      status: (currentStep > 0 ? 'finish' : currentStep === 0 ? 'process' : 'wait') as 'wait' | 'process' | 'finish' | 'error',
      icon: <KeyOutlined />
    },
    {
      title: 'Validate Key',
      status: (currentStep > 1 ? 'finish' : currentStep === 1 ? 'process' : 'wait') as 'wait' | 'process' | 'finish' | 'error',
      icon: <SafetyCertificateOutlined />
    },
    {
      title: 'Login',
      status: (currentStep > 2 ? 'finish' : currentStep === 2 ? 'process' : 'wait') as 'wait' | 'process' | 'finish' | 'error',
      icon: <LoginOutlined />
    },
    {
      title: 'Success',
      status: (currentStep === 3 ? 'finish' : 'wait') as 'wait' | 'process' | 'finish' | 'error',
      icon: <CheckCircleOutlined />
    }
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: '600px',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <KeyOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
          <Title level={2} style={{ margin: 0, color: '#333' }}>SSO Login</Title>
          <Text type="secondary">Single Sign-On Authentication</Text>
        </div>

        {/* Progress Steps */}
        <Steps current={currentStep} style={{ marginBottom: '32px' }}>
          {steps.map((step, index) => (
            <Step
              key={index}
              title={step.title}
              status={step.status}
              icon={step.icon}
            />
          ))}
        </Steps>

        {/* Step 0 & 1: SSO Key Input and Validation */}
        {currentStep <= 1 && (
          <Form
            form={form}
            layout="vertical"
            onFinish={() => handleValidateKey()}
          >
            <Form.Item
              name="ssoKey"
              label="SSO Key"
              rules={[
                { required: true, message: 'Please enter your SSO key' },
                { min: 8, message: 'SSO key must be at least 8 characters' }
              ]}
            >
              <Input.Password
                prefix={<KeyOutlined />}
                placeholder="Enter your SSO key"
                size="large"
                onChange={handleKeyChange}
                disabled={validating || loading}
              />
            </Form.Item>

            {error && (
              <Alert
                message={error}
                type="error"
                style={{ marginBottom: '16px' }}
                showIcon
              />
            )}

            {validationResult && validationResult.valid && (
              <Alert
                message="SSO Key Validated Successfully"
                description={
                  <div>
                    <div><strong>User:</strong> {validationResult.user?.email}</div>
                    {validationResult.user?.nickname && (
                      <div><strong>Name:</strong> {validationResult.user.nickname}</div>
                    )}
                    <div><strong>Application:</strong> {validationResult.sso?.url}</div>
                    <div><strong>Key Type:</strong> {validationResult.matchedKeyType === 'key' ? 'Primary Key' : 'SSO Key'}</div>
                  </div>
                }
                type="success"
                style={{ marginBottom: '16px' }}
                showIcon
              />
            )}

            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Link to="/login">
                <Button>
                  <UserOutlined /> Regular Login
                </Button>
              </Link>
              
              {currentStep === 0 ? (
                <Button 
                  type="primary" 
                  htmlType="submit"
                  loading={validating}
                  size="large"
                >
                  <SafetyCertificateOutlined /> Validate Key
                </Button>
              ) : (
                <Button 
                  type="primary" 
                  onClick={handleSSOLogin}
                  loading={loading}
                  size="large"
                >
                  <LoginOutlined /> Login with SSO
                </Button>
              )}
            </Space>
          </Form>
        )}

        {/* Step 2: Login in Progress */}
        {currentStep === 2 && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>
              <Text>Logging you in...</Text>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {currentStep === 3 && (
          <Result
            status="success"
            title="SSO Login Successful!"
            subTitle={`Welcome back, ${validationResult?.user?.email}. Redirecting to your dashboard...`}
            extra={[
              <Button type="primary" key="dashboard" onClick={() => navigate('/admin')}>
                Go to Dashboard
              </Button>
            ]}
          />
        )}

        {/* Help Text */}
        {currentStep <= 1 && (
          <>
            <Divider />
            <div style={{ textAlign: 'center' }}>
              <Paragraph type="secondary" style={{ fontSize: '12px' }}>
                <ExclamationCircleOutlined /> Need help? Contact your system administrator for SSO key assistance.
              </Paragraph>
              <Paragraph type="secondary" style={{ fontSize: '12px' }}>
                Don't have an SSO key? <Link to="/login">Use regular login instead</Link>
              </Paragraph>
            </div>
          </>
        )}
      </Card>

      {/* Auth Status - Hidden for SSO login */}
      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <AuthStatus />
      </div>
    </div>
  );
};

export default SSOLogin;