
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
    <div className="space-y-6">
      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ModernCard className="p-6 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 border-blue-300/30 dark:border-blue-600/30" gradient>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-2xl shadow-lg">
              {currentCat?.icon || '🌱'}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-1">Current Level</h3>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{currentCat?.name || 'Seeker'}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{currentCat?.description}</p>
            </div>
          </div>
        </ModernCard>

        <ModernCard className="p-6 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border-yellow-300/30 dark:border-yellow-600/30" gradient>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-600 dark:text-yellow-400 mb-1">Highest Achievement</h3>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{highestCat?.name || 'Seeker'}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Your peak level</p>
            </div>
          </div>
        </ModernCard>
      </div>

      {/* Category Progress */}
      <ModernCard className="p-6 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl border-amber-200/50 dark:border-amber-700/50" gradient>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Spiritual Categories</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Your journey through different levels of practice</p>
        </div>

        <div className="space-y-4">
          {MANTRA_CATEGORIES.map((category, index) => {
            const achievedDays = categoryDistribution[category.id] || 0;
            const isUnlocked = achievedDays > 0;
            const isCurrent = category.id === currentCategory;
            const isHighest = category.id === highestCategory;
            
            return (
              <div
                key={category.id}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${
                  isUnlocked 
                    ? 'bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-700' 
                    : 'bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700'
                } ${isCurrent ? 'ring-2 ring-amber-400' : ''}`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                  isUnlocked ? 'bg-white dark:bg-zinc-700 shadow-md' : 'bg-gray-200 dark:bg-zinc-600 grayscale'
                }`}>
                  {category.icon}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-semibold ${
                      isUnlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {category.name}
                    </h3>
                    {isCurrent && (
                      <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 text-xs font-medium rounded-full">
                        Current
                      </span>
                    )}
                    {isHighest && category.id !== currentCategory && (
                      <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 text-xs font-medium rounded-full">
                        Best
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${
                    isUnlocked ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {category.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-medium ${
                      isUnlocked ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {category.minCount}{category.maxCount === Infinity ? '+' : `-${category.maxCount}`} mantras
                    </span>
                    {achievedDays > 0 && (
                      <span className="text-xs text-amber-600 dark:text-amber-400">
                        • {achievedDays} day{achievedDays !== 1 ? 's' : ''} achieved
                      </span>
                    )}
                  </div>
                </div>
                
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isUnlocked ? 'bg-emerald-100 dark:bg-emerald-900' : 'bg-gray-100 dark:bg-zinc-700'
                }`}>
                  {isUnlocked ? (
                    <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 text-xs font-bold">{index + 1}</span>
                  )}
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
