import React from 'react';
import ProtectedRoute from './ProtectedRoute.tsx';
import AdminContentLayout from './AdminContentLayout.tsx';

const ProtectedAdminLayout: React.FC = () => {
  return (
    <ProtectedRoute>
      <AdminContentLayout />
    </ProtectedRoute>
  );
};

export default ProtectedAdminLayout;