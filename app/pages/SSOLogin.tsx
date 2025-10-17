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
import { useAuth } from '../hooks/useAuth.tsx';
import { useSSOValidate } from '../hooks/useSSOValidate.tsx';
import AuthStatus from '../layouts/AuthStatus.tsx';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const SSOLogin: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [urlFixed, setUrlFixed] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  
  // Use the SSO validation hook
  const {
    validating,
    loginState,
    validationResult,
    error,
    validateSSOKey,
    performSSOLogin,
    resetState,
    setError
  } = useSSOValidate();
  
  // Check if this is a popup window
  const isPopup = searchParams.get('popup') === 'true';
  const isSSO = searchParams.get('isSSO') === 'true';
  const redirectUrl = searchParams.get('redirect');

  // Redirect if already authenticated
  useEffect(() => {
    // Block direct navigation if there is an SSO error or if this is a popup
    // If isSSO=true, bypass token validation and allow direct login
    if (isAuthenticated && !authLoading && !error && !isPopup && !isSSO) {
      const redirect = searchParams.get('redirect');
      window.location.replace(redirect || '/admin');
    }
  }, [isAuthenticated, authLoading, navigate, searchParams, error, isPopup, isSSO]);

  // Check for malformed URL and redirect properly
  useEffect(() => {
    const currentPath = window.location.pathname;
    const expectedPath = '/sso/login';
    
    // If the path contains additional segments after /sso/login, it might be a malformed URL
    if (currentPath !== expectedPath && currentPath.startsWith('/sso/login/')) {
      // Extract the potential redirect URL from the path
      const pathSegments = currentPath.replace('/sso/login/', '');
      
      // Check if it looks like a URL (contains protocol)
      if (pathSegments.includes('://')) {
        try {
          const redirectUrl = decodeURIComponent(pathSegments);
          setError(`SSO URL Error: Malformed URL detected. Redirecting to proper SSO login with redirect URL: ${redirectUrl}`);
          setUrlFixed(true);
          
          // Redirect to proper SSO login with redirect as query param
          setTimeout(() => {
            const isSSO = searchParams.get('isSSO') === 'true';
            const ssoParams = new URLSearchParams();
            ssoParams.set('redirect', redirectUrl);
            if (isSSO) ssoParams.set('isSSO', 'true');
            navigate(`/sso/login?${ssoParams.toString()}`, { replace: true });
          }, 2000);
          return;
        } catch (err) {
          setError('SSO URL Error: Invalid URL format detected. Please use proper SSO login link.');
        }
      } else {
        setError('SSO URL Error: Invalid SSO login URL format. Redirecting to correct login page.');
        setTimeout(() => {
          const isSSO = searchParams.get('isSSO') === 'true';
          const ssoParams = new URLSearchParams();
          if (isSSO) ssoParams.set('isSSO', 'true');
          navigate(`/sso/login${ssoParams.toString() ? '?' + ssoParams.toString() : ''}`, { replace: true });
        }, 2000);
      }
    }
  }, [navigate]);

  // Get SSO key and email from URL parameters if available
  useEffect(() => {
    const ssoKeyParam = searchParams.get('ssoKey') || searchParams.get('key');
    const emailParam = searchParams.get('gmail') || searchParams.get('email');
    if (ssoKeyParam && emailParam) {
      form.setFieldsValue({ ssoKey: ssoKeyParam, gmail: emailParam });
      handleValidateKey(ssoKeyParam, emailParam);
    } else if (ssoKeyParam || emailParam) {
      if (ssoKeyParam) form.setFieldsValue({ ssoKey: ssoKeyParam });
      if (emailParam) form.setFieldsValue({ gmail: emailParam });
    }
  }, [searchParams]);

  const handleValidateKey = async (ssoKey: string = form.getFieldValue('ssoKey'), email: string = form.getFieldValue('gmail')) => {
    const isValid = await validateSSOKey(ssoKey, email);
    console.log('SSO Key Validation:', isValid);
    if (isValid) {
      setCurrentStep(1);
      // Auto submit login after validation
      setTimeout(async () => {
        await handleSSOLogin();
      }, 1000);
    } else {
      setCurrentStep(0);
      // If this is a popup, send error message to parent window
      if (isPopup && window.opener && error) {
        window.opener.postMessage({
          type: 'SSO_LOGIN_ERROR',
          error: error,
        });
      }
    }
  };

  const handleSSOLogin = async () => {
    const ssoKey = form.getFieldValue('ssoKey');
    const gmail = form.getFieldValue('gmail');
    
    setLoading(true);
    setCurrentStep(2);
    
    try {
      const loginData = {
        ssoKey,
        gmail,
        deviceIP: undefined, // Will default to client IP
        userAgent: navigator.userAgent,
        location: isSSO ? 'SSO Web Login (Direct)' : 'SSO Web Login',
      };

      console.log('SSO Login Data:', { ...loginData, isSSO, redirectUrl });
      const result = await performSSOLogin(loginData, redirectUrl ?? undefined);
      console.log('SSO Login Result:', result);
      if (result.success && result.userData && result.token) {
        await login(result.token, result.userData);
        setCurrentStep(3);

        // If this is a popup, send success message to parent window
        if (isPopup && window.opener) {
          window.opener.postMessage({
            type: 'SSO_LOGIN_SUCCESS',
            user: result.userData,
            token: result.token,
          });

          // Close popup after a short delay
          setTimeout(() => {
            window.close();
          }, 1500);
        } else {
          // Direct to login success page with 2-second delay
          setTimeout(() => {
            if (result.loginSuccessUrl) {
              navigate(result.loginSuccessUrl);
            }
          }, 2000);
        }
      } else {
        setCurrentStep(1);
        // If this is a popup, send error message to parent window
        if (isPopup && window.opener) {
          window.opener.postMessage({
            type: 'SSO_LOGIN_ERROR',
            error: result.error || 'SSO login failed',
          });
        }
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'SSO login failed';
      setCurrentStep(1);

      // If this is a popup, send error message to parent window
      if (isPopup && window.opener) {
        window.opener.postMessage({
          type: 'SSO_LOGIN_ERROR',
          error: errorMessage,
        }, redirectUrl || window.location.origin);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyChange = () => {
    resetState();
    setCurrentStep(0);
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
          <Title level={2} style={{ margin: 0, color: '#333' }}>
            {isPopup ? 'SSO Login - Popup' : isSSO ? 'SSO Login - Direct' : 'SSO Login'}
          </Title>
          <Text type="secondary">
            {isPopup ? 'Authenticate to access Calendar Todo App' : 
             isSSO ? 'Direct SSO Authentication (Token bypass enabled)' : 
             'Single Sign-On Authentication'}
          </Text>
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

        {/* URL Fix Notification */}
        {urlFixed && (
          <Alert
            message="SSO URL Error Fixed"
            description="The malformed SSO URL was detected and corrected. You will be redirected to the proper SSO login page shortly."
            type="warning"
            style={{ marginBottom: '24px' }}
            showIcon
            closable
            onClose={() => setUrlFixed(false)}
          />
        )}

        {/* SSO Direct Mode Notification */}
        {isSSO && (
          <Alert
            message="Direct SSO Mode"
            description="You are in direct SSO mode. Token validation is bypassed for immediate authentication."
            type="success"
            style={{ marginBottom: '24px' }}
            showIcon
          />
        )}

        {/* Step 0: SSO Key Input */}
        {currentStep === 0 && !validating && !loading && !urlFixed && (
          <Form
            form={form}
            layout="vertical"
            onFinish={() => handleValidateKey()}
          >
            <Form.Item
              name="gmail"
              label="Email Address"
              rules={[
                { required: true, message: 'Please enter your email address' },
                { type: 'email', message: 'Please enter a valid email address' },
                { 
                  pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/, 
                  message: 'Must be a valid email address (ending with .com)' 
                }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Enter your email address"
                size="large"
                onChange={handleKeyChange}
                disabled={validating || loading}
              />
            </Form.Item>

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

            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              {isPopup ? (
                <Button onClick={() => window.close()}>
                  Cancel
                </Button>
              ) : (
                <Button onClick={() => navigate('/login')}>
                  <UserOutlined /> Regular Login
                </Button>
              )}
              
              <Button 
                type="primary" 
                htmlType="submit"
                loading={validating || loading}
                size="large"
              >
                <SafetyCertificateOutlined /> Validate Email & Login
              </Button>
            </Space>
          </Form>
        )}

        {/* Step 0: Loading State */}
        {currentStep === 0 && (validating || loading) && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>
              <Text>{loginState.message}</Text>
            </div>
            {loginState.progress > 0 && (
              <div style={{ 
                marginTop: '16px', 
                width: '100%', 
                height: '6px', 
                background: '#f0f0f0', 
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${loginState.progress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #1890ff, #52c41a)',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            )}
          </div>
        )}

        {/* Step 2: Login in Progress */}
        {currentStep === 2 && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>
              <Text>{loginState.message}</Text>
            </div>
            <div style={{ 
              marginTop: '16px', 
              width: '100%', 
              height: '6px', 
              background: '#f0f0f0', 
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${loginState.progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #1890ff, #52c41a)',
                transition: 'width 0.3s ease'
              }} />
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
        {currentStep === 0 && (
          <>
            <Divider />
            <div style={{ textAlign: 'center' }}>
              <Paragraph type="secondary" style={{ fontSize: '12px' }}>
                <ExclamationCircleOutlined /> Need help? Contact your system administrator for SSO key and email verification assistance.
              </Paragraph>
              <Paragraph type="secondary" style={{ fontSize: '12px' }}>
                Don't have SSO credentials? <Button type="link" onClick={() => navigate('/login')} style={{ padding: 0, height: 'auto', fontSize: '12px' }}>Use regular login instead</Button>
              </Paragraph>
              <Paragraph type="secondary" style={{ fontSize: '11px', color: '#999' }}>
                Note: Your email address must match the one associated with your SSO key.
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