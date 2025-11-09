import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar.tsx';

interface Feature {
  label: string;
  path: string;
  description: string;
}

interface FeatureSectionProps {
  title: string;
  features: Feature[];
}

const FeatureSection: React.FC<FeatureSectionProps> = ({ title, features }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFeatures = useMemo(() => {
    if (!searchQuery.trim()) return features;

    return features.filter(
      (feature) =>
        feature.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feature.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [features, searchQuery]);
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-700 border-b pb-2">{title}</h3>
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          {filteredFeatures.length} of {features.length}
        </div>
      </div>

      <SearchBar onSearch={setSearchQuery} placeholder={`Search ${title.toLowerCase()}...`} />

      {filteredFeatures.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">No features found</h3>
          <p className="text-gray-500">
            {searchQuery
              ? `No features match "${searchQuery}"`
              : 'No features available in this section'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredFeatures.map((feature) => (
            <div
              key={feature.path}
              className="group p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 hover:border-blue-200 hover:shadow-md transition-all duration-200"
            >
              <Link to={feature.path} className="block text-blue-700 hover:text-blue-800">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-2 group-hover:text-blue-900 transition-colors">
                      {feature.label}
                    </h4>
                    <p className="text-sm text-blue-600 opacity-80 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                  <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg
                      className="w-5 h-5 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeatureSection;
