import React from 'react';

interface Tab {
  key: string;
  label: string;
  icon: string;
  badge?: number;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabKey: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-center">
        <div className="flex bg-gray-50 p-1 rounded-xl border">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`relative px-6 py-3 font-medium text-sm transition-all duration-300 rounded-lg flex items-center ${
                activeTab === tab.key
                  ? 'bg-white text-blue-600 shadow-md transform scale-105'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
            >
              <span className="mr-2 text-lg">{tab.icon}</span>
              <span className="font-semibold">{tab.label}</span>
              {tab.badge && (
                <span className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                  {tab.badge}
                </span>
              )}
              {activeTab === tab.key && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;
