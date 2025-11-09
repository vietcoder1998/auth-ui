import React, { useState } from 'react';
import DefaultLayout from '../../layouts/DefaultLayout.tsx';
import AuthStatus from '../../layouts/AuthStatus.tsx';
import FeatureSection from './FeatureSection.tsx';
import SidebarNavigation from './SidebarNavigation.tsx';
import Header from './Header.tsx';
import StatsCard from './StatsCard.tsx';
import QuickActions from './QuickActions.tsx';
import SystemStatus from './SystemStatus.tsx';
import { featureSections, getTotalFeatureCount, getSectionCount } from './featuresData.ts';

const Home: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<string>('Main');
  const sectionNames = Object.keys(featureSections);
  const totalFeatures = getTotalFeatureCount();
  const currentSectionCount = getSectionCount(selectedSection);

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        {/* Header Section */}
        <Header
          title="Auth System"
          subtitle="Complete Management Platform"
          description="Streamline your system administration with our comprehensive suite of tools and features"
          totalFeatures={totalFeatures}
        />

        {/* Auth Status */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <AuthStatus />
        </div>

        {/* Statistics Cards */}
        <div className="max-w-7xl mx-auto px-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatsCard
              title="Total Features"
              value={totalFeatures}
              description="Available system features"
              gradient="from-blue-500 to-indigo-600"
            />
            <StatsCard
              title="Categories"
              value={sectionNames.length}
              description="Feature categories"
              gradient="from-purple-500 to-pink-600"
            />
            <StatsCard
              title="Current Section"
              value={currentSectionCount}
              description={`${selectedSection} features`}
              gradient="from-green-500 to-teal-600"
            />
            <StatsCard
              title="Status"
              value="Active"
              description="System operational"
              gradient="from-orange-500 to-red-600"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="flex">
                  {/* Sidebar Navigation */}
                  <SidebarNavigation
                    sections={sectionNames}
                    selectedSection={selectedSection}
                    onSectionChange={setSelectedSection}
                  />

                  {/* Features Display */}
                  <div className="flex-1 p-8">
                    <FeatureSection
                      title={`${selectedSection} Features`}
                      features={
                        featureSections[selectedSection as keyof typeof featureSections] || []
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar Widgets */}
            <div className="lg:col-span-1 space-y-6">
              <QuickActions />
              <SystemStatus />
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Home;
