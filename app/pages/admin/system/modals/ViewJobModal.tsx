import { Modal, Tag } from 'antd';

interface ViewJobModalProps {
  visible: boolean;
  job: any;
  onCancel: () => void;
}

export default function ViewJobModal({ visible, job, onCancel }: ViewJobModalProps) {
  return (
    <Modal open={visible} title="Job Details" onCancel={onCancel} footer={null}>
      {job && !['extract', 'file-tuning', 'backup'].includes(job.type) && (
        <div>
          <p>
            <b>Type:</b> <Tag color="blue">{job.type}</Tag>
          </p>
          <p>
            <b>Total Run:</b> <Tag color="purple">{job.totalRun ?? 0}</Tag>
          </p>
          <p>
            <b>Status:</b>{' '}
            <Tag
              color={
                job.status === 'completed'
                  ? 'green'
                  : job.status === 'failed'
                    ? 'red'
                    : job.status === 'running'
                      ? 'orange'
                      : 'default'
              }
            >
              {job.status}
            </Tag>
          </p>
          <p>
            <b>Created:</b> {new Date(job.createdAt).toLocaleString()}
          </p>
          <p>
            <b>Result:</b> <pre>{job.result}</pre>
          </p>
          <p>
            <b>Error:</b> <pre>{job.error}</pre>
          </p>
          <p>
            <b>Payload:</b> <pre>{job.payload}</pre>
          </p>
        </div>
      )}
    </Modal>
  );
}
