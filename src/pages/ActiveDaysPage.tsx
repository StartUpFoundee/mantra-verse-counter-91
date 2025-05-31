
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Flame, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getActivityData, getStreakData, DailyActivity, StreakData, getCategoryByCount, recordDailyActivity } from "@/utils/activityUtils";
import { getTodayCount, getLifetimeCount } from "@/utils/indexedDBUtils";
import ModernCard from "@/components/ModernCard";
import CategoryDisplay from "@/components/CategoryDisplay";

const ActiveDaysPage: React.FC = () => {
  const navigate = useNavigate();
  const [activityData, setActivityData] = useState<{[date: string]: DailyActivity}>({});
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    maxStreak: 0,
    totalActiveDays: 0,
    currentCategory: 'beginner',
    highestCategory: 'beginner',
    categoryDistribution: {}
  });
  const [hoveredDay, setHoveredDay] = useState<{date: string, activity: DailyActivity} | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const loadData = async () => {
      // First sync today's data to activity tracking
      const todayCount = await getTodayCount();
      if (todayCount > 0) {
        await recordDailyActivity(0); // This will update the activity with current count
      }
      
      const activity = await getActivityData();
      const streaks = await getStreakData();
      setActivityData(activity);
      setStreakData(streaks);
    };
    loadData();
  }, []);

  const generateCalendarData = () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364);
    
    const days = [];
    const currentDay = new Date(startDate);
    
    while (currentDay <= today) {
      const dateStr = currentDay.toISOString().split('T')[0];
      const activity = activityData[dateStr];
      const count = activity?.count || 0;
      const isToday = dateStr === today.toISOString().split('T')[0];
      
      days.push({
        date: dateStr,
        activity: activity || { date: dateStr, count: 0, timestamp: 0 },
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800 p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 max-w-6xl mx-auto">
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-100/50 dark:hover:bg-amber-900/20 backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Button>
        <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent text-center">
          Active Days & Achievements
        </h1>
        <div className="w-28"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6 max-w-6xl mx-auto">
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

      {/* Compact Category Display */}
      <div className="max-w-6xl mx-auto mb-6">
        <CategoryDisplay 
          currentCategory={streakData.currentCategory}
          highestCategory={streakData.highestCategory}
          categoryDistribution={streakData.categoryDistribution}
        />
      </div>

      {/* Calendar Grid */}
      <div className="max-w-6xl mx-auto">
        <ModernCard className="p-6 lg:p-8 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl border-amber-200/50 dark:border-amber-700/50" gradient>
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-6 h-6 lg:w-7 lg:h-7 text-amber-600 dark:text-amber-400" />
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Activity Calendar</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Your spiritual practice journey with achievement icons</p>
          </div>

          <div className="space-y-4">
            {/* Weekday Labels */}
            <div className="flex gap-1 lg:gap-2 ml-12 lg:ml-16">
              {weekdays.map((day) => (
                <div key={day} className="w-5 h-5 lg:w-6 lg:h-6 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
                  {day[0]}
                </div>
              ))}
            </div>

            {/* Calendar Grid with Icons */}
            <div className="flex gap-1 lg:gap-2 overflow-x-auto pb-4">
              {Array.from({ length: 53 }, (_, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1 lg:gap-2">
                  {/* Month label */}
                  {weekIndex === 0 || (calendarDays[weekIndex * 7] && calendarDays[weekIndex * 7].displayDate.getDate() <= 7) ? (
                    <div className="h-4 lg:h-6 text-xs text-gray-500 dark:text-gray-400 mb-1 lg:mb-2 min-w-[50px] lg:min-w-[70px]">
                      {calendarDays[weekIndex * 7] && months[calendarDays[weekIndex * 7].month]}
                    </div>
                  ) : (
                    <div className="h-4 lg:h-6 mb-1 lg:mb-2"></div>
                  )}
                  
                  {Array.from({ length: 7 }, (_, dayIndex) => {
                    const dayData = calendarDays[weekIndex * 7 + dayIndex];
                    if (!dayData) return <div key={dayIndex} className="w-5 h-5 lg:w-6 lg:h-6"></div>;
                    
                    const category = dayData.activity.count > 0 ? getCategoryByCount(dayData.activity.count) : null;
                    
                    return (
                      <div
                        key={dayIndex}
                        className={`w-5 h-5 lg:w-6 lg:h-6 rounded-md cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-amber-400 relative flex items-center justify-center text-sm lg:text-base ${
                          dayData.activity.count > 0 
                            ? 'bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-800 dark:to-green-800 border border-emerald-300 dark:border-emerald-600' 
                            : 'bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                        } ${dayData.isToday ? 'ring-2 ring-amber-500' : ''}`}
                        onMouseEnter={(e) => {
                          setHoveredDay({ date: dayData.date, activity: dayData.activity });
                          handleMouseMove(e);
                        }}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={() => setHoveredDay(null)}
                      >
                        {category && dayData.activity.count > 0 ? (
                          <span className="text-xs lg:text-sm">{category.icon}</span>
                        ) : dayData.isToday ? (
                          <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Updated Legend with Icons */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3 text-xs lg:text-sm text-gray-500 dark:text-gray-400 justify-center">
                <span className="font-medium">Activity Levels:</span>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-sm border"></div>
                  <span>No Activity</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-emerald-100 dark:bg-emerald-800 rounded-sm border border-emerald-300 flex items-center justify-center text-xs">🌱</div>
                  <span>Seeker (1-108)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-emerald-100 dark:bg-emerald-800 rounded-sm border border-emerald-300 flex items-center justify-center text-xs">🪷</div>
                  <span>Devoted (109-500)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-emerald-100 dark:bg-emerald-800 rounded-sm border border-emerald-300 flex items-center justify-center text-xs">🕉️</div>
                  <span>Committed (501-1000)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-emerald-100 dark:bg-emerald-800 rounded-sm border border-emerald-300 flex items-center justify-center text-xs">✨</div>
                  <span>Enlightened (1001-1500)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-emerald-100 dark:bg-emerald-800 rounded-sm border border-emerald-300 flex items-center justify-center text-xs">🔥</div>
                  <span>Sage (1501-2100)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-emerald-100 dark:bg-emerald-800 rounded-sm border border-emerald-300 flex items-center justify-center text-xs">🧘‍♂️</div>
                  <span>Transcendent (2100+)</span>
                </div>
              </div>
            </div>
          </div>
        </ModernCard>
      </div>

      {/* Enhanced Tooltip */}
      {hoveredDay && (
        <div
          className="fixed z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-amber-200/50 dark:border-amber-700/50 rounded-xl px-4 py-3 text-sm pointer-events-none shadow-xl max-w-xs"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y - 70,
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
          <div className="text-amber-600 dark:text-amber-400 mb-1">
            {hoveredDay.activity.count} mantras completed
          </div>
          {hoveredDay.activity.count > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-lg">{hoveredDay.activity.icon}</span>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {getCategoryByCount(hoveredDay.activity.count).name} Level
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActiveDaysPage;
