import React from 'react';
import DefaultLayout from '../layouts/DefaultLayout.tsx';
import PublicHeader from '../components/PublicHeader.tsx';
import AuthStatus from '../layouts/AuthStatus.tsx';
import { Link } from 'react-router-dom';

const features = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Admin', path: '/admin' },
  { label: 'FAQ', path: '/admin/system/faqs' },
  { label: 'Jobs', path: '/admin/system/jobs' },
  { label: 'Users', path: '/admin/system/users' },
  { label: 'Tokens', path: '/admin/system/tokens' },
  { label: 'Roles', path: '/admin/system/roles' },
  { label: 'Permissions', path: '/admin/system/permissions' },
  { label: 'SSO', path: '/admin/system/sso' },
  { label: 'Login History', path: '/admin/system/login-history' },
  { label: 'Logic History', path: '/admin/system/logic-history' },
  { label: 'Cache', path: '/admin/system/cache' },
  { label: 'Logs', path: '/admin/system/logs' },
  { label: 'Agents', path: '/admin/system/agents' },
  { label: 'Conversations', path: '/admin/system/conversations' },
  { label: 'Prompt History', path: '/admin/system/prompt-history' },
  { label: 'Sockets', path: '/admin/system/sockets' },
  { label: 'Documents', path: '/admin/system/documents' },
  { label: 'Files', path: '/admin/system/files' },
  { label: 'API Keys', path: '/admin/settings/api-keys' },
  { label: 'Mail', path: '/admin/settings/mail' },
  { label: 'Notifications', path: '/admin/settings/notifications' },
  { label: 'Config', path: '/admin/settings/config' },
  { label: 'Seed', path: '/admin/settings/seed' },
  { label: 'Database', path: '/admin/settings/database' },
];

const Home: React.FC = () => {
  return (
    <DefaultLayout>
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded shadow">
        <h1 className="text-3xl font-bold text-center mb-6">Welcome to the Auth System</h1>
        <AuthStatus />
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-center">System Features</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature) => (
              <Link
                key={feature.path}
                to={feature.path}
                className="block p-4 bg-blue-50 rounded hover:bg-blue-100 text-blue-700 font-medium text-center shadow cursor-pointer border border-blue-100"
              >
                {feature.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Home;
