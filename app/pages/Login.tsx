import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Alert, Spin, Typography, Space, Divider } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { login as loginApi } from '../apis/auth.api.ts';
import { useAuth } from '../hooks/useAuth.tsx';
import AuthStatus from '../layouts/AuthStatus.tsx';

const { Title, Text } = Typography;

const Login: React.FC = () => {
    const [form] = Form.useForm();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
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

    const handleLogin = async (values: { email: string; password: string }) => {
        setLoading(true);
        setError(null);
        try {
            const res = await loginApi({ email: values.email, password: values.password });
            
            // Use auth context to handle login (saves to cookies and updates state)
            await login(res.data.accessToken, res.data.user);
            
            // Redirect to url param if exists
            const redirect = searchParams.get('redirect');
            navigate(redirect || '/admin');
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    // Show loading while checking auth state
    if (authLoading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh',
                background: '#f0f2f5'
            }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f0f2f5',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
        }}>
            <Card 
                style={{ 
                    width: '100%',
                    maxWidth: 400,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                variant="borderless"
            >
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <LoginOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
                    <Title level={2} style={{ margin: 0 }}>Welcome Back</Title>
                    <Text type="secondary">Please sign in to your account</Text>
                </div>
                
                {/* Show current auth status */}
                <div style={{ marginBottom: 24 }}>
                    <AuthStatus />
                </div>

                {error && (
                    <Alert
                        message={error}
                        type="error"
                        showIcon
                        style={{ marginBottom: 24 }}
                    />
                )}

                <Form
                    form={form}
                    name="login"
                    onFinish={handleLogin}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Please input your email!' },
                            { type: 'email', message: 'Please enter a valid email!' }
                        ]}
                    >
                        <Input 
                            prefix={<UserOutlined />} 
                            placeholder="Enter your email"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                        <Input.Password 
                            prefix={<LockOutlined />} 
                            placeholder="Enter your password"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            loading={loading}
                            block
                            style={{ height: 44 }}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </Form.Item>
                </Form>

                <Divider />

                <div style={{ textAlign: 'center' }}>
                    <Space split={<span style={{ color: '#d9d9d9' }}>|</span>}>
                        <Link to="/register" style={{ color: '#1890ff' }}>
                            Create Account
                        </Link>
                        <Button 
                            type="link" 
                            style={{ color: '#1890ff', padding: 0 }}
                            onClick={() => {
                                const redirect = searchParams.get('redirect');
                                const ssoUrl = `/sso/login?isSSO=true${redirect ? `&redirect=${encodeURIComponent(redirect)}` : ''}`;
                                navigate(ssoUrl);
                            }}
                        >
                            SSO Login
                        </Button>
                        <Link to="/forgot-password" style={{ color: '#1890ff' }}>
                            Forgot Password?
                        </Link>
                    </Space>
                </div>
            </Card>
        </div>
    );
};

export default Login;
