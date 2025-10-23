import { Modal, Descriptions } from 'antd';

interface BillingDetailModalProps {
  visible: boolean;
  billing: any | null;
  onCancel: () => void;
}

export default function BillingDetailModal({
  visible,
  billing,
  onCancel,
}: BillingDetailModalProps) {
  return (
    <Modal
      open={visible}
      title={`Billing Details${billing ? ` - ${billing.id}` : ''}`}
      onCancel={onCancel}
      footer={null}
      destroyOnHidden
    >
      {billing ? (
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="ID">{billing.id}</Descriptions.Item>
          <Descriptions.Item label="Key">
            {billing.keyName || billing.keyId || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Amount">
            <span
              style={{
                fontWeight: 700,
                color: billing.amount > 0 ? '#1890ff' : '#888',
              }}
            >
              {billing.amount}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Currency">{billing.currency}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <span
              style={{
                fontWeight: 500,
                color:
                  billing.status === 'paid'
                    ? '#52c41a'
                    : billing.status === 'pending'
                      ? '#faad14'
                      : billing.status === 'failed'
                        ? '#d4380d'
                        : '#888',
                background:
                  billing.status === 'paid'
                    ? '#f6ffed'
                    : billing.status === 'pending'
                      ? '#fffbe6'
                      : billing.status === 'failed'
                        ? '#fff1f0'
                        : undefined,
                borderRadius: 4,
                padding: '2px 8px',
              }}
            >
              {billing.status}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Description">{billing.description}</Descriptions.Item>
          <Descriptions.Item label="Details">
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{billing.details}</pre>
          </Descriptions.Item>
          <Descriptions.Item label="Updated">
            {billing.updatedAt ? new Date(billing.updatedAt).toLocaleString() : 'N/A'}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <div style={{ color: '#888', textAlign: 'center', padding: 24 }}>No billing selected.</div>
      )}
    </Modal>
  );
}
