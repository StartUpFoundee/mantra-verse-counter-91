
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getSpiritualLevel } from './SpiritualJourneyLevels';
import ModernCard from './ModernCard';

interface PracticeCalendarProps {
  activityData: {[date: string]: number};
  selectedYear: number;
  selectedMonth: number;
  onNavigateMonth: (direction: 'prev' | 'next') => void;
  onYearChange: (year: number) => void;
  yearOptions: number[];
  hoveredDay: {date: string, count: number} | null;
  setHoveredDay: (day: {date: string, count: number} | null) => void;
  onMouseMove: (e: React.MouseEvent) => void;
}

const categoryColors = {
  Rogi: "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
  Bhogi: "bg-orange-100 dark:bg-orange-900/40 border-orange-200 dark:border-orange-800",
  Yogi: "bg-blue-100 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800", 
  Sadhak: "bg-teal-100 dark:bg-teal-900/40 border-teal-200 dark:border-teal-800",
  Tapasvi: "bg-red-100 dark:bg-red-900/40 border-red-200 dark:border-red-800",
  Rishi: "bg-purple-100 dark:bg-purple-900/40 border-purple-200 dark:border-purple-800",
  Jivanmukta: "bg-yellow-100 dark:bg-yellow-900/40 border-yellow-200 dark:border-yellow-800"
};

const intensityLevels = {
  0: "opacity-30",
  1: "opacity-50", 
  2: "opacity-70",
  3: "opacity-90",
  4: "opacity-100"
};

const getIntensityLevel = (count: number, maxCount: number): number => {
  if (count === 0) return 0;
  if (maxCount === 0) return 1;
  
  const ratio = count / maxCount;
  if (ratio <= 0.2) return 1;
  if (ratio <= 0.4) return 2;
  if (ratio <= 0.6) return 3;
  return 4;
};

const PracticeCalendar: React.FC<PracticeCalendarProps> = ({
  activityData,
  selectedYear,
  selectedMonth,
  onNavigateMonth,
  onYearChange,
  yearOptions,
  hoveredDay,
  setHoveredDay,
  onMouseMove
}) => {
  const currentDate = new Date();
  const today = currentDate.toISOString().split('T')[0];
  const isCurrentMonth = selectedYear === currentDate.getFullYear() && selectedMonth === currentDate.getMonth();
  
  // Calculate max count for intensity scaling
  const maxCount = Math.max(...Object.values(activityData));
  
  // Generate calendar data
  const firstDay = new Date(selectedYear, selectedMonth, 1);
  const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  const monthName = firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const days = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(selectedYear, selectedMonth, day);
    const dateStr = date.toISOString().split('T')[0];
    const count = activityData[dateStr] || 0;
    const isToday = dateStr === today;
    
    // Don't show future dates in current month
    if (isCurrentMonth && day > currentDate.getDate()) {
      break;
    }
    
    days.push({
      date: dateStr,
      count,
      isToday,
      day
    });
  }

  const canNavigatePrev = () => {
    const earliestYear = Math.min(...yearOptions);
    return selectedYear > earliestYear || 
           (selectedYear === earliestYear && selectedMonth > 0);
  };

  const canNavigateNext = () => {
    return selectedYear < currentDate.getFullYear() || 
           (selectedYear === currentDate.getFullYear() && selectedMonth < currentDate.getMonth());
  };

  return (
    <ModernCard className="p-6 lg:p-8 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl border-amber-200/50 dark:border-amber-700/50" gradient>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📅</span>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Practice Calendar</h2>
          </div>
          {yearOptions.length > 1 && (
            <select 
              value={selectedYear} 
              onChange={(e) => onYearChange(parseInt(e.target.value))}
              className="bg-white dark:bg-zinc-800 border border-amber-200/50 dark:border-amber-700/50 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          )}
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => onNavigateMonth('prev')}
            disabled={!canNavigatePrev()}
            className="flex items-center gap-2 px-3 py-2 text-amber-600 dark:text-amber-400 hover:bg-amber-100/50 dark:hover:bg-amber-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {monthName}
          </h3>
          
          <button
            onClick={() => onNavigateMonth('next')}
            disabled={!canNavigateNext()}
            className="flex items-center gap-2 px-3 py-2 text-amber-600 dark:text-amber-400 hover:bg-amber-100/50 dark:hover:bg-amber-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Your spiritual practice journey visualization
        </p>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white/50 dark:bg-zinc-900/50 rounded-lg p-6">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekdays.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((dayData, index) => {
            if (!dayData) {
              return <div key={`empty-${index}`} className="w-12 h-12"></div>;
            }
            
            const spiritualLevel = getSpiritualLevel(dayData.count);
            const intensityLevel = getIntensityLevel(dayData.count, maxCount);
            const colorClass = categoryColors[spiritualLevel.name as keyof typeof categoryColors];
            const intensityClass = intensityLevels[intensityLevel as keyof typeof intensityLevels];
            
            return (
              <div
                key={dayData.date}
                className={`
                  w-12 h-12 rounded-lg cursor-pointer transition-all duration-200 
                  hover:ring-2 hover:ring-amber-400 hover:scale-110
                  relative flex flex-col items-center justify-center text-sm border-2
                  ${colorClass} ${intensityClass}
                  ${dayData.isToday ? 'ring-2 ring-amber-500 shadow-lg' : ''}
                  ${dayData.count > 0 ? 'shadow-sm' : ''}
                `}
                onMouseEnter={(e) => {
                  setHoveredDay({ date: dayData.date, count: dayData.count });
                  onMouseMove(e);
                }}
                onMouseMove={onMouseMove}
                onMouseLeave={() => setHoveredDay(null)}
              >
                {/* Practice icon */}
                {dayData.count > 0 && spiritualLevel.icon && (
                  <div className="text-xs mb-0.5 filter drop-shadow-sm">
                    {spiritualLevel.icon}
                  </div>
                )}
                
                {/* Date number */}
                <span className={`
                  text-xs font-medium
                  ${dayData.isToday 
                    ? 'text-amber-700 dark:text-amber-300 font-bold' 
                    : dayData.count > 0 
                      ? 'text-gray-700 dark:text-gray-200' 
                      : 'text-gray-500 dark:text-gray-400'
                  }
                `}>
                  {dayData.day}
                </span>
                
                {/* Streak indicator */}
                {dayData.count > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-full opacity-80"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Practice intensity</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Less</span>
            {[0, 1, 2, 3, 4].map(level => (
              <div
                key={level}
                className={`
                  w-3 h-3 rounded-sm border
                  ${level === 0 
                    ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700' 
                    : 'bg-teal-100 dark:bg-teal-900/40 border-teal-200 dark:border-teal-800'
                  }
                  ${intensityLevels[level as keyof typeof intensityLevels]}
                `}
              />
            ))}
            <span className="text-xs text-gray-500 dark:text-gray-400">More</span>
          </div>
        </div>
      </div>
    </ModernCard>
  );
};

export default PracticeCalendar;
