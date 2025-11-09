import React, { useState } from 'react';
import DefaultLayout from '../../layouts/DefaultLayout.tsx';
import PublicHeader from '../../components/PublicHeader.tsx';
import AuthStatus from '../../layouts/AuthStatus.tsx';
import { Link } from 'react-router-dom';

const featureSections = {
  Main: [
    {
      label: 'Dashboard',
      path: '/dashboard',
      description: 'Main dashboard with system overview and statistics',
    },
    { label: 'Admin', path: '/admin', description: 'Administrative panel for system management' },
  ],
  'System Management': [
    { label: 'FAQ', path: '/admin/system/faqs', description: 'Manage frequently asked questions' },
    {
      label: 'Jobs',
      path: '/admin/system/jobs',
      description: 'Monitor and manage background jobs',
    },
    {
      label: 'Users',
      path: '/admin/system/users',
      description: 'User management and administration',
    },
    { label: 'Tokens', path: '/admin/system/tokens', description: 'API token management' },
    { label: 'Roles', path: '/admin/system/roles', description: 'Role-based access control' },
    {
      label: 'Permissions',
      path: '/admin/system/permissions',
      description: 'Permission management system',
    },
    { label: 'SSO', path: '/admin/system/sso', description: 'Single Sign-On configuration' },
    {
      label: 'Login History',
      path: '/admin/system/login-history',
      description: 'User login activity tracking',
    },
    {
      label: 'Logic History',
      path: '/admin/system/logic-history',
      description: 'System logic execution history',
    },
    { label: 'Cache', path: '/admin/system/cache', description: 'Cache management and monitoring' },
    { label: 'Logs', path: '/admin/system/logs', description: 'System logs and error tracking' },
  ],
  'AI & Communications': [
    {
      label: 'Agents',
      path: '/admin/system/agents',
      description: 'AI agent management and configuration',
    },
    {
      label: 'Conversations',
      path: '/admin/system/conversations',
      description: 'Chat and conversation history',
    },
    {
      label: 'Prompt History',
      path: '/admin/system/prompt-history',
      description: 'AI prompt tracking and analysis',
    },
    {
      label: 'Sockets',
      path: '/admin/system/sockets',
      description: 'WebSocket connection management',
    },
  ],
  'File Management': [
    {
      label: 'Documents',
      path: '/admin/system/documents',
      description: 'Document storage and management',
    },
    { label: 'Files', path: '/admin/system/files', description: 'File upload and organization' },
  ],
  Settings: [
    {
      label: 'API Keys',
      path: '/admin/settings/api-keys',
      description: 'External API key configuration',
    },
    {
      label: 'Mail',
      path: '/admin/settings/mail',
      description: 'Email server and template settings',
    },
    {
      label: 'Notifications',
      path: '/admin/settings/notifications',
      description: 'Notification preferences and channels',
    },
    {
      label: 'Config',
      path: '/admin/settings/config',
      description: 'System configuration management',
    },
    {
      label: 'Seed',
      path: '/admin/settings/seed',
      description: 'Database seeding and initial data',
    },
    {
      label: 'Database',
      path: '/admin/settings/database',
      description: 'Database connection and management',
    },
  ],
};

const Home: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<string>('Main');
  const sectionNames = Object.keys(featureSections);

  return (
    <DefaultLayout>
      <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded shadow">
        <h1 className="text-3xl font-bold text-center mb-6">Welcome to the Auth System</h1>
        <AuthStatus />

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-6 text-center">System Features</h2>

          <div className="flex gap-6">
            {/* Left Section - Categories */}
            <div className="w-1/3">
              <h3 className="text-lg font-medium mb-4 text-gray-700">Categories</h3>
              <ul className="space-y-2">
                {sectionNames.map((sectionName) => (
                  <li key={sectionName}>
                    <button
                      onClick={() => setSelectedSection(sectionName)}
                      className={`w-full text-left p-3 rounded transition-colors duration-200 ${
                        selectedSection === sectionName
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
                      }`}
                    >
                      {sectionName}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Section - Features */}
            <div className="w-2/3">
              <h3 className="text-lg font-medium mb-4 text-gray-700">{selectedSection} Features</h3>
              <div className="space-y-3">
                {featureSections[selectedSection as keyof typeof featureSections]?.map(
                  (feature) => (
                    <div
                      key={feature.path}
                      className="p-4 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors duration-200"
                    >
                      <Link to={feature.path} className="block text-blue-700 hover:text-blue-800">
                        <h4 className="font-medium text-lg mb-2">{feature.label}</h4>
                        <p className="text-sm text-blue-600 opacity-80">{feature.description}</p>
                      </Link>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Home;
