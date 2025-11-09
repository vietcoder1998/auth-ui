import React from 'react';

interface HeaderProps {
  title: string;
  subtitle: string;
  description: string;
  totalFeatures: number;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, description, totalFeatures }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-20 -left-20 w-60 h-60 bg-purple-300/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-1/3 w-32 h-32 bg-blue-300/20 rounded-full blur-xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="text-center">
          <div className="inline-block mb-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <span className="text-blue-100 text-sm font-medium">System Dashboard</span>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            {title}
            <span className="block text-2xl md:text-3xl font-normal text-blue-100 mt-2">
              {subtitle}
            </span>
          </h1>

          <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed mb-8">
            {description}
          </p>

          <div className="flex justify-center space-x-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
              <span className="text-white font-medium">{totalFeatures} Features Available</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
              <span className="text-white font-medium">6 Categories</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
