
import React from 'react';
import { getSpiritualLevel } from './SpiritualJourneyLevels';

interface EnhancedTooltipProps {
  date: string;
  count: number;
  position: { x: number; y: number };
}

const EnhancedTooltip: React.FC<EnhancedTooltipProps> = ({ date, count, position }) => {
  const spiritualLevel = getSpiritualLevel(count);
  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const getMotivationalMessage = (level: string, count: number) => {
    if (count === 0) return "A day of rest in your spiritual journey";
    
    const messages = {
      Bhogi: "Sweet beginning! Every journey starts with one step 🍯",
      Yogi: "Balanced practice! You're finding your rhythm 🧘‍♂️",
      Sadhak: "Dedicated seeker! Your commitment is growing 🕉️",
      Tapasvi: "Intense practice! Your devotion burns bright 🔥",
      Rishi: "Wise practitioner! You're touching deeper realms 🔱",
      Jivanmukta: "Liberated soul! Your practice inspires others 🪷"
    };
    
    return messages[level as keyof typeof messages] || "Keep practicing!";
  };

  return (
    <div
      className="fixed z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-amber-200/50 dark:border-amber-700/50 rounded-xl px-4 py-3 text-sm pointer-events-none shadow-xl max-w-xs"
      style={{
        left: position.x + 10,
        top: position.y - 120,
      }}
    >
      {/* Date */}
      <div className="text-gray-900 dark:text-white font-semibold mb-2">
        {formattedDate}
      </div>
      
      {/* Practice summary */}
      <div className="flex items-center gap-2 mb-2">
        {spiritualLevel.icon && (
          <span className="text-lg">{spiritualLevel.icon}</span>
        )}
        <div>
          <div className="text-amber-600 dark:text-amber-400 font-medium">
            {count} jaaps completed
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {spiritualLevel.name} level ({spiritualLevel.range})
          </div>
        </div>
      </div>
      
      {/* Motivational message */}
      <div className="text-xs text-gray-600 dark:text-gray-300 italic border-t border-gray-200 dark:border-gray-700 pt-2">
        {getMotivationalMessage(spiritualLevel.name, count)}
      </div>
      
      {/* Achievement indicator */}
      {count > 0 && (
        <div className="mt-2 flex items-center gap-1">
          <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-full"></div>
          <span className="text-xs text-gray-500 dark:text-gray-400">Active practice day</span>
        </div>
      )}
    </div>
  );
};

export default EnhancedTooltip;
