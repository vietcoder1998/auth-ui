import React from 'react';

interface SidebarNavigationProps {
  sections: string[];
  selectedSection: string;
  onSectionChange: (section: string) => void;
}

const sectionIcons: Record<string, string> = {
  Main: '🏠',
  'System Management': '⚙️',
  'AI & Communications': '🤖',
  'File Management': '📁',
  Settings: '🔧',
};

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  sections,
  selectedSection,
  onSectionChange,
}) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
        <span className="mr-2">📋</span>
        Categories
      </h3>
      <nav className="space-y-2">
        {sections.map((sectionName) => (
          <button
            key={sectionName}
            onClick={() => onSectionChange(sectionName)}
            className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center group ${
              selectedSection === sectionName
                ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                : 'bg-white hover:bg-blue-50 text-gray-700 border border-gray-200 hover:border-blue-200 hover:shadow-sm'
            }`}
          >
            <span className="mr-3 text-lg">{sectionIcons[sectionName] || '📄'}</span>
            <span className="font-medium group-hover:translate-x-1 transition-transform">
              {sectionName}
            </span>
            {selectedSection === sectionName && (
              <span className="ml-auto">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default SidebarNavigation;
