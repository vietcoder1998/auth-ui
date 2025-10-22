import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import useCookie, { useBooleanCookie, useStringCookie } from '../hooks/useCookie.tsx';

interface ResponsiveContextProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isMobile: boolean;
  isDesktop: boolean;
  chatPosition: string;
  setChatPosition: (pos: string) => void;
  isChatCollapsed: boolean;
  setIsChatCollapsed: (collapsed: boolean) => void;
  search: string;
  setSearch: (search: string) => void;
  sidebarItems: any[];
  setSidebarItems: (items: any[]) => void;
  lastNav: string;
  setLastNav: (nav: string) => void;
}

const ResponsiveContext = createContext<ResponsiveContextProps | undefined>(undefined);

export const ResponsiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Sidebar open state
  const [sidebarOpen, setSidebarOpen] = useBooleanCookie('admin_sidebar_open', true);
  // Mobile detection
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const isDesktop = !isMobile;
  // Chat widget state
  const [chatPosition, setChatPosition] = useStringCookie('admin_chat_position', 'bottom-right');
  const [isChatCollapsed, setIsChatCollapsed] = useBooleanCookie('admin_chat_collapsed', false);
  // Sidebar search
  const [search, setSearch] = useCookie<string>('admin_sidebar_search', '');
  // Sidebar items order
  const [sidebarItems, setSidebarItems] = useCookie<any[]>('admin_sidebar_order', []);
  // Last navigation
  const [lastNav, setLastNav] = useCookie<string>('admin_sidebar_last_nav', '/admin');

  // Detect mobile viewport
  const handleResize = useCallback(() => {
    setIsMobile(window.innerWidth <= 768);
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  return (
    <ResponsiveContext.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        isMobile,
        isDesktop,
        chatPosition,
        setChatPosition,
        isChatCollapsed,
        setIsChatCollapsed,
        search,
        setSearch,
        sidebarItems,
        setSidebarItems,
        lastNav,
        setLastNav,
      }}
    >
      {children}
    </ResponsiveContext.Provider>
  );
};

export function useResponsive(): ResponsiveContextProps {
  const context = useContext(ResponsiveContext);
  if (!context) {
    throw new Error('useResponsive must be used within a ResponsiveProvider');
  }
  return context;
}
