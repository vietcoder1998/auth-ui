import { useEffect, useState } from 'react';
import { adminApi } from '../../apis/admin.api.ts';
import { Button, Card, List, message, Typography, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, TagOutlined } from '@ant-design/icons';
import CommonSearch from '../../components/CommonSearch.tsx';
import BillingDetailModal from '../../modals/BillingDetailModal.tsx';

const { Title } = Typography;
// TODO: Create AddBillingModal for add/edit

export default function AdminBillingPage() {
  const [billings, setBillings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBilling, setEditingBilling] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState<any | null>(null);

  useEffect(() => {
    fetchBillings();
  }, []);

  useEffect(() => {
    if (search.length === 0) {
      fetchBillings();
      return;
    }
    setLoading(true);
    adminApi
      .getBillings(search)
      .then((response: any) => {
        setBillings(response.data?.data || []);
        setLoading(false);
      })
      .catch(() => {
        setBillings([]);
        setLoading(false);
      });
  }, [search]);

  const fetchBillings = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getBillings();
      setBillings(response.data?.data || []);
    } catch (error) {
      message.error('Failed to fetch billings');
    } finally {
      setLoading(false);
    }
  };

  const handleModalOk = async (values: any) => {
    try {
      if (editingBilling) {
        await adminApi.updateBilling(editingBilling.id, values);
        message.success('Billing updated');
      } else {
        await adminApi.createBilling(values);
        message.success('Billing created');
      }
      setModalVisible(false);
      setEditingBilling(null);
      fetchBillings();
    } catch (error) {
      message.error('Failed to save billing');
    }
  };

  const handleDeleteBilling = async (billingId: string) => {
    try {
      await adminApi.deleteBilling(billingId);
      message.success('Billing deleted');
      fetchBillings();
    } catch (error) {
      message.error('Failed to delete billing');
    }
  };

  const showEditModal = (billing: any) => {
    setEditingBilling(billing);
    setModalVisible(true);
  };

  // Calculate summary
  const totalAmount = billings.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
  const paidCount = billings.filter((b) => b.status === 'paid').length;
  const pendingCount = billings.filter((b) => b.status === 'pending').length;
  const failedCount = billings.filter((b) => b.status === 'failed').length;

  return (
    <div>
      <Title level={2}>Billing Management</Title>
      <CommonSearch
        searchPlaceholder="Search billing..."
        searchValue={search}
        onSearch={setSearch}
        loading={loading}
        showRefresh={true}
        onRefresh={fetchBillings}
        style={{ marginBottom: 12, border: 'none', boxShadow: 'none', padding: 0 }}
      />
      <Button
        type="primary"
        onClick={() => {
          setEditingBilling(null);
          setModalVisible(true);
        }}
        style={{ marginBottom: 16 }}
      >
        Add Billing
      </Button>
      <Card style={{ marginTop: 0 }}>
        <List
          loading={loading}
          dataSource={billings}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => showEditModal(item)}
                  title="Edit"
                  key="edit"
                />,
                <Button
                  type="text"
                  icon={<TagOutlined />}
                  title="Label"
                  key="label"
                  onClick={() => {
                    /* TODO: Label action */
                  }}
                />,
                <Popconfirm
                  title="Delete this billing?"
                  onConfirm={() => handleDeleteBilling(item.id)}
                  key="delete"
                >
                  <Button type="text" icon={<DeleteOutlined />} danger title="Delete" />
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                title={
                  <span>
                    Billing ID:{' '}
                    <Button
                      type="link"
                      style={{ padding: 0, fontWeight: 500 }}
                      onClick={() => {
                        setSelectedBilling(item);
                        setDetailModalVisible(true);
                      }}
                    >
                      {item.id}
                    </Button>
                    {item.keyId && (
                      <span style={{ marginLeft: 12, color: '#888', fontSize: 13 }}>
                        Key: <b>{item.keyName || item.keyId}</b>
                      </span>
                    )}
                    {/* Status color */}
                    <span
                      style={{
                        marginLeft: 16,
                        fontWeight: 500,
                        color:
                          item.status === 'paid'
                            ? '#52c41a'
                            : item.status === 'pending'
                              ? '#faad14'
                              : item.status === 'failed'
                                ? '#d4380d'
                                : '#888',
                        background:
                          item.status === 'paid'
                            ? '#f6ffed'
                            : item.status === 'pending'
                              ? '#fffbe6'
                              : item.status === 'failed'
                                ? '#fff1f0'
                                : undefined,
                        borderRadius: 4,
                        padding: '2px 8px',
                      }}
                    >
                      {item.status}
                    </span>
                    {/* Amount color */}
                    {item.amount !== undefined && (
                      <span
                        style={{
                          marginLeft: 16,
                          fontWeight: 700,
                          color: item.amount > 0 ? '#1890ff' : '#888',
                        }}
                      >
                        {item.amount}
                      </span>
                    )}
                  </span>
                }
                description={
                  <div>
                    <pre style={{ whiteSpace: 'pre-wrap', marginBottom: 4 }}>{item.details}</pre>
                    {item.updatedAt && (
                      <span style={{ fontSize: 12, color: '#aaa' }}>
                        Updated: {new Date(item.updatedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>
      <div
        style={{
          marginTop: 24,
          padding: 16,
          background: '#fafafa',
          borderRadius: 8,
          border: '1px solid #eee',
        }}
      >
        <b>Summary:</b> Total Billings: {billings.length}, Paid: {paidCount}, Pending:{' '}
        {pendingCount}, Failed: {failedCount}, Total Amount: <b>{totalAmount}</b>
      </div>
      <BillingDetailModal
        visible={detailModalVisible}
        billing={selectedBilling}
        onCancel={() => setDetailModalVisible(false)}
      />
      {/* TODO: Add AddBillingModal component for add/edit */}
    </div>
  );
}
