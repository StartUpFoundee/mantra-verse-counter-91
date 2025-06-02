
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getCategoryByJaaps } from '@/utils/activityUtils';
import ModernCard from './ModernCard';

interface LeetCodeCalendarProps {
  activityData: {[date: string]: number};
  selectedYear: number;
  onYearChange: (year: number) => void;
  yearOptions: number[];
  hoveredDay: {date: string, count: number} | null;
  setHoveredDay: (day: {date: string, count: number} | null) => void;
  onMouseMove: (e: React.MouseEvent) => void;
}

const LeetCodeStyleCalendar: React.FC<LeetCodeCalendarProps> = ({
  activityData,
  selectedYear,
  onYearChange,
  yearOptions,
  hoveredDay,
  setHoveredDay,
  onMouseMove
}) => {
  const currentDate = new Date();
  const today = currentDate.toISOString().split('T')[0];
  
  // Generate months for the year
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  const getDaysInMonth = (monthIndex: number, year: number) => {
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const days = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, monthIndex, day);
      const dateStr = date.toISOString().split('T')[0];
      
      // Don't show future dates
      if (date > currentDate) break;
      
      const count = activityData[dateStr] || 0;
      const category = getCategoryByJaaps(count);
      const isToday = dateStr === today;
      
      days.push({
        date: dateStr,
        day,
        count,
        category,
        isToday
      });
    }
    
    return days;
  };

  const canNavigatePrev = () => {
    const earliestYear = Math.min(...yearOptions);
    return selectedYear > earliestYear;
  };

  const canNavigateNext = () => {
    return selectedYear < currentDate.getFullYear();
  };

  const navigateYear = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && canNavigatePrev()) {
      onYearChange(selectedYear - 1);
    } else if (direction === 'next' && canNavigateNext()) {
      onYearChange(selectedYear + 1);
    }
  };

  return (
    <ModernCard className="p-6 lg:p-8 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl border-amber-200/50 dark:border-amber-700/50" gradient>
      {/* Header with year navigation */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📅</span>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Practice Calendar</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateYear('prev')}
              disabled={!canNavigatePrev()}
              className="flex items-center gap-1 px-3 py-2 text-amber-600 dark:text-amber-400 hover:bg-amber-100/50 dark:hover:bg-amber-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <select 
              value={selectedYear} 
              onChange={(e) => onYearChange(parseInt(e.target.value))}
              className="bg-white dark:bg-zinc-800 border border-amber-200/50 dark:border-amber-700/50 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 dark:text-white min-w-[80px]"
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            
            <button
              onClick={() => navigateYear('next')}
              disabled={!canNavigateNext()}
              className="flex items-center gap-1 px-3 py-2 text-amber-600 dark:text-amber-400 hover:bg-amber-100/50 dark:hover:bg-amber-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400">
          Your spiritual practice journey for {selectedYear}
        </p>
      </div>

      {/* LeetCode-style calendar grid */}
      <div className="bg-white/50 dark:bg-zinc-900/50 rounded-lg p-6">
        <div className="overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {months.map((month, monthIndex) => {
              const days = getDaysInMonth(monthIndex, selectedYear);
              
              return (
                <div key={month} className="flex flex-col items-center">
                  {/* Month label */}
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 h-4">
                    {month}
                  </div>
                  
                  {/* Days column */}
                  <div className="flex flex-col gap-1">
                    {days.map((dayData) => (
                      <div
                        key={dayData.date}
                        className={`
                          w-3 h-3 rounded-sm cursor-pointer transition-all duration-200 
                          hover:ring-2 hover:ring-amber-400 hover:scale-125
                          relative flex items-center justify-center
                          ${dayData.isToday ? 'ring-2 ring-amber-500' : ''}
                          ${dayData.count > 0 ? 'bg-white dark:bg-zinc-800 border border-gray-300 dark:border-gray-600' : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'}
                        `}
                        onMouseEnter={(e) => {
                          setHoveredDay({ date: dayData.date, count: dayData.count });
                          onMouseMove(e);
                        }}
                        onMouseMove={onMouseMove}
                        onMouseLeave={() => setHoveredDay(null)}
                        title={`${dayData.date}: ${dayData.count} jaaps`}
                      >
                        {/* Icon indicator */}
                        {dayData.count > 0 && (
                          <span className="text-[6px] select-none">
                            {dayData.category.icon}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Practice intensity</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Less</span>
            <div className="flex items-center gap-1">
              <span className="text-xs">⚪</span>
              <span className="text-xs">🔥</span>
              <span className="text-xs">🧘</span>
              <span className="text-xs">🕉️</span>
              <span className="text-xs">🔱</span>
              <span className="text-xs">🪷</span>
              <span className="text-xs">💫</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">More</span>
          </div>
        </div>
        
        {/* Achievement categories legend */}
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <span>⚪</span>
            <span className="text-gray-600 dark:text-gray-400">Rogi (0)</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🔥</span>
            <span className="text-gray-600 dark:text-gray-400">Bhogi (1-108)</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🧘</span>
            <span className="text-gray-600 dark:text-gray-400">Yogi (109-500)</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🕉️</span>
            <span className="text-gray-600 dark:text-gray-400">Sadhak (501-1000)</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🔱</span>
            <span className="text-gray-600 dark:text-gray-400">Tapasvi (1001-1500)</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🪷</span>
            <span className="text-gray-600 dark:text-gray-400">Rishi (1501-2100)</span>
          </div>
          <div className="flex items-center gap-1">
            <span>💫</span>
            <span className="text-gray-600 dark:text-gray-400">Jivanmukta (2100+)</span>
          </div>
        </div>
      </div>
    </ModernCard>
  );
};

export default LeetCodeStyleCalendar;
