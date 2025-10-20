import { EditOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import AdminSidebarMenu from '~/components/AdminSidebarMenu.tsx';
import type { MenuItem } from '../components/AdminSidebarMenu.tsx';
import useCookie from '../hooks/useCookie.tsx';

export interface AdminSidebarProps {
  sidebarItems: MenuItem[];
  editSidebar: boolean;
  setEditSidebar: (v: boolean) => void;
  search: string;
  setSearch: (v: string) => void;
  onDragEnd: (result: any) => void;
  filteredSidebarItems: MenuItem[];
  pathname: string;
  navigate: (key: string) => void;
  handleLogout: () => void;
}

export default function AdminSidebar({
  sidebarItems,
  editSidebar,
  setEditSidebar,
  search,
  setSearch,
  onDragEnd,
  filteredSidebarItems,
  pathname,
  navigate,
  handleLogout,
}: AdminSidebarProps) {
  // Persist search value in cookie
  const [searchCookie, setSearchCookie] = useCookie<string>('admin_sidebar_search', search);
  // Persist sidebar open/close state in cookie
  const [sidebarOpen, setSidebarOpen] = useCookie<boolean>('admin_sidebar_open', true);
  // Persist last navigation in cookie
  const [lastNav, setLastNav] = useCookie<string>('admin_sidebar_last_nav', pathname);

  // Sync state with cookie
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setSearchCookie(e.target.value);
  };
  const handleSidebarToggle = () => {
    setEditSidebar(!editSidebar);
    setSidebarOpen(!editSidebar);
  };
  const handleMenuClick = (key: string) => {
    navigate(key);
    setLastNav(key);
  };

  return (
    <div
      style={{
        background: '#fff',
        borderRight: '1px solid #eee',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 1001,
        overflowY: 'auto',
        width: 250,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', gap: 8 }}>
        <Input
          placeholder="Search menu..."
          value={searchCookie}
          onChange={handleSearchChange}
          style={{
            flex: 1,
            border: '1px solid #eee',
            borderRadius: 4,
            padding: '4px 8px',
            fontSize: 14,
          }}
        />
        <Button
          icon={<EditOutlined />}
          type={editSidebar ? 'primary' : 'default'}
          size="small"
          onClick={handleSidebarToggle}
          style={{ marginLeft: 4 }}
        />
      </div>
      <AdminSidebarMenu selectedKeys={[lastNav]} onMenuClick={handleMenuClick} />
    </div>
  );
}
