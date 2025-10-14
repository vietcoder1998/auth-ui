import React, { useEffect, useState } from 'react';
import { adminApi } from '../apis/admin.api.ts';
import { Table, Button, Spin } from 'antd';

interface Token {
  token: string;
  user: string;
}

export default function AdminTokenPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await adminApi.getTokens();
      setTokens(res.data as Token[]);
    } catch {
      setTokens([]);
    }
    setLoading(false);
  };

  const columns = [
    { title: 'Token', dataIndex: 'token', key: 'token' },
    { title: 'User', dataIndex: 'user', key: 'user' },
    { title: 'Actions', key: 'actions', render: (_: unknown, t: Token) => (
      <Button danger onClick={() => adminApi.revokeToken(t.token).then(fetchTokens)}>Revoke</Button>
    ) },
  ];

  return (
    <div>
      <h2>Token Table</h2>
      <Button type="primary" onClick={() => alert('Show create token modal')}>Create Token</Button>
      <Spin spinning={loading}>
        <Table
          dataSource={tokens}
          columns={columns}
          rowKey="token"
          pagination={{ pageSize: 10 }}
        />
      </Spin>
    </div>
  );
}
