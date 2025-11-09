import React from 'react';
import { Link } from 'react-router-dom';

interface QuickAction {
  label: string;
  path: string;
  icon: string;
  color: string;
  description: string;
}

const quickActions: QuickAction[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: '📊',
    color: 'from-blue-500 to-blue-600',
    description: 'View system overview',
  },
  {
    label: 'Users',
    path: '/admin/system/users',
    icon: '👥',
    color: 'from-green-500 to-green-600',
    description: 'Manage system users',
  },
  {
    label: 'Settings',
    path: '/admin/settings/config',
    icon: '⚙️',
    color: 'from-purple-500 to-purple-600',
    description: 'System configuration',
  },
  {
    label: 'Logs',
    path: '/admin/system/logs',
    icon: '📝',
    color: 'from-orange-500 to-orange-600',
    description: 'View system logs',
  },
];

const QuickActions: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <span className="mr-2">⚡</span>
        Quick Actions
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {quickActions.map((action) => (
          <Link key={action.path} to={action.path} className="group block">
            <div
              className={`bg-gradient-to-r ${action.color} rounded-lg p-4 text-white transform transition-all duration-200 hover:scale-105 hover:shadow-lg`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{action.icon}</span>
                <div className="w-2 h-2 bg-white/30 rounded-full"></div>
              </div>
              <h4 className="font-medium text-sm mb-1">{action.label}</h4>
              <p className="text-xs text-white/80 leading-relaxed">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
