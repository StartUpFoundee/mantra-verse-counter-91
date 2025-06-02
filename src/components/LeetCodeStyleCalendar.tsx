
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getSpiritualLevel } from './SpiritualJourneyLevels';
import EnhancedTooltip from './EnhancedTooltip';

interface ActivityData {
  [date: string]: number;
}

interface LeetCodeStyleCalendarProps {
  activityData: ActivityData;
  selectedYear: number;
  onYearChange: (year: number) => void;
  yearOptions: number[];
}

const LeetCodeStyleCalendar: React.FC<LeetCodeStyleCalendarProps> = ({
  activityData,
  selectedYear,
  onYearChange,
  yearOptions
}) => {
  const [hoveredDay, setHoveredDay] = useState<{date: string, count: number} | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  // Generate weeks for the year in GitHub style
  const generateYearData = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // Start from the first Sunday of the year or the previous year
    const yearStart = new Date(selectedYear, 0, 1);
    const startDate = new Date(yearStart);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Go to previous Sunday
    
    // End date - if current year, stop at today, otherwise end of year
    const yearEnd = selectedYear === currentYear 
      ? currentDate 
      : new Date(selectedYear, 11, 31);
    
    const weeks = [];
    const currentWeekDate = new Date(startDate);
    
    while (currentWeekDate <= yearEnd || weeks.length < 53) {
      const week = [];
      
      for (let day = 0; day < 7; day++) {
        const dateStr = currentWeekDate.toISOString().split('T')[0];
        const count = activityData[dateStr] || 0;
        const isCurrentYear = currentWeekDate.getFullYear() === selectedYear;
        const isToday = dateStr === new Date().toISOString().split('T')[0];
        const isFutureDate = currentWeekDate > currentDate;
        
        week.push({
          date: dateStr,
          count,
          day: currentWeekDate.getDate(),
          month: currentWeekDate.getMonth(),
          isCurrentYear,
          isToday,
          isFutureDate,
          dayOfWeek: currentWeekDate.getDay()
        });
        
        currentWeekDate.setDate(currentWeekDate.getDate() + 1);
      }
      
      weeks.push(week);
      
      // Break if we've covered the whole year and have enough weeks
      if (currentWeekDate.getFullYear() > selectedYear && weeks.length >= 52) {
        break;
      }
    }
    
    return weeks;
  };

  const weeks = generateYearData();
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const getIconForCount = (count: number): string => {
    if (count === 0) return '';
    const level = getSpiritualLevel(count);
    return level.icon || '🔥';
  };

  const getCellStyle = (dayData: any): string => {
    const baseStyle = "w-3 h-3 rounded-sm border border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs cursor-pointer transition-all duration-200 hover:ring-1 hover:ring-amber-400";
    
    if (dayData.isFutureDate) {
      return `${baseStyle} bg-gray-100/50 dark:bg-gray-800/50`;
    }
    
    if (!dayData.isCurrentYear) {
      return `${baseStyle} bg-gray-200/30 dark:bg-gray-700/30`;
    }
    
    if (dayData.count === 0) {
      return `${baseStyle} bg-gray-200/50 dark:bg-gray-700/50`;
    }
    
    // Active day styling
    const activeStyle = `${baseStyle} bg-emerald-200/70 dark:bg-emerald-800/50 border-emerald-300 dark:border-emerald-600`;
    
    if (dayData.isToday) {
      return `${activeStyle} ring-2 ring-amber-500 bg-amber-100 dark:bg-amber-900`;
    }
    
    return activeStyle;
  };

  return (
    <div className="practice-calendar w-full">
      {/* Header with year navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Practice Activity
          </h3>
          {yearOptions.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const currentIndex = yearOptions.indexOf(selectedYear);
                  if (currentIndex > 0) {
                    onYearChange(yearOptions[currentIndex - 1]);
                  }
                }}
                disabled={yearOptions.indexOf(selectedYear) === 0}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <select 
                value={selectedYear} 
                onChange={(e) => onYearChange(parseInt(e.target.value))}
                className="bg-white dark:bg-zinc-800 border border-amber-200/50 dark:border-amber-700/50 rounded px-3 py-1 text-sm font-medium text-gray-900 dark:text-white"
              >
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              
              <button
                onClick={() => {
                  const currentIndex = yearOptions.indexOf(selectedYear);
                  if (currentIndex < yearOptions.length - 1) {
                    onYearChange(yearOptions[currentIndex + 1]);
                  }
                }}
                disabled={yearOptions.indexOf(selectedYear) === yearOptions.length - 1}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* GitHub-style calendar grid */}
      <div className="bg-white/50 dark:bg-zinc-900/50 rounded-lg p-4 overflow-x-auto">
        <div className="flex gap-1 min-w-fit">
          {/* Month labels column */}
          <div className="flex flex-col">
            <div className="h-4 mb-1"></div> {/* Space for day labels */}
            {dayLabels.map((day, index) => (
              <div key={day} className="h-3 mb-1 flex items-center text-xs text-gray-500 dark:text-gray-400 w-4">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar weeks */}
          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col">
                {/* Month label for first week of each month */}
                <div className="h-4 mb-1 text-xs text-gray-500 dark:text-gray-400 text-center">
                  {week[0] && week[0].day <= 7 && week[0].isCurrentYear ? 
                    monthLabels[week[0].month] : ''
                  }
                </div>
                
                {/* Week days */}
                {week.map((dayData, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`${getCellStyle(dayData)} mb-1`}
                    onMouseEnter={(e) => {
                      if (dayData.isCurrentYear && !dayData.isFutureDate) {
                        setHoveredDay({ date: dayData.date, count: dayData.count });
                        handleMouseMove(e);
                      }
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    {dayData.count > 0 && (
                      <span className="filter drop-shadow-sm text-[8px]">
                        {getIconForCount(dayData.count)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-4 text-xs text-gray-500 dark:text-gray-400">
          <span>Learn how we count practice levels</span>
          <div className="flex items-center gap-2">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-gray-200/50 dark:bg-gray-700/50 rounded-sm border border-gray-300 dark:border-gray-600"></div>
              <div className="w-3 h-3 bg-emerald-200/70 dark:bg-emerald-800/50 border border-emerald-300 dark:border-emerald-600 rounded-sm flex items-center justify-center text-[8px]">🔥</div>
              <div className="w-3 h-3 bg-emerald-200/70 dark:bg-emerald-800/50 border border-emerald-300 dark:border-emerald-600 rounded-sm flex items-center justify-center text-[8px]">🧘</div>
              <div className="w-3 h-3 bg-emerald-200/70 dark:bg-emerald-800/50 border border-emerald-300 dark:border-emerald-600 rounded-sm flex items-center justify-center text-[8px]">🕉️</div>
              <div className="w-3 h-3 bg-emerald-200/70 dark:bg-emerald-800/50 border border-emerald-300 dark:border-emerald-600 rounded-sm flex items-center justify-center text-[8px]">🪷</div>
            </div>
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredDay && (
        <EnhancedTooltip
          date={hoveredDay.date}
          jaaps={hoveredDay.count}
          mousePosition={mousePosition}
        />
      )}
    </div>
  );
};

export default LeetCodeStyleCalendar;
