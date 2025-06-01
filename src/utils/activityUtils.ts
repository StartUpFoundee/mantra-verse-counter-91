import { getData, storeData, getAllData, STORES } from './indexedDBUtils';

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
    
    await storeData(STORES.activityData, activityData, today);
  } catch (error) {
    console.error("Failed to record daily activity:", error);
  }
};

/**
 * Get all activity data for calendar display
 */
export const getActivityData = async (): Promise<{[date: string]: number}> => {
  try {
    const allActivity = await getAllData(STORES.activityData);
    const activityMap: {[date: string]: number} = {};
    
    allActivity.forEach((activity: DailyActivity) => {
      activityMap[activity.date] = activity.count;
    });
    
    return activityMap;
  } catch (error) {
    console.error("Failed to get activity data:", error);
    return {};
  }
};

/**
 * Calculate streak data
 */
export const getStreakData = async (): Promise<StreakData> => {
  try {
    const activityData = await getActivityData();
    const dates = Object.keys(activityData).sort();
    
    if (dates.length === 0) {
      return { currentStreak: 0, maxStreak: 0, totalActiveDays: 0 };
    }
    
    // Calculate total active days
    const totalActiveDays = dates.length;
    
    // Calculate current streak (working backwards from today)
    const today = new Date().toISOString().split('T')[0];
    let currentStreak = 0;
    let checkDate = new Date();
    
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (activityData[dateStr] && activityData[dateStr] > 0) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (dateStr === today) {
        // If today has no activity, start checking from yesterday
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      } else {
        break;
      }
    }
    
    // Calculate max streak
    let maxStreak = 0;
    let tempStreak = 0;
    let previousDate: Date | null = null;
    
    dates.forEach(dateStr => {
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
  getActivityData,
  getStreakData
};
