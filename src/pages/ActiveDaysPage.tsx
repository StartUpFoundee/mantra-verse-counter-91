
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Flame, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getActivityData, getStreakData } from "@/utils/activityUtils";
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

  useEffect(() => {
    const loadData = async () => {
      const activity = await getActivityData();
      const streaks = await getStreakData();
      setActivityData(activity);
      setStreakData(streaks);
    };
    loadData();
  }, []);

  const getActivityLevel = (count: number): string => {
    if (count === 0) return "bg-gray-200/50 dark:bg-gray-700/50";
    return "bg-emerald-200/70 dark:bg-emerald-800/50";
  };

  // Get the earliest activity date to determine journey start
  const getJourneyStartYear = (): number => {
    const activityDates = Object.keys(activityData).filter(date => activityData[date] > 0);
    if (activityDates.length === 0) return new Date().getFullYear();
    
    const earliestDate = activityDates.sort()[0];
    return new Date(earliestDate).getFullYear();
  };

  const generateCalendarData = () => {
    const currentYear = new Date().getFullYear();
    const journeyStartYear = getJourneyStartYear();
    
    // Only show past years if journey started before current year
    const shouldShowYear = selectedYear >= journeyStartYear && selectedYear <= currentYear;
    
    if (!shouldShowYear) {
      return [];
    }

    const startDate = new Date(selectedYear, 0, 1); // January 1st of selected year
    const endDate = selectedYear === currentYear ? new Date() : new Date(selectedYear, 11, 31); // Dec 31st or today
    
    const days = [];
    const currentDay = new Date(startDate);
    
    while (currentDay <= endDate) {
      const dateStr = currentDay.toISOString().split('T')[0];
      const count = activityData[dateStr] || 0;
      const isToday = dateStr === new Date().toISOString().split('T')[0];
      
      days.push({
        date: dateStr,
        count,
        isToday,
        dayOfWeek: currentDay.getDay(),
        month: currentDay.getMonth(),
        dayOfMonth: currentDay.getDate(),
        displayDate: new Date(currentDay)
      });
      
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const calendarDays = generateCalendarData();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  // Generate year options based on journey start
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const journeyStartYear = getJourneyStartYear();
    const years = [];
    
    for (let year = journeyStartYear; year <= currentYear; year++) {
      years.push(year);
    }
    
    return years;
  };

  const yearOptions = generateYearOptions();

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

      {/* Calendar Grid */}
      <div className="max-w-6xl mx-auto mb-8 lg:mb-12">
        <ModernCard className="p-6 lg:p-8 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl border-amber-200/50 dark:border-amber-700/50" gradient>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 lg:w-7 lg:h-7 text-amber-600 dark:text-amber-400" />
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Activity Calendar</h2>
              </div>
              {yearOptions.length > 1 && (
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="bg-white dark:bg-zinc-800 border border-amber-200/50 dark:border-amber-700/50 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  {yearOptions.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400">Your spiritual practice journey{yearOptions.length > 1 ? ` starting from ${yearOptions[0]}` : ''}</p>
          </div>

          <div className="space-y-4">
            {/* Weekday Labels */}
            <div className="flex gap-1 lg:gap-2 ml-12 lg:ml-16">
              {weekdays.map((day) => (
                <div key={day} className="w-6 h-6 lg:w-8 lg:h-8 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
                  {day[0]}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="flex gap-1 lg:gap-2 overflow-x-auto pb-4">
              {Array.from({ length: 53 }, (_, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1 lg:gap-2">
                  {/* Month label */}
                  {weekIndex === 0 || (calendarDays[weekIndex * 7] && calendarDays[weekIndex * 7].displayDate.getDate() <= 7) ? (
                    <div className="h-4 lg:h-6 text-xs text-gray-500 dark:text-gray-400 mb-1 lg:mb-2 min-w-[40px] lg:min-w-[60px]">
                      {calendarDays[weekIndex * 7] && months[calendarDays[weekIndex * 7].month]}
                    </div>
                  ) : (
                    <div className="h-4 lg:h-6 mb-1 lg:mb-2"></div>
                  )}
                  
                  {Array.from({ length: 7 }, (_, dayIndex) => {
                    const dayData = calendarDays[weekIndex * 7 + dayIndex];
                    if (!dayData) return <div key={dayIndex} className="w-6 h-6 lg:w-8 lg:h-8"></div>;
                    
                    const spiritualLevel = getSpiritualLevel(dayData.count);
                    
                    return (
                      <div
                        key={dayIndex}
                        className={`w-6 h-6 lg:w-8 lg:h-8 rounded-sm cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-amber-400 relative flex items-center justify-center text-xs lg:text-sm ${
                          getActivityLevel(dayData.count)
                        } ${dayData.isToday ? 'ring-2 ring-amber-500' : ''}`}
                        onMouseEnter={(e) => {
                          setHoveredDay({ date: dayData.date, count: dayData.count });
                          handleMouseMove(e);
                        }}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={() => setHoveredDay(null)}
                      >
                        {dayData.count > 0 && (
                          <span className="filter drop-shadow-sm">
                            {spiritualLevel.icon}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
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
