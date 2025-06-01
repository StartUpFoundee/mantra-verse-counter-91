
import React from "react";
import { SPIRITUAL_CATEGORIES, CategoryCounts } from "@/utils/activityUtils";
import ModernCard from "./ModernCard";

interface SpiritualJourneyLevelsProps {
  categoryCounts: CategoryCounts;
}

const SpiritualJourneyLevels: React.FC<SpiritualJourneyLevelsProps> = ({ categoryCounts }) => {
  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          🌟 Spiritual Journey Levels
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Track your spiritual evolution through dedicated practice
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {SPIRITUAL_CATEGORIES.map((category) => (
          <ModernCard
            key={category.id}
            className={`p-4 bg-gradient-to-br ${category.gradient} border-none relative overflow-hidden`}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-2 right-2 text-4xl opacity-30">
                {category.icon}
              </div>
            </div>
            
            {/* Content */}
            <div className="relative z-10">
              {/* Icon and Range */}
              <div className="flex items-center justify-between mb-3">
                <div className="text-3xl">{category.icon}</div>
                <div className="text-xs font-semibold text-white/90 bg-white/20 px-2 py-1 rounded-full">
                  {category.range}
                </div>
              </div>
              
              {/* Names */}
              <div className="mb-3">
                <h3 className="text-sm font-bold text-white mb-1">
                  {category.name}
                </h3>
                <p className="text-xs text-white/90 font-medium">
                  {category.sanskritName}
                </p>
              </div>
              
              {/* Description */}
              <p className="text-xs text-white/80 mb-3 leading-relaxed">
                {category.description}
              </p>
              
              {/* Quote */}
              <p className="text-xs italic text-white/75 mb-3 border-l-2 border-white/30 pl-2">
                "{category.quote}"
              </p>
              
              {/* Counter */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/90">Days Achieved:</span>
                <div className="bg-white/20 rounded-full px-3 py-1">
                  <span className="text-sm font-bold text-white">
                    {categoryCounts[category.id] || 0}
                  </span>
                </div>
              </div>
            </div>
          </ModernCard>
        ))}
      </div>
    </div>
  );
};

export default SpiritualJourneyLevels;
