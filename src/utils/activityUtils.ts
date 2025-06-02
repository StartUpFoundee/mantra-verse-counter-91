
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
    console.log(`Recorded ${count} jaaps for ${today}. Total today: ${activityData.count}`);
  } catch (error) {
    console.error("Failed to record daily activity:", error);
  }
};

/**
 * Get all activity data for calendar display
 */
export const getActivityData = async (): Promise<{[date: string]: number}> => {
  try {
    // Get activity from IndexedDB
    const allActivity = await getAllData(STORES.activityData);
    const activityMap: {[date: string]: number} = {};
    
    allActivity.forEach((activity: DailyActivity) => {
      activityMap[activity.date] = activity.count;
    });
    
    // Always get today's count from the main counter system and sync it
    const todayCount = await getTodayCount();
    const today = new Date().toISOString().split('T')[0];
    
    if (todayCount > 0) {
      activityMap[today] = todayCount;
      // Sync today's count to activity data
      await recordDailyActivity(0); // This will update with current count
      const activityData: DailyActivity = {
        date: today,
        count: todayCount,
        timestamp: Date.now()
      };
      await storeData(STORES.activityData, activityData, today);
    }
    
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
    const activeDates = Object.keys(activityData).filter(date => activityData[date] > 0).sort();
    
    if (activeDates.length === 0) {
      return { currentStreak: 0, maxStreak: 0, totalActiveDays: 0 };
    }
    
    // Calculate total active days - this should be the count of unique dates with activity > 0
    const totalActiveDays = activeDates.length;
    
    // Calculate current streak (working backwards from today)
    const today = new Date().toISOString().split('T')[0];
    let currentStreak = 0;
    let checkDate = new Date();
    
    // Check if today has activity first
    if (activityData[today] && activityData[today] > 0) {
      currentStreak = 1;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
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
    
    console.log(`Streak data: current=${currentStreak}, max=${maxStreak}, total=${totalActiveDays}`);
    
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
