import React, { useEffect, useState } from 'react';
import { Table, Input, Button } from 'antd';
import { adminApi } from '~/apis/admin/index.ts';

const AIMemoryPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [memories, setMemories] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  const fetchMemories = async (q?: string) => {
    setLoading(true);
    try {
      // Replace with your actual API call for memory search
      const result = await adminApi.getAgentMemories({ q });
      setMemories(result?.data || []);
    } catch (err) {
      setMemories([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const handleSearch = () => {
    fetchMemories(search);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Agent', dataIndex: 'agentId', key: 'agentId' },
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'Content', dataIndex: 'content', key: 'content' },
    { title: 'Tokens', dataIndex: 'tokens', key: 'tokens' },
    { title: 'Importance', dataIndex: 'importance', key: 'importance' },
    { title: 'Created At', dataIndex: 'createdAt', key: 'createdAt' },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>AI Memory</h2>
      <Input.Search
        placeholder="Search memory..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onSearch={handleSearch}
        enterButton
        style={{ maxWidth: 400, marginBottom: 16 }}
      />
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={memories}
        pagination={{ pageSize: 20 }}
      />
    </div>
  );
};

export default AIMemoryPage;
