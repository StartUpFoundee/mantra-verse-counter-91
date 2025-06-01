
import React from "react";
import { SPIRITUAL_CATEGORIES, CategoryCounts } from "@/utils/activityUtils";
import ModernCard from "./ModernCard";

interface SpiritualJourneyLevelsProps {
  categoryCounts: CategoryCounts;
}

const SpiritualJourneyLevels: React.FC<SpiritualJourneyLevelsProps> = ({ categoryCounts }) => {
  return (
    <div className="mb-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          🌟 Spiritual Journey Levels
        </h2>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {SPIRITUAL_CATEGORIES.map((category) => (
          <ModernCard
            key={category.id}
            className={`p-3 bg-gradient-to-br ${category.gradient} border-none relative overflow-hidden`}
          >
            {/* Content */}
            <div className="relative z-10 text-center">
              {/* Icon */}
              <div className="text-2xl mb-2 h-8 flex items-center justify-center">
                {category.id === 6 ? (
                  <img 
                    src="/lovable-uploads/c74d731e-65cc-4acc-94a8-b537d1013a2d.png" 
                    alt="Jivanmukta"
                    className="w-6 h-6 object-cover rounded"
                  />
                ) : (
                  category.icon
                )}
              </div>
              
              {/* Names */}
              <div className="mb-2">
                <h3 className="text-xs font-bold text-white mb-1">
                  {category.name}
                </h3>
                <p className="text-xs text-white/90 font-medium">
                  {category.sanskritName}
                </p>
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
