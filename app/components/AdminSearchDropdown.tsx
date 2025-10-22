import React from 'react';
import { Dropdown, Input, List, Spin, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

export interface AdminSearchDropdownProps {
  search: string;
  setSearch: (v: string) => void;
  searchResults: any[];
  searchVisible: boolean;
  setSearchVisible: (v: boolean) => void;
  searchLoading: boolean;
}

const AdminSearchDropdown: React.FC<AdminSearchDropdownProps> = ({
  search,
  setSearch,
  searchResults,
  searchVisible,
  setSearchVisible,
  searchLoading,
}) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
    <Dropdown
      open={searchVisible && (searchResults.length > 0 || searchLoading)}
      onOpenChange={setSearchVisible}
      popupRender={() => (
        <div style={{ background: 'white', padding: 0, minWidth: 350, maxWidth: 600 }}>
          {searchLoading ? (
            <div style={{ textAlign: 'center', padding: '24px 10px' }}>
              <Spin />
            </div>
          ) : (
            <List
              bordered
              dataSource={searchResults}
              style={{ width: '100%', maxHeight: 350, overflowY: 'auto', background: 'white' }}
              renderItem={(item: any) => (
                <List.Item style={{ cursor: 'pointer', background: 'white' }}>
                  <Tag color="blue" style={{ marginRight: 8 }}>
                    {item.type}
                  </Tag>
                  <span style={{ fontWeight: 500 }}>{item.name}</span>
                  <span style={{ color: '#888', marginLeft: 8 }}>{item.description}</span>
                </List.Item>
              )}
            />
          )}
        </div>
      )}
      placement="bottomLeft"
    >
      <Input
        prefix={<SearchOutlined />}
        placeholder="Search all..."
        allowClear
        value={search}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setSearch(e.target.value);
          setSearchVisible(true);
        }}
        onBlur={() => setTimeout(() => setSearchVisible(false), 200)}
        style={{ width: 260, marginRight: 16 }}
      />
    </Dropdown>
  </div>
);

export default AdminSearchDropdown;
