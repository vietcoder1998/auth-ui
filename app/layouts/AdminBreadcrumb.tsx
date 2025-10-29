import React from 'react';
import { Link } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';
import { useResponsive } from '~/hooks/useResponsive.tsx';

export default function AdminBreadcrumb({ pathname }: { pathname: string }) {
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbItems: { title: React.ReactNode }[] = [
    {
      title: (
        <Link to="/admin">
          <HomeOutlined /> Admin
        </Link>
      ),
    },
  ];

  if (pathSegments.length > 1) {
    if (pathSegments[1] === 'system') {
      breadcrumbItems.push({
        title: <Link to="/admin/system">System Management</Link>,
      });
      if (pathSegments[2]) {
        const pageTitle = pathSegments[2]
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        breadcrumbItems.push({
          title: <span>{pageTitle}</span>,
        });
      }
    } else if (pathSegments[1] === 'settings') {
      breadcrumbItems.push({
        title: <Link to="/admin/settings">Settings Management</Link>,
      });
      if (pathSegments[2]) {
        const pageTitle = pathSegments[2]
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        breadcrumbItems.push({
          title: <span>{pageTitle}</span>,
        });
      }
    }
  }

  return breadcrumbItems;
}
