
import React from "react";
import { MANTRA_CATEGORIES, MantraCategory, getCategoryById } from "@/utils/activityUtils";
import { Crown, Target, TrendingUp } from "lucide-react";
import ModernCard from "@/components/ModernCard";

interface CategoryDisplayProps {
  currentCategory: string;
  highestCategory: string;
  categoryDistribution: {[category: string]: number};
}

const CategoryDisplay: React.FC<CategoryDisplayProps> = ({
  currentCategory,
  highestCategory,
  categoryDistribution
}) => {
  const currentCat = getCategoryById(currentCategory);
  const highestCat = getCategoryById(highestCategory);
  
  return (
    <div className="space-y-4">
      {/* Current Status - Compact Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ModernCard className="p-4 bg-gradient-to-br from-blue-500/90 to-indigo-600/90 border-blue-300/30 text-white" gradient>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-xl">
              {currentCat?.icon || '🌱'}
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-1">Current Level</h3>
              <div className="text-lg font-bold">{currentCat?.name || 'Seeker'}</div>
            </div>
          </div>
        </ModernCard>

        <ModernCard className="p-4 bg-gradient-to-br from-yellow-500/90 to-orange-600/90 border-yellow-300/30 text-white" gradient>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-1">Highest Achievement</h3>
              <div className="text-lg font-bold">{highestCat?.name || 'Seeker'}</div>
            </div>
          </div>
        </ModernCard>
      </div>

      {/* Compact Category Progress */}
      <ModernCard className="p-4 bg-gradient-to-br from-purple-500/90 to-pink-600/90 border-purple-300/30 text-white" gradient>
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-5 h-5" />
            <h2 className="text-lg font-bold">Spiritual Journey</h2>
          </div>
          <p className="text-sm text-white/80">Your progress through different levels</p>
        </div>

        {/* Compact grid layout for categories */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {MANTRA_CATEGORIES.map((category) => {
            const achievedDays = categoryDistribution[category.id] || 0;
            const isUnlocked = achievedDays > 0;
            const isCurrent = category.id === currentCategory;
            const isHighest = category.id === highestCategory;
            
            return (
              <div
                key={category.id}
                className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
                  isUnlocked 
                    ? 'bg-white/20 border border-white/30' 
                    : 'bg-black/20 border border-white/10'
                } ${isCurrent ? 'ring-2 ring-yellow-400' : ''}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg mb-1 ${
                  isUnlocked ? 'bg-white/30' : 'bg-black/20 grayscale'
                }`}>
                  {category.icon}
                </div>
                
                <div className="text-center">
                  <h3 className={`text-xs font-semibold mb-1 ${
                    isUnlocked ? 'text-white' : 'text-white/50'
                  }`}>
                    {category.name}
                  </h3>
                  
                  <div className="flex flex-wrap gap-1 justify-center">
                    {isCurrent && (
                      <span className="px-1 py-0.5 bg-yellow-400 text-yellow-900 text-[10px] font-medium rounded">
                        Current
                      </span>
                    )}
                    {isHighest && category.id !== currentCategory && (
                      <span className="px-1 py-0.5 bg-orange-400 text-orange-900 text-[10px] font-medium rounded">
                        Best
                      </span>
                    )}
                  </div>
                  
                  <div className="text-[10px] text-white/70 mt-1">
                    {category.minCount}{category.maxCount === Infinity ? '+' : `-${category.maxCount}`}
                    {achievedDays > 0 && (
                      <div className="text-yellow-300">
                        {achievedDays} day{achievedDays !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ModernCard>
    </div>
  );
};

export default CategoryDisplay;
