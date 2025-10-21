import React from 'react';
import { Layout } from 'antd';
import { GithubOutlined } from '@ant-design/icons';

const { Footer } = Layout;

const PublicFooter: React.FC = () => (
  <Footer
    style={{
      padding: '6px 0',
      textAlign: 'center',
      background: '#fff',
      fontSize: 11,
      color: '#aaa',
    }}
  >
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
      <GithubOutlined style={{ fontSize: 14 }} />
      <a
        href="https://github.com/vietcoder1998/auth-api"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: '#1677ff', textDecoration: 'underline', fontSize: 11 }}
      >
        GitHub
      </a>
      &nbsp;|&nbsp; Auth System &copy; {new Date().getFullYear()}
    </span>
  </Footer>
);

export default PublicFooter;
