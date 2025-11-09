import React from 'react';

interface StatusItem {
  service: string;
  status: 'online' | 'offline' | 'warning';
  uptime?: string;
  lastCheck?: string;
}

const systemServices: StatusItem[] = [
  {
    service: 'Auth API',
    status: 'online',
    uptime: '99.9%',
    lastCheck: '2 mins ago',
  },
  {
    service: 'Database',
    status: 'online',
    uptime: '99.8%',
    lastCheck: '1 min ago',
  },
  {
    service: 'Cache Server',
    status: 'online',
    uptime: '99.7%',
    lastCheck: '3 mins ago',
  },
  {
    service: 'Email Service',
    status: 'warning',
    uptime: '98.2%',
    lastCheck: '5 mins ago',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'online':
      return 'text-green-600 bg-green-100';
    case 'warning':
      return 'text-yellow-600 bg-yellow-100';
    case 'offline':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'online':
      return '🟢';
    case 'warning':
      return '🟡';
    case 'offline':
      return '🔴';
    default:
      return '⚪';
  }
};

const SystemStatus: React.FC = () => {
  const onlineServices = systemServices.filter((s) => s.status === 'online').length;
  const totalServices = systemServices.length;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <span className="mr-2">💻</span>
          System Status
        </h3>
        <div className="text-sm text-gray-500">
          {onlineServices}/{totalServices} Online
        </div>
      </div>

      <div className="space-y-3">
        {systemServices.map((service) => (
          <div
            key={service.service}
            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg">{getStatusIcon(service.status)}</span>
              <div>
                <div className="font-medium text-gray-800">{service.service}</div>
                <div className="text-xs text-gray-500">{service.lastCheck}</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-600">{service.uptime}</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}
              >
                {service.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Overall Health</span>
          <div className="flex items-center space-x-2">
            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${(onlineServices / totalServices) * 100}%` }}
              ></div>
            </div>
            <span className="font-medium text-green-600">
              {Math.round((onlineServices / totalServices) * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;
