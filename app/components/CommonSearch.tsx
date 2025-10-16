import React from 'react';
import { Card, Input, Space, Button, Select, Form } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;

interface FilterOption {
  key: string;
  label: string;
  options: Array<{
    value: string;
    label: string;
  }>;
}

interface CommonSearchProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearch: (value: string) => void;
  onRefresh?: () => void;
  loading?: boolean;
  showRefresh?: boolean;
  filters?: FilterOption[];
  filterValues?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  extra?: React.ReactNode;
  style?: React.CSSProperties;
}

const CommonSearch: React.FC<CommonSearchProps> = ({
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearch,
  onRefresh,
  loading = false,
  showRefresh = true,
  filters = [],
  filterValues = {},
  onFilterChange,
  extra,
  style = {
    border: 'none',
    padding: 0,
   }
}) => {
  return (
    <Card style={style}>
      <Space direction="vertical" style={{ width: '100%' }}>
        {/* Main search row */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Search
            placeholder={searchPlaceholder}
            allowClear
            enterButton={<SearchOutlined />}
            value={searchValue}
            onSearch={onSearch}
            onChange={(e) => onSearch(e.target.value)}
            style={{ flex: 1, minWidth: '300px' }}
            loading={loading}
          />
          
          {showRefresh && onRefresh && (
            <Button 
              icon={<ReloadOutlined />} 
              onClick={onRefresh}
              loading={loading}
            >
              Refresh
            </Button>
          )}
          
          {extra}
        </div>

        {/* Filters row */}
        {filters.length > 0 && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            {filters.map((filter) => (
              <div key={filter.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', color: '#666', whiteSpace: 'nowrap' }}>
                  {filter.label}:
                </span>
                <Select
                  style={{ minWidth: '120px' }}
                  placeholder={`Select ${filter.label}`}
                  allowClear
                  value={filterValues[filter.key] || undefined}
                  onChange={(value) => onFilterChange?.(filter.key, value || '')}
                >
                  {filter.options.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </div>
            ))}
          </div>
        )}
      </Space>
    </Card>
  );
};

export default CommonSearch;