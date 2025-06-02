
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Flame, Target, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getActivityData, getStreakData } from "@/utils/activityUtils";
import { getTodayCount } from "@/utils/indexedDBUtils";
import ModernCard from "@/components/ModernCard";
import SpiritualJourneyLevels, { getSpiritualLevel } from "@/components/SpiritualJourneyLevels";

interface ActivityData {
  [date: string]: number;
}

interface StreakData {
  currentStreak: number;
  maxStreak: number;
  totalActiveDays: number;
}

const ActiveDaysPage: React.FC = () => {
  const navigate = useNavigate();
  const [activityData, setActivityData] = useState<ActivityData>({});
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    maxStreak: 0,
    totalActiveDays: 0
  });
  const [hoveredDay, setHoveredDay] = useState<{date: string, count: number} | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  useEffect(() => {
    const loadData = async () => {
      try {
        const activity = await getActivityData();
        const streaks = await getStreakData();
        
        setActivityData(activity);
        setStreakData(streaks);
        console.log('Loaded activity data:', { activityCount: Object.keys(activity).length, streaks });
      } catch (error) {
        console.error('Failed to load activity data:', error);
      }
    };
    
    loadData();

    // Refresh data every 5 seconds to catch updates from mantra counter
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Get the earliest activity date to determine journey start
  const getJourneyStartYear = (): number => {
    const activityDates = Object.keys(activityData).filter(date => activityData[date] > 0);
    if (activityDates.length === 0) return new Date().getFullYear();
    
    const earliestDate = activityDates.sort()[0];
    return new Date(earliestDate).getFullYear();
  };

  // Generate year options only if we have past year data
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const journeyStartYear = getJourneyStartYear();
    
    if (journeyStartYear === currentYear) {
      return [currentYear]; // Only current year
    }
    
    const years = [];
    for (let year = journeyStartYear; year <= currentYear; year++) {
      years.push(year);
    }
    return years;
  };

  const yearOptions = generateYearOptions();

  // Generate calendar for selected month and year
  const generateCalendarData = () => {
    const year = selectedYear;
    const month = selectedMonth;
    const currentDate = new Date();
    const isCurrentMonth = year === currentDate.getFullYear() && month === currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const count = activityData[dateStr] || 0;
      const today = new Date().toISOString().split('T')[0];
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
    
    return {
      monthName: new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      days
    };
  };

  const calendarData = generateCalendarData();
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const getActivityLevel = (count: number): string => {
    if (count === 0) return "bg-gray-200/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600";
    return "bg-emerald-200/70 dark:bg-emerald-800/50 border border-emerald-300 dark:border-emerald-600";
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const currentDate = new Date();
    const maxDate = new Date(currentDate.getFullYear(), currentDate.getMonth());
    
    if (direction === 'prev') {
      if (selectedMonth === 0) {
        if (selectedYear > getJourneyStartYear()) {
          setSelectedYear(selectedYear - 1);
          setSelectedMonth(11);
        }
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      const nextMonth = new Date(selectedYear, selectedMonth + 1);
      if (nextMonth <= maxDate) {
        if (selectedMonth === 11) {
          setSelectedYear(selectedYear + 1);
          setSelectedMonth(0);
        } else {
          setSelectedMonth(selectedMonth + 1);
        }
      }
    }
  };

  const canNavigatePrev = () => {
    return selectedYear > getJourneyStartYear() || 
           (selectedYear === getJourneyStartYear() && selectedMonth > 0);
  };

  const canNavigateNext = () => {
    const currentDate = new Date();
    return selectedYear < currentDate.getFullYear() || 
           (selectedYear === currentDate.getFullYear() && selectedMonth < currentDate.getMonth());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800 p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 max-w-6xl mx-auto">
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-100/50 dark:hover:bg-amber-900/20 backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Button>
        <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent text-center">
          Active Days
        </h1>
        <div className="w-28"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-8 lg:mb-12 max-w-6xl mx-auto">
        <ModernCard className="p-6 lg:p-8 bg-gradient-to-br from-orange-400/20 to-red-500/20 border-orange-300/30 dark:border-orange-600/30" gradient>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <Flame className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg lg:text-xl font-semibold text-orange-600 dark:text-orange-400 mb-1">Current Streak</h3>
              <div className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{streakData.currentStreak}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">days in a row</p>
            </div>
          </div>
        </ModernCard>

        <ModernCard className="p-6 lg:p-8 bg-gradient-to-br from-emerald-400/20 to-green-500/20 border-emerald-300/30 dark:border-emerald-600/30" gradient>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg lg:text-xl font-semibold text-emerald-600 dark:text-emerald-400 mb-1">Max Streak</h3>
              <div className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{streakData.maxStreak}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">personal best</p>
            </div>
          </div>
        </ModernCard>

        <ModernCard className="p-6 lg:p-8 bg-gradient-to-br from-purple-400/20 to-indigo-500/20 border-purple-300/30 dark:border-purple-600/30" gradient>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
              <Target className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg lg:text-xl font-semibold text-purple-600 dark:text-purple-400 mb-1">Total Active Days</h3>
              <div className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{streakData.totalActiveDays}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">lifetime practice</p>
            </div>
          </div>
        </ModernCard>
      </div>

      {/* Spiritual Journey Levels */}
      <SpiritualJourneyLevels activityData={activityData} />

      {/* Calendar */}
      <div className="max-w-6xl mx-auto mb-8 lg:mb-12">
        <ModernCard className="p-6 lg:p-8 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl border-amber-200/50 dark:border-amber-700/50" gradient>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 lg:w-7 lg:h-7 text-amber-600 dark:text-amber-400" />
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Activity Calendar</h2>
              </div>
              {yearOptions.length > 1 && (
                <select 
                  value={selectedYear} 
                  onChange={(e) => {
                    const newYear = parseInt(e.target.value);
                    setSelectedYear(newYear);
                    // Reset to January when changing years, or current month if current year
                    setSelectedMonth(newYear === new Date().getFullYear() ? new Date().getMonth() : 0);
                  }}
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth('prev')}
                disabled={!canNavigatePrev()}
                className="text-amber-600 dark:text-amber-400"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {calendarData.monthName}
              </h3>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth('next')}
                disabled={!canNavigateNext()}
                className="text-amber-600 dark:text-amber-400"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your spiritual practice journey {yearOptions.length > 1 ? `starting from ${yearOptions[0]}` : `for ${selectedYear}`}
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
              {calendarData.days.map((dayData, index) => {
                if (!dayData) {
                  return <div key={`empty-${index}`} className="w-12 h-12"></div>;
                }
                
                const spiritualLevel = getSpiritualLevel(dayData.count);
                
                return (
                  <div
                    key={dayData.date}
                    className={`w-12 h-12 rounded-lg cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-amber-400 relative flex flex-col items-center justify-center text-sm ${
                      getActivityLevel(dayData.count)
                    } ${dayData.isToday ? 'ring-2 ring-amber-500 bg-amber-100 dark:bg-amber-900' : ''}`}
                    onMouseEnter={(e) => {
                      setHoveredDay({ date: dayData.date, count: dayData.count });
                      handleMouseMove(e);
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    {dayData.count > 0 && spiritualLevel.icon && (
                      <span className="text-lg filter drop-shadow-sm mb-1">
                        {spiritualLevel.icon}
                      </span>
                    )}
                    <span className={`text-xs font-medium ${
                      dayData.isToday ? 'text-amber-700 dark:text-amber-300' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {dayData.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </ModernCard>
      </div>

      {/* Tooltip */}
      {hoveredDay && (
        <div
          className="fixed z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-amber-200/50 dark:border-amber-700/50 rounded-xl px-4 py-3 text-sm pointer-events-none shadow-xl"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y - 50,
          }}
        >
          <div className="text-gray-900 dark:text-white font-medium mb-1">
            {new Date(hoveredDay.date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
          <div className="text-amber-600 dark:text-amber-400">
            {hoveredDay.count} jaaps completed
          </div>
          <div className="text-gray-500 dark:text-gray-400 text-xs">
            {getSpiritualLevel(hoveredDay.count).name} level
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveDaysPage;
