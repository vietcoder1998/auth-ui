import React, { useState } from 'react';
import { Modal, Input, Button, message, Typography, Space, Card, QRCode } from 'antd';
import { CopyOutlined, QrcodeOutlined, LinkOutlined } from '@ant-design/icons';

interface SSOLoginLinkModalProps {
  visible: boolean;
  onCancel: () => void;
  ssoKey: string;
  userEmail: string;
  appUrl: string;
}

const { Text, Paragraph } = Typography;

const SSOLoginLinkModal: React.FC<SSOLoginLinkModalProps> = ({
  visible,
  onCancel,
  ssoKey,
  userEmail,
  appUrl
}) => {
  const [showQR, setShowQR] = useState(false);

  const generateSSOLoginUrl = () => {
    const baseUrl = window.location.origin;
    const loginUrl = `${baseUrl}/sso-login?ssoKey=${encodeURIComponent(ssoKey)}`;
    return loginUrl;
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success(`${label} copied to clipboard`);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      message.error('Failed to copy to clipboard');
    }
  };

  const ssoLoginUrl = generateSSOLoginUrl();

  return (
    <Modal
      title="SSO Login Link Generator"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          Close
        </Button>
      ]}
      width={600}
    >
      <div>
        <Card size="small" title="SSO Information" style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '14px' }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>User:</strong> {userEmail}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Application:</strong> {appUrl}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>SSO Key:</strong> 
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <Input
                  value={ssoKey}
                  readOnly
                  size="small"
                  style={{ fontFamily: 'monospace', fontSize: '11px' }}
                />
                <Button
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => copyToClipboard(ssoKey, 'SSO Key')}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card size="small" title="Generated Login Link" style={{ marginBottom: '16px' }}>
          <div style={{ marginBottom: '12px' }}>
            <Text strong>Direct Login URL:</Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <Input
                value={ssoLoginUrl}
                readOnly
                size="small"
                style={{ fontSize: '11px' }}
              />
              <Button
                size="small"
                icon={<CopyOutlined />}
                onClick={() => copyToClipboard(ssoLoginUrl, 'Login URL')}
              />
            </div>
          </div>

          <Space style={{ width: '100%', justifyContent: 'center' }}>
            <Button 
              icon={<LinkOutlined />}
              onClick={() => window.open(ssoLoginUrl, '_blank')}
            >
              Test Login Link
            </Button>
            <Button 
              icon={<QrcodeOutlined />}
              onClick={() => setShowQR(!showQR)}
            >
              {showQR ? 'Hide QR Code' : 'Show QR Code'}
            </Button>
          </Space>

          {showQR && (
            <div style={{ textAlign: 'center', marginTop: '16px', padding: '16px', backgroundColor: '#fafafa', borderRadius: '8px' }}>
              <QRCode value={ssoLoginUrl} size={200} />
              <Paragraph style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                Scan this QR code to quickly access the SSO login page
              </Paragraph>
            </div>
          )}
        </Card>

        <Card size="small" title="Usage Instructions">
          <Paragraph style={{ fontSize: '14px', marginBottom: '8px' }}>
            <strong>How to use this SSO login link:</strong>
          </Paragraph>
          <ol style={{ fontSize: '13px', paddingLeft: '20px' }}>
            <li>Share the generated URL with the user</li>
            <li>User clicks the link or scans the QR code</li>
            <li>The SSO key will be pre-filled in the login form</li>
            <li>User can proceed directly to validate and login</li>
            <li>Upon successful authentication, user will be redirected to the dashboard</li>
          </ol>
          
          <Paragraph style={{ fontSize: '12px', color: '#666', marginTop: '12px' }}>
            <strong>Note:</strong> This link contains the SSO key and should be shared securely. 
            The link will only work if the SSO entry is active and not expired.
          </Paragraph>
        </Card>
      </div>
    </Modal>
  );
};

export default SSOLoginLinkModal;