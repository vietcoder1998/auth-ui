import React, { useRef, useEffect } from 'react';
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
  searchPlaceholder = 'Search...',
  searchValue = '',
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
  },
}) => {
  // Only trigger search on button click
  const [inputValue, setInputValue] = React.useState(searchValue);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  const handleSearchClick = () => {
    onSearch(inputValue);
  };

  return (
    <Card style={{ ...style, padding: 0 }} styles={{ body: { padding: 0 } }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        {/* Main search row */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
          }}
        >
          <Input
            placeholder={searchPlaceholder}
            allowClear
            value={inputValue}
            onChange={handleInputChange}
            style={{ flex: 1, minWidth: '300px' }}
            disabled={loading}
          />
          <Button
            icon={<SearchOutlined />}
            type="primary"
            onClick={handleSearchClick}
            loading={loading}
            style={{ minWidth: 40 }}
          >
            Search
          </Button>
          {showRefresh && onRefresh && (
            <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading}>
              Refresh
            </Button>
          )}
          {extra}
        </div>

        {/* Filters row */}
        {filters.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              flexWrap: 'wrap',
              justifyContent: 'flex-start',
            }}
          >
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
      {/* Example: Render search results as links (if extra is a list of results) */}
      {/* You can pass a list of results as extra, or refactor to accept results prop */}
      {/* Example usage: <CommonSearch extra={<ResultList results={results} />} ... /> */}
    </Card>
  );
};

export default CommonSearch;
