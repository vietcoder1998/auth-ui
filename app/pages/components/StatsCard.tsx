import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  gradient?: string;
  textColor?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon,
  gradient = 'from-blue-500 to-purple-600',
  textColor = 'text-white',
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${gradient} p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <h3 className={`text-sm font-medium ${textColor} opacity-90`}>{title}</h3>
          {icon && <div className={`${textColor} opacity-75`}>{icon}</div>}
        </div>

        <div className={`text-3xl font-bold ${textColor} mb-1`}>{value}</div>

        {description && <p className={`text-sm ${textColor} opacity-75`}>{description}</p>}
      </div>

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-20 h-20 bg-white rounded-full -translate-y-10 translate-x-10"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full translate-y-8 -translate-x-8"></div>
      </div>
    </div>
  );
};

export default StatsCard;
