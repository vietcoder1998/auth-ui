import React, { useEffect, useState } from 'react';
import { Card, Button, Modal, Form, Input, Switch, Space, Tag, message, Menu, Layout, Table, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { adminApi } from '../../apis/admin.api.ts';

const { Sider, Content } = Layout;
const { Title } = Typography;

interface SocketConfig {
  id: string;
  name: string;
  host: string;
  port: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface SocketEvent {
  id: string;
  socketConfigId: string;
  type: string;
  event: string;
  createdAt?: string;
}

const AdminSocketPage: React.FC = () => {
  const [sockets, setSockets] = useState<SocketConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SocketConfig | null>(null);
  const [form] = Form.useForm();
  const [events, setEvents] = useState<SocketEvent[]>([]);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [selectedSocketId, setSelectedSocketId] = useState<string | null>(null);
  const [selectedSocket, setSelectedSocket] = useState<SocketConfig | null>(null);
  const [testEventModalOpen, setTestEventModalOpen] = useState(false);
  const [testEventName, setTestEventName] = useState('');
  const [testEventPayload, setTestEventPayload] = useState('{}');
  const [testEventResult, setTestEventResult] = useState<string | null>(null);
  const [testEventLoading, setTestEventLoading] = useState(false);

  const fetchSockets = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSockets();
      setSockets(res.data.data);
      if (res.data.data.length && !selectedSocketId) {
        setSelectedSocketId(res.data.data[0].id);
      }
    } catch (e) {
      message.error('Failed to load sockets');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async (socketConfigId: string) => {
    try {
      const res = await adminApi.getSocketEvents(socketConfigId);
      setEvents(res.data.data);
    } catch (e) {
      message.error('Failed to load events');
    }
  };

  useEffect(() => {
    fetchSockets();
  }, []);

  useEffect(() => {
    if (selectedSocketId) {
      const found = sockets.find(s => s.id === selectedSocketId) || null;
      setSelectedSocket(found);
      if (found) fetchEvents(found.id);
    }
  }, [selectedSocketId, sockets]);

  const handleAdd = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (record: SocketConfig) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await adminApi.deleteSocket(id);
    message.success('Socket deleted');
    setSelectedSocketId(null);
    fetchSockets();
  };

  const handleModalOk = async () => {
    const values = await form.validateFields();
    if (editing) {
      await adminApi.updateSocket(editing.id, values);
      message.success('Socket updated');
    } else {
      await adminApi.createSocket(values);
      message.success('Socket created');
    }
    setModalOpen(false);
    fetchSockets();
  };

  const handleAddEvent = async () => {
    if (!selectedSocket) return;
    Modal.confirm({
      title: 'Add Event',
      content: (
        <Form layout="vertical" id="eventForm">
          <Form.Item name="type" label="Type" rules={[{ required: true }]}> <Input /> </Form.Item>
          <Form.Item name="event" label="Event" rules={[{ required: true }]}> <Input /> </Form.Item>
        </Form>
      ),
      onOk: async () => {
        const formEl = document.getElementById('eventForm') as any;
        const type = (formEl.querySelector('[name="type"]') as HTMLInputElement)?.value;
        const event = (formEl.querySelector('[name="event"]') as HTMLInputElement)?.value;
        await adminApi.createSocketEvent(selectedSocket.id, { type, event });
        message.success('Event added');
        fetchEvents(selectedSocket.id);
      },
    });
  };

  const handleDeleteEvent = async (id: string) => {
    await adminApi.deleteSocketEvent(id);
    message.success('Event deleted');
    if (selectedSocket) fetchEvents(selectedSocket.id);
  };

  // Ping socket action
  const handlePingSocket = async (socket: SocketConfig) => {
    try {
      // You should implement this endpoint in your backend
      const res = await adminApi.pingSocket(socket.id);
      message.success(res.data?.message || 'Ping successful');
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Ping failed');
    }
  };

  // Test event modal handler
  const handleOpenTestEventModal = () => {
    setTestEventName('');
    setTestEventPayload('{}');
    setTestEventResult(null);
    setTestEventModalOpen(true);
  };
  const handleSendTestEvent = async () => {
    if (!selectedSocket) return;
    setTestEventLoading(true);
    setTestEventResult(null);
    try {
      const payloadObj = testEventPayload ? JSON.parse(testEventPayload) : {};
      const res = await adminApi.testSocketEvent(selectedSocket.id, { event: testEventName, payload: payloadObj });
      setTestEventResult(res.data?.message || 'Event sent');
    } catch (e: any) {
      setTestEventResult(e?.response?.data?.message || 'Test event failed');
    } finally {
      setTestEventLoading(false);
    }
  };

  const handleTestEventFromRow = (event: SocketEvent) => {
    setTestEventName(event.event);
    setTestEventPayload('{}');
    setTestEventResult(null);
    setTestEventModalOpen(true);
  };

  // Menu for sockets
  const menuItems = sockets.map((s) => ({
    key: s.id,
    label: (
      <span>
        {s.name} {s.isActive ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>}
      </span>
    ),
  }));

  const eventColumns = [
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'Event', dataIndex: 'event', key: 'event' },
    { title: 'Created', dataIndex: 'createdAt', key: 'createdAt', render: (d: string) => d ? new Date(d).toLocaleString() : '' },
    { title: 'Actions', key: 'actions', render: (_: any, record: SocketEvent) => (
      <Space>
        <Button onClick={() => handleTestEventFromRow(record)}>Test Event</Button>
        <Button icon={<DeleteOutlined />} danger onClick={() => handleDeleteEvent(record.id)} />
      </Space>
    ) },
  ];

  return (
    <Layout style={{ background: '#fff', minHeight: 500 }}>
      <Sider width={260} style={{ background: '#f9f9f9', borderRight: '1px solid #eee', padding: '16px 0' }}>
        <div style={{ padding: '0 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>Sockets</Title>
          <Button icon={<PlusOutlined />} size="small" onClick={handleAdd}>Add</Button>
        </div>
        <Menu
          mode="inline"
          selectedKeys={selectedSocketId ? [selectedSocketId] : []}
          items={menuItems}
          onClick={({ key }) => setSelectedSocketId(key as string)}
        />
      </Sider>
      <Content style={{ padding: 24 }}>
        {selectedSocket ? (
          <Card
            title={<span>{selectedSocket.name} <Tag color={selectedSocket.isActive ? 'green' : 'red'}>{selectedSocket.isActive ? 'Active' : 'Inactive'}</Tag></span>}
            extra={
              <Space>
                <Button icon={<ThunderboltOutlined />} onClick={() => handlePingSocket(selectedSocket)}>Ping Socket</Button>
                <Button onClick={handleOpenTestEventModal}>Test Event</Button>
                <Button icon={<EditOutlined />} onClick={() => handleEdit(selectedSocket)}>Edit</Button>
                <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(selectedSocket.id)}>Delete</Button>
              </Space>
            }
          >
            <div style={{ marginBottom: 16 }}>
              <b>Host:</b> {selectedSocket.host} <br />
              <b>Port:</b> {selectedSocket.port} <br />
              <b>Created:</b> {selectedSocket.createdAt ? new Date(selectedSocket.createdAt).toLocaleString() : ''}
            </div>
            <Title level={5}>Events</Title>
            <Button icon={<PlusOutlined />} size="small" onClick={handleAddEvent} style={{ marginBottom: 12 }}>Add Event</Button>
            <Table rowKey="id" columns={eventColumns} dataSource={events} pagination={false} size="small" />
          </Card>
        ) : (
          <div style={{ color: '#888', padding: 32 }}>Select a socket to view details.</div>
        )}
      </Content>
      <Modal
        open={modalOpen}
        title={editing ? 'Edit Socket' : 'Add Socket'}
        onCancel={() => setModalOpen(false)}
        onOk={handleModalOk}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" initialValues={{ isActive: true }}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}> <Input /> </Form.Item>
          <Form.Item name="host" label="Host" rules={[{ required: true }]}> <Input /> </Form.Item>
          <Form.Item name="port" label="Port" rules={[{ required: true }]}> <Input type="number" /> </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked"> <Switch /> </Form.Item>
        </Form>
        {/* Show socket info if editing */}
        {editing && (
          <div style={{ marginTop: 24, background: '#f6f6f6', padding: 12, borderRadius: 6 }}>
            <b>Socket Info</b><br />
            <b>ID:</b> {editing.id}<br />
            <b>Created:</b> {editing.createdAt ? new Date(editing.createdAt).toLocaleString() : ''}<br />
            <b>Updated:</b> {editing.updatedAt ? new Date(editing.updatedAt).toLocaleString() : ''}
          </div>
        )}
      </Modal>
      <Modal
        open={testEventModalOpen}
        title={`Test Event for ${selectedSocket?.name || ''}`}
        onCancel={() => setTestEventModalOpen(false)}
        onOk={handleSendTestEvent}
        okText={testEventLoading ? 'Sending...' : 'Send Event'}
        confirmLoading={testEventLoading}
      >
        <Form layout="vertical">
          <Form.Item label="Event Name" required>
            <Input value={testEventName} onChange={e => setTestEventName(e.target.value)} placeholder="event name" />
          </Form.Item>
          <Form.Item label="Payload (JSON)">
            <Input.TextArea value={testEventPayload} onChange={e => setTestEventPayload(e.target.value)} rows={4} placeholder="{ }" />
          </Form.Item>
        </Form>
        {testEventResult && (
          <div style={{ marginTop: 16, background: '#f6f6f6', padding: 12, borderRadius: 6 }}>
            <b>Result:</b><br />
            <span>{testEventResult}</span>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default AdminSocketPage;
