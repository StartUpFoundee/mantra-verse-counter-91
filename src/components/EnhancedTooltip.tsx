
import React from 'react';
import { getSpiritualLevel } from './SpiritualJourneyLevels';

interface EnhancedTooltipProps {
  date: string;
  jaaps: number;
  mousePosition: { x: number; y: number };
}

const EnhancedTooltip: React.FC<EnhancedTooltipProps> = ({ date, jaaps, mousePosition }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const level = getSpiritualLevel(jaaps);
  
  const tooltipStyle = {
    position: 'fixed' as const,
    left: mousePosition.x + 10,
    top: mousePosition.y - 10,
    zIndex: 1000,
    pointerEvents: 'none' as const,
  };

  return (
    <div 
      style={tooltipStyle}
      className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg border border-gray-700 max-w-xs"
    >
      <div className="font-semibold mb-1">{formatDate(date)}</div>
      <div className="text-gray-300">
        {jaaps > 0 ? (
          <>
            <div>{jaaps} jaaps completed</div>
            <div className="flex items-center gap-1 mt-1">
              <span>{level.icon}</span>
              <span>{level.name} level</span>
            </div>
          </>
        ) : (
          <div>No practice this day</div>
        )}
      </div>
    </div>
  );
};

export default EnhancedTooltip;
