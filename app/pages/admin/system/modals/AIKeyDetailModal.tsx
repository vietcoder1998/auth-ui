import { Modal, Descriptions, Button, notification } from 'antd';

interface AIKeyDetailModalProps {
  visible: boolean;
  aiKey: any | null;
  onCancel: () => void;
}

export default function AIKeyDetailModal({ visible, aiKey, onCancel }: AIKeyDetailModalProps) {
  const handleTestKey = async () => {
    if (!aiKey || !aiKey.key) return;
    try {
      const res = await fetch(`/api/test-ai-key?key=${encodeURIComponent(aiKey.key)}`);
      const data = await res.json();
      if (data.status === 'ok') {
        notification.success({
          message: 'Key Test Successful',
          description: 'The AI Key is valid and working.',
          placement: 'topRight',
        });
      } else {
        notification.error({
          message: 'Key Test Failed',
          description: data.message || 'The AI Key is invalid or not working.',
          placement: 'topRight',
        });
      }
    } catch (err) {
      notification.error({
        message: 'Key Test Error',
        description: 'Could not test the AI Key. Please try again.',
        placement: 'topRight',
      });
    }
  };

  return (
    <Modal
      open={visible}
      title={`AI Key Details${aiKey ? ` - ${aiKey.id}` : ''}`}
      onCancel={onCancel}
      footer={
        aiKey ? (
          <Button type="primary" onClick={handleTestKey} disabled={!aiKey.key}>
            Test Key
          </Button>
        ) : null
      }
      destroyOnHidden
    >
      {aiKey ? (
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="ID">{aiKey.id}</Descriptions.Item>
          <Descriptions.Item label="Key">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <pre style={{ whiteSpace: 'pre-wrap', margin: 0, flex: 1 }}>{aiKey.key}</pre>
              <Button
                size="small"
                type="primary"
                onClick={() => {
                  if (aiKey.key) {
                    navigator.clipboard.writeText(aiKey.key);
                    notification.success({
                      message: 'Copied!',
                      description: 'AI Key has been copied to clipboard.',
                      placement: 'topRight',
                    });
                  }
                }}
              >
                Copy
              </Button>
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Name">{aiKey.name}</Descriptions.Item>
          <Descriptions.Item label="Platform">
            {aiKey.platformName || aiKey.platformId || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Agents">
            {aiKey.agents && aiKey.agents.length > 0
              ? aiKey.agents.map((a: any) => a.name || a.id).join(', ')
              : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Active">{aiKey.isActive ? 'Yes' : 'No'}</Descriptions.Item>
          <Descriptions.Item label="Description">{aiKey.description}</Descriptions.Item>
          <Descriptions.Item label="Updated">
            {aiKey.updatedAt ? new Date(aiKey.updatedAt).toLocaleString() : 'N/A'}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <div style={{ color: '#888', textAlign: 'center', padding: 24 }}>No AI Key selected.</div>
      )}
    </Modal>
  );
}
