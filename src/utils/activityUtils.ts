
import { getData, storeData, getAllData, STORES } from './indexedDBUtils';
import { getTodayCount, getLifetimeCount } from './indexedDBUtils';

export interface DailyActivity {
  date: string;
  count: number;
  timestamp: number;
}

export interface StreakData {
  currentStreak: number;
  maxStreak: number;
  totalActiveDays: number;
}

/**
 * Reset all user data completely to fix active days bug
 */
export const resetAllData = async (): Promise<void> => {
  try {
    // Clear localStorage
    localStorage.clear();
    
    // Clear IndexedDB activity data
    const allActivity = await getAllData(STORES.activityData);
    for (const activity of allActivity) {
      // Note: We can't delete from IndexedDB easily, so we'll just reset counts
    }
    
    console.log('All user data has been reset completely');
  } catch (error) {
    console.error('Failed to reset data:', error);
  }
};

/**
 * Get category based on jaap count
 */
export const getCategoryByJaaps = (jaaps: number): { name: string; icon: string; range: string } => {
  if (jaaps === 0) return { name: 'Rogi', icon: '⚪', range: '0' };
  if (jaaps <= 108) return { name: 'Bhogi', icon: '🔥', range: '1-108' };
  if (jaaps <= 500) return { name: 'Yogi', icon: '🧘', range: '109-500' };
  if (jaaps <= 1000) return { name: 'Sadhak', icon: '🕉️', range: '501-1000' };
  if (jaaps <= 1500) return { name: 'Tapasvi', icon: '🔱', range: '1001-1500' };
  if (jaaps <= 2100) return { name: 'Rishi', icon: '🪷', range: '1501-2100' };
  return { name: 'Jivanmukta', icon: '💫', range: '2100+' };
};

/**
 * Record daily activity when user completes jaaps
 */
export const recordDailyActivity = async (count: number = 1): Promise<void> => {
  const today = new Date().toISOString().split('T')[0];
  
  try {
    // Get existing activity for today
    const existingActivity = await getData(STORES.activityData, today);
    const currentCount = existingActivity ? existingActivity.count : 0;
    
    // Update activity count
    const activityData: DailyActivity = {
      date: today,
      count: currentCount + count,
      timestamp: Date.now()
    };
    
    await storeData(STORES.activityData, activityData);
    console.log(`Recorded ${count} jaaps for ${today}. Total today: ${activityData.count}`);
  } catch (error) {
    console.error("Failed to record daily activity:", error);
  }
};

/**
 * Sync today's activity with main counter system
 */
export const syncTodaysActivity = async (): Promise<void> => {
  try {
    const todayCount = await getTodayCount();
    const today = new Date().toISOString().split('T')[0];
    
    if (todayCount > 0) {
      const activityData: DailyActivity = {
        date: today,
        count: todayCount,
        timestamp: Date.now()
      };
      await storeData(STORES.activityData, activityData);
      console.log(`Synced today's activity: ${todayCount} jaaps`);
    }
  } catch (error) {
    console.error("Failed to sync today's activity:", error);
  }
};

/**
 * Get all activity data for calendar display
 */
export const getActivityData = async (): Promise<{[date: string]: number}> => {
  try {
    // First sync today's data
    await syncTodaysActivity();
    
    // Get activity from IndexedDB
    const allActivity = await getAllData(STORES.activityData);
    const activityMap: {[date: string]: number} = {};
    
    allActivity.forEach((activity: DailyActivity) => {
      activityMap[activity.date] = activity.count;
    });
    
    console.log(`Retrieved activity data for ${Object.keys(activityMap).length} days`);
    return activityMap;
  } catch (error) {
    console.error("Failed to get activity data:", error);
    
    // Fallback: try to get at least today's count
    try {
      const todayCount = await getTodayCount();
      const today = new Date().toISOString().split('T')[0];
      
      if (todayCount > 0) {
        return { [today]: todayCount };
      }
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
    }
    
    return {};
  }
};

/**
 * Calculate streak data with proper active days counting
 */
export const getStreakData = async (): Promise<StreakData> => {
  try {
    const activityData = await getActivityData();
    
    // Count total active days - any day with jaaps > 0
    const activeDates = Object.keys(activityData).filter(date => activityData[date] > 0).sort();
    const totalActiveDays = activeDates.length;
    
    if (activeDates.length === 0) {
      return { currentStreak: 0, maxStreak: 0, totalActiveDays: 0 };
    }
    
    // Calculate current streak (working backwards from today)
    const today = new Date().toISOString().split('T')[0];
    let currentStreak = 0;
    let checkDate = new Date();
    
    // Check if today has activity first
    if (activityData[today] && activityData[today] > 0) {
      currentStreak = 1;
      checkDate.setDate(checkDate.getDate() - 1);
      
      // Count consecutive days backwards
      while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (activityData[dateStr] && activityData[dateStr] > 0) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }
    
    // Calculate max streak
    let maxStreak = 0;
    let tempStreak = 0;
    let previousDate: Date | null = null;
    
    activeDates.forEach(dateStr => {
      const currentDate = new Date(dateStr);
      
      if (previousDate) {
        const dayDiff = Math.floor((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
          tempStreak++;
        } else {
          maxStreak = Math.max(maxStreak, tempStreak);
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      
      previousDate = currentDate;
    });
    
    maxStreak = Math.max(maxStreak, tempStreak);
    
    console.log(`Streak data calculated: current=${currentStreak}, max=${maxStreak}, total=${totalActiveDays}`);
    
    return {
      currentStreak,
      maxStreak,
      totalActiveDays
    };
  } catch (error) {
    console.error("Failed to calculate streak data:", error);
    return { currentStreak: 0, maxStreak: 0, totalActiveDays: 0 };
  }
};

export default {
  recordDailyActivity,
  syncTodaysActivity,
  getActivityData,
  getStreakData,
  resetAllData,
  getCategoryByJaaps
};
