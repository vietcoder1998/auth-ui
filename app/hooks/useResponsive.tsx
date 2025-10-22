import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface ResponsiveContextProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isMobile: boolean;
}

const ResponsiveContext = createContext<ResponsiveContextProps | undefined>(undefined);

export const ResponsiveProvider: React.FC<{
  value?: Partial<ResponsiveContextProps>;
  children: React.ReactNode;
}> = ({ value = {}, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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
    <ResponsiveContext.Provider value={{ sidebarOpen, setSidebarOpen, isMobile }}>
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
