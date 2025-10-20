import React from 'react';
import { Drawer, Button, Spin, Tabs, Alert, Table } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  RobotOutlined,
  KeyOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

interface SeedData {
  [key: string]: any[];
}

interface Props {
  viewSeedVisible: boolean;
  setViewSeedVisible: (visible: boolean) => void;
  seedData: SeedData;
  seedDataLoading: boolean;
  fetchSeedData: () => void;
}

const SeedDataViewerDrawer: React.FC<Props> = ({
  viewSeedVisible,
  setViewSeedVisible,
  seedData,
  seedDataLoading,
  fetchSeedData,
}) => (
  <Drawer
    title="Seed Data Viewer"
    placement="right"
    size="large"
    open={viewSeedVisible}
    onClose={() => setViewSeedVisible(false)}
    extra={
      <Button icon={<ReloadOutlined />} onClick={fetchSeedData} loading={seedDataLoading}>
        Refresh
      </Button>
    }
  >
    {seedDataLoading ? (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>Loading seed data...</div>
      </div>
    ) : (
      <Tabs
        defaultActiveKey="users"
        items={Object.keys(seedData).map((key) => ({
          key,
          label: (
            <span>
              {key === 'users' && <UserOutlined />}
              {key === 'roles' && <TeamOutlined />}
              {key === 'permissions' && <SafetyCertificateOutlined />}
              {key === 'configs' && <SettingOutlined />}
              {key === 'agents' && <RobotOutlined />}
              {key === 'apiKeys' && <KeyOutlined />} {key.charAt(0).toUpperCase() + key.slice(1)} (
              {seedData[key]?.length || 0})
            </span>
          ),
          children: (
            <div>
              {seedData[key] && seedData[key].length > 0 ? (
                <Table
                  dataSource={seedData[key]}
                  columns={generateTableColumns(key, seedData[key][0])}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: true }}
                  size="small"
                  rowKey={(record) =>
                    record.id || record.email || record.name || record.key || record.code
                  }
                />
              ) : (
                <Alert
                  message="No Data"
                  description={`No ${key} data available to display.`}
                  type="info"
                  showIcon
                />
              )}
            </div>
          ),
        }))}
      />
    )}
  </Drawer>
);

// Helper function to generate table columns based on data structure
function generateTableColumns(dataType: string, sampleData: any) {
  if (!sampleData) return [];

  const columns = Object.keys(sampleData).map((key) => ({
    title: key.charAt(0).toUpperCase() + key.slice(1),
    dataIndex: key,
    key,
    render: (value: any) => {
      if (value === null || value === undefined) return '-';
      if (typeof value === 'boolean') return value ? 'Yes' : 'No';
      if (typeof value === 'object') return JSON.stringify(value, null, 2);
      if (typeof value === 'string' && value.length > 50) {
        return <span title={value}>{value.substring(0, 50)}...</span>;
      }
      return value;
    },
    width: key === 'id' ? 80 : key.includes('email') ? 200 : 150,
  }));

  // Sort columns to put important ones first
  const importantColumns = ['id', 'name', 'email', 'title', 'key', 'code', 'type'];
  return columns.sort((a, b) => {
    const aIndex = importantColumns.indexOf(a.dataIndex as string);
    const bIndex = importantColumns.indexOf(b.dataIndex as string);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return 0;
  });
}

export default SeedDataViewerDrawer;
