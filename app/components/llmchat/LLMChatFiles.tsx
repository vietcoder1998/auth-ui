import { DeleteOutlined, FileOutlined } from '@ant-design/icons';
import { Button, Typography } from 'antd';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string | null;
}

interface LLMChatFilesProps {
  uploadedFiles: UploadedFile[];
  removeFile: (id: string) => void;
}

export function LLMChatFiles({ uploadedFiles, removeFile }: LLMChatFilesProps) {
  return uploadedFiles.length > 0 ? (
    <div style={{ marginBottom: '12px' }}>
      <Typography.Text
        type="secondary"
        style={{ fontSize: '12px', marginBottom: '8px', display: 'block' }}
      >
        Context Files ({uploadedFiles.length}):
      </Typography.Text>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {uploadedFiles.map((file) => (
          <div
            key={file.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: '#f5f5f5',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
            }}
          >
            <FileOutlined />
            <span>{file.name}</span>
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => removeFile(file.id)}
              style={{ minWidth: 'auto', padding: '0 4px' }}
            />
          </div>
        ))}
      </div>
    </div>
  ) : null;
}
