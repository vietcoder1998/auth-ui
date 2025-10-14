import React from 'react';
import { Link } from 'react-router-dom';

const adminLinks = [
  { path: '/admin/users', label: 'Users' },
  { path: '/admin/tokens', label: 'Tokens' },
  { path: '/admin/roles', label: 'Roles' },
  { path: '/admin/permissions', label: 'Permissions' },
  { path: '/admin/mail', label: 'Mail' },
  { path: '/admin/notifications', label: 'Notifications' },
  { path: '/admin/config', label: 'Config' },
];

export default function AdminIndexPage() {
  return (
    <div style={{ maxWidth: 600, margin: '2em auto', padding: '2em', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
      <h2>Admin Panel</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {adminLinks.map(link => (
          <li key={link.path} style={{ margin: '1em 0' }}>
            <Link to={link.path} style={{ fontSize: '1.2em', color: '#1677ff' }}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
