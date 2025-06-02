
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Flame, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getActivityData, getStreakData } from "@/utils/activityUtils";
import ModernCard from "@/components/ModernCard";
import SpiritualJourneyLevels from "@/components/SpiritualJourneyLevels";
import PracticeCalendar from "@/components/PracticeCalendar";
import EnhancedTooltip from "@/components/EnhancedTooltip";

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

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
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

  const handleYearChange = (newYear: number) => {
    setSelectedYear(newYear);
    // Reset to January when changing years, or current month if current year
    setSelectedMonth(newYear === new Date().getFullYear() ? new Date().getMonth() : 0);
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

      {/* Practice Calendar */}
      <div className="max-w-6xl mx-auto mb-8 lg:mb-12">
        <PracticeCalendar
          activityData={activityData}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onNavigateMonth={navigateMonth}
          onYearChange={handleYearChange}
          yearOptions={yearOptions}
          hoveredDay={hoveredDay}
          setHoveredDay={setHoveredDay}
          onMouseMove={handleMouseMove}
        />
      </div>

      {/* Enhanced Tooltip */}
      {hoveredDay && (
        <EnhancedTooltip
          date={hoveredDay.date}
          count={hoveredDay.count}
          position={mousePosition}
        />
      )}
    </div>
  );
};

export default ActiveDaysPage;
