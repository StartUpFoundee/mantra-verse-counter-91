
import React from "react";
import { SPIRITUAL_CATEGORIES, CategoryCounts } from "@/utils/activityUtils";
import ModernCard from "./ModernCard";

interface SpiritualJourneyLevelsProps {
  categoryCounts: CategoryCounts;
}

const SpiritualJourneyLevels: React.FC<SpiritualJourneyLevelsProps> = ({ categoryCounts }) => {
  return (
    <div className="mb-6">
      <div className="mb-3">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          🌟 Practice Levels
        </h2>
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-2">
        {SPIRITUAL_CATEGORIES.map((category) => (
          <ModernCard
            key={category.id}
            className={`min-w-[100px] p-3 bg-gradient-to-br ${category.gradient} border-none relative overflow-hidden flex-shrink-0`}
          >
            {/* Content */}
            <div className="relative z-10 text-center">
              {/* Icon */}
              <div className="text-xl mb-2 h-6 flex items-center justify-center">
                {category.icon && (
                  <span className="text-white drop-shadow-sm">{category.icon}</span>
                )}
              </div>
              
              {/* Sanskrit Name */}
              <div className="mb-2">
                <h3 className="text-xs font-bold text-white">
                  {category.sanskritName}
                </h3>
              </div>
              
              {/* Counter */}
              <div className="bg-white/20 rounded-full px-2 py-1">
                <span className="text-sm font-bold text-white">
                  {categoryCounts[category.id] || 0}
                </span>
              </div>
            </div>
          </ModernCard>
        ))}
      </div>
    </div>
  );
};

export default SpiritualJourneyLevels;
