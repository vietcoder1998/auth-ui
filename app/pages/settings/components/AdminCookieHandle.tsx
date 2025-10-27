import React, { useState } from 'react';
import { Card, Button, Input, Typography, message, Table, Popconfirm, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import Cookies from 'js-cookie';

const { Title, Paragraph } = Typography;

export default function AdminCookieHandle() {
  const [cookieKey, setCookieKey] = useState('lastMenuKey');
  const [cookieValue, setCookieValue] = useState(Cookies.get('lastMenuKey') || '');
  const [newValue, setNewValue] = useState('');
  const [search, setSearch] = useState('');
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const handleSetCookie = () => {
    Cookies.set(cookieKey, newValue, { expires: 7 });
    setCookieValue(newValue);
    message.success(`Cookie '${cookieKey}' set to '${newValue}'`);
  };

  const handleReadCookie = () => {
    const value = Cookies.get(cookieKey) || '';
    setCookieValue(value);
    message.info(`Cookie '${cookieKey}' value: '${value}'`);
  };

  const handleDeleteCookie = () => {
    Cookies.remove(cookieKey);
    setCookieValue('');
    message.success(`Cookie '${cookieKey}' deleted`);
  };

  // Get all cookies as key-value pairs, filtered by search
  const allCookies = React.useMemo(() => {
    const cookies: { key: string; value: string }[] = [];
    document.cookie.split(';').forEach((cookie) => {
      const [key, ...rest] = cookie.split('=');
      if (key) {
        const k = key.trim();
        const v = decodeURIComponent(rest.join('='));
        if (
          !search ||
          k.toLowerCase().includes(search.toLowerCase()) ||
          v.toLowerCase().includes(search.toLowerCase())
        ) {
          cookies.push({ key: k, value: v });
        }
      }
    });
    return cookies;
  }, [cookieValue, newValue, cookieKey, search]);

  return (
    <Card style={{}}>
      <Title level={3}>Cookie Handle Demo</Title>
      <Paragraph>
        This page lets you view, set, edit, search, and delete cookies. Try changing the value below
        and click Set.
      </Paragraph>
      <Input
        placeholder="Search cookies by name or value"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 12, width: '100%' }}
        allowClear
      />
      <Input
        placeholder="Cookie Key"
        value={cookieKey}
        onChange={(e) => setCookieKey(e.target.value)}
        style={{ marginBottom: 8 }}
      />
      <Input
        placeholder="New Cookie Value"
        value={newValue}
        onChange={(e) => setNewValue(e.target.value)}
        style={{ marginBottom: 8 }}
      />
      <div style={{ marginBottom: 8 }}>
        <Button type="primary" onClick={handleSetCookie} style={{ marginRight: 8 }}>
          Set Cookie
        </Button>
        <Button onClick={handleReadCookie} style={{ marginRight: 8 }}>
          Read Cookie
        </Button>
        <Button danger onClick={handleDeleteCookie}>
          Delete Cookie
        </Button>
      </div>
      <Paragraph>
        <b>Current Value:</b> <span style={{ color: '#1890ff' }}>{cookieValue}</span>
      </Paragraph>
      <Table
        dataSource={allCookies}
        columns={[
          {
            title: 'Cookie Name',
            dataIndex: 'key',
            key: 'key',
            width: 200,
            render: (text: string) => <b>{text}</b>,
          },
          {
            title: 'Value',
            dataIndex: 'value',
            key: 'value',
            render: (text: string, record: any) =>
              editingRow === record.key ? (
                <Input
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  onPressEnter={() => {
                    Cookies.set(record.key, editingValue, { expires: 7 });
                    setEditingRow(null);
                    setCookieValue(editingValue);
                    message.success(`Cookie '${record.key}' updated`);
                  }}
                  onBlur={() => setEditingRow(null)}
                  size="small"
                  style={{ minWidth: 120 }}
                  autoFocus
                />
              ) : (
                <span style={{ wordBreak: 'break-all' }}>{text}</span>
              ),
          },
          {
            title: 'Actions',
            key: 'actions',
            width: 120,
            render: (_: any, record: any) => (
              <>
                {editingRow === record.key ? (
                  <Popconfirm
                    title={
                      <>
                        <div>
                          Edit cookie value for <b>{record.key}</b>?
                        </div>
                        <Input
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          size="small"
                          style={{ marginTop: 8 }}
                        />
                      </>
                    }
                    onConfirm={() => {
                      Cookies.set(record.key, editingValue, { expires: 7 });
                      setEditingRow(null);
                      setCookieValue(editingValue);
                      message.success(`Cookie '${record.key}' updated`);
                    }}
                    onCancel={() => setEditingRow(null)}
                    okText={
                      <span>
                        <SaveOutlined /> Save
                      </span>
                    }
                    cancelText="Cancel"
                  >
                    <Button
                      icon={<SaveOutlined />}
                      size="small"
                      type="primary"
                      style={{ marginRight: 8 }}
                    />
                  </Popconfirm>
                ) : (
                  <Tooltip title="Edit">
                    <Button
                      icon={<EditOutlined />}
                      size="small"
                      onClick={() => {
                        setEditingRow(record.key);
                        setEditingValue(record.value);
                      }}
                      style={{ marginRight: 8 }}
                    />
                  </Tooltip>
                )}
                <Popconfirm
                  title={`Delete cookie '${record.key}'?`}
                  onConfirm={() => {
                    Cookies.remove(record.key);
                    setCookieValue('');
                    message.success(`Cookie '${record.key}' deleted`);
                  }}
                  okText="Yes"
                  cancelText="No"
                >
                  <Tooltip title="Remove">
                    <Button icon={<DeleteOutlined />} size="small" danger />
                  </Tooltip>
                </Popconfirm>
              </>
            ),
          },
        ]}
        pagination={false}
        locale={{ emptyText: 'No cookies found.' }}
        size="small"
        style={{ marginTop: 24 }}
        rowKey="key"
      />
    </Card>
  );
}
