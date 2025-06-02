
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Flame, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getActivityData, getStreakData } from "@/utils/activityUtils";
import { getTodayCount } from "@/utils/indexedDBUtils";
import ModernCard from "@/components/ModernCard";
import SpiritualJourneyLevels, { getSpiritualLevel } from "@/components/SpiritualJourneyLevels";
import LeetCodeStyleCalendar from "@/components/LeetCodeStyleCalendar";

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
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const loadData = async () => {
      const activity = await getActivityData();
      const streaks = await getStreakData();
      
      const todayCount = await getTodayCount();
      const today = new Date().toISOString().split('T')[0];
      
      const updatedActivity = { ...activity };
      if (todayCount > 0) {
        updatedActivity[today] = todayCount;
      }
      
      setActivityData(updatedActivity);
      setStreakData(streaks);
    };
    loadData();

    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const getJourneyStartYear = (): number => {
    const activityDates = Object.keys(activityData).filter(date => activityData[date] > 0);
    if (activityDates.length === 0) return new Date().getFullYear();
    
    const earliestDate = activityDates.sort()[0];
    return new Date(earliestDate + 'T00:00:00').getFullYear();
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const journeyStartYear = getJourneyStartYear();
    
    if (journeyStartYear === currentYear) {
      return [currentYear];
    }
    
    const years = [];
    for (let year = journeyStartYear; year <= currentYear; year++) {
      years.push(year);
    }
    return years;
  };

  const yearOptions = generateYearOptions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800 p-2 sm:p-4 lg:p-8">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 max-w-6xl mx-auto">
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-100/50 dark:hover:bg-amber-900/20 backdrop-blur-sm p-2"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent text-center">
          Active Days
        </h1>
        <div className="w-16 sm:w-20"></div>
      </div>

      {/* Single Line Stats */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6 max-w-6xl mx-auto">
        <ModernCard className="flex-1 p-3 sm:p-4 bg-gradient-to-br from-orange-400/20 to-red-500/20 border-orange-300/30 dark:border-orange-600/30" gradient>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-md">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-semibold text-orange-600 dark:text-orange-400">Current</h3>
              <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{streakData.currentStreak}</div>
            </div>
          </div>
        </ModernCard>

        <ModernCard className="flex-1 p-3 sm:p-4 bg-gradient-to-br from-emerald-400/20 to-green-500/20 border-emerald-300/30 dark:border-emerald-600/30" gradient>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg flex items-center justify-center shadow-md">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-semibold text-emerald-600 dark:text-emerald-400">Max Streak</h3>
              <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{streakData.maxStreak}</div>
            </div>
          </div>
        </ModernCard>

        <ModernCard className="flex-1 p-3 sm:p-4 bg-gradient-to-br from-purple-400/20 to-indigo-500/20 border-purple-300/30 dark:border-purple-600/30" gradient>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-md">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-semibold text-purple-600 dark:text-purple-400">Total Days</h3>
              <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{streakData.totalActiveDays}</div>
            </div>
          </div>
        </ModernCard>
      </div>

      {/* Compact Spiritual Journey Levels */}
      <div className="max-w-6xl mx-auto mb-4 sm:mb-6">
        <ModernCard className="p-3 sm:p-4 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl border-amber-200/50 dark:border-amber-700/50" gradient>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 flex items-center gap-2">
            <span className="text-lg sm:text-xl">🏆</span>
            Achievement Levels
          </h2>
          <SpiritualJourneyLevels activityData={activityData} />
        </ModernCard>
      </div>

      {/* Horizontal Scrolling Calendar */}
      <div className="max-w-6xl mx-auto">
        <ModernCard className="p-3 sm:p-4 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl border-amber-200/50 dark:border-amber-700/50" gradient>
          <LeetCodeStyleCalendar
            activityData={activityData}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            yearOptions={yearOptions}
          />
        </ModernCard>
      </div>
    </div>
  );
};

export default ActiveDaysPage;
