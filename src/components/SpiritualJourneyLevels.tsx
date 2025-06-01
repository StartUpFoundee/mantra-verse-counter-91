
import React from 'react';
import ModernCard from './ModernCard';

interface SpiritualLevel {
  name: string;
  icon: string;
  range: string;
  minJaaps: number;
  maxJaaps: number | null;
  color: string;
}

interface SpiritualJourneyLevelsProps {
  activityData: {[date: string]: number};
}

const spiritualLevels: SpiritualLevel[] = [
  {
    name: "Rogi",
    icon: "",
    range: "0 jaaps",
    minJaaps: 0,
    maxJaaps: 0,
    color: "bg-gray-200 text-gray-600"
  },
  {
    name: "Bhogi",
    icon: "🍯",
    range: "1-108",
    minJaaps: 1,
    maxJaaps: 108,
    color: "bg-green-200 text-green-700"
  },
  {
    name: "Yogi",
    icon: "🧘‍♂️",
    range: "109-500",
    minJaaps: 109,
    maxJaaps: 500,
    color: "bg-blue-200 text-blue-700"
  },
  {
    name: "Sadhak",
    icon: "🕉️",
    range: "501-1000",
    minJaaps: 501,
    maxJaaps: 1000,
    color: "bg-teal-200 text-teal-700"
  },
  {
    name: "Tapasvi",
    icon: "🔥",
    range: "1001-1500",
    minJaaps: 1001,
    maxJaaps: 1500,
    color: "bg-yellow-200 text-yellow-700"
  },
  {
    name: "Rishi",
    icon: "🔱",
    range: "1501-2100",
    minJaaps: 1501,
    maxJaaps: 2100,
    color: "bg-purple-200 text-purple-700"
  },
  {
    name: "Jivanmukta",
    icon: "🧘‍♀️",
    range: "2100+",
    minJaaps: 2100,
    maxJaaps: null,
    color: "bg-pink-200 text-pink-700"
  }
];

const getSpiritualLevel = (jaapCount: number): SpiritualLevel => {
  for (let i = spiritualLevels.length - 1; i >= 0; i--) {
    const level = spiritualLevels[i];
    if (jaapCount >= level.minJaaps && (level.maxJaaps === null || jaapCount <= level.maxJaaps)) {
      return level;
    }
  }
  return spiritualLevels[0]; // Default to Rogi
};

const SpiritualJourneyLevels: React.FC<SpiritualJourneyLevelsProps> = ({ activityData }) => {
  // Calculate days for each level
  const levelDays = spiritualLevels.map(level => {
    const days = Object.values(activityData).filter(count => {
      if (level.maxJaaps === null) {
        return count >= level.minJaaps;
      }
      return count >= level.minJaaps && count <= level.maxJaaps;
    }).length;
    
    return {
      ...level,
      days
    };
  });

  return (
    <div className="mb-8 lg:mb-12 max-w-6xl mx-auto">
      <ModernCard className="p-6 lg:p-8 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl border-amber-200/50 dark:border-amber-700/50" gradient>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🏆</span>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Achievement Categories</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Your progress across different levels of spiritual practice</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
          {levelDays.map((level, index) => (
            <div
              key={index}
              className={`rounded-xl p-4 text-center transition-all duration-200 hover:scale-105 ${level.color}`}
            >
              {level.icon && (
                <div className="text-2xl mb-2">{level.icon}</div>
              )}
              <div className="font-semibold text-sm mb-1">{level.name}</div>
              <div className="text-xs opacity-75 mb-2">{level.range}</div>
              <div className="font-bold text-lg">{level.days}</div>
              <div className="text-xs opacity-75">days</div>
            </div>
          ))}
        </div>
      </ModernCard>
    </div>
  );
};

export default SpiritualJourneyLevels;
