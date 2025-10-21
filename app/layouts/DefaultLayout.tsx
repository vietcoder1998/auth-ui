import React from 'react';
import PublicHeader from '../components/PublicHeader.tsx';
import PublicFooter from '~/components/PublicFooter.tsx';

const DefaultLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PublicHeader />
      <main className="flex-1 w-full mx-auto max-w-7xl px-4 py-8">{children}</main>
      <PublicFooter />
      <footer className="w-full py-4 text-center text-gray-400 border-t bg-white mt-2">
        &copy; {new Date().getFullYear()} Auth System. All rights reserved.
      </footer>
    </div>
  );
};

export default DefaultLayout;
