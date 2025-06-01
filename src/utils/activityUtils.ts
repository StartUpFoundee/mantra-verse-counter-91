
import { getData, storeData, getAllData, STORES } from './indexedDBUtils';

export interface DailyActivity {
  date: string;
  count: number;
  timestamp: number;
  category?: string;
  categoryLevel?: number;
}

export interface StreakData {
  currentStreak: number;
  maxStreak: number;
  totalActiveDays: number;
}

export interface SpiritualCategory {
  id: number;
  name: string;
  sanskritName: string;
  icon: string;
  range: string;
  minCount: number;
  maxCount: number;
  gradient: string;
}

export const SPIRITUAL_CATEGORIES: SpiritualCategory[] = [
  {
    id: 0,
    name: "Dormant Soul",
    sanskritName: "Rogi",
    icon: "", // No icon for Rogi - keep calendar clear
    range: "0 Jaaps",
    minCount: 0,
    maxCount: 0,
    gradient: "from-gray-800 to-gray-600"
  },
  {
    id: 1,
    name: "Pure Beginning",
    sanskritName: "Bhogi",
    icon: "🍯",
    range: "1-108 Jaaps",
    minCount: 1,
    maxCount: 108,
    gradient: "from-amber-400 to-yellow-500"
  },
  {
    id: 2,
    name: "Noble Path",
    sanskritName: "Yogi",
    icon: "🧘‍♂️",
    range: "109-500 Jaaps",
    minCount: 109,
    maxCount: 500,
    gradient: "from-blue-500 to-indigo-600"
  },
  {
    id: 3,
    name: "Victory Spirit",
    sanskritName: "Sadhak",
    icon: "🕉️",
    range: "501-1000 Jaaps",
    minCount: 501,
    maxCount: 1000,
    gradient: "from-orange-500 to-red-500"
  },
  {
    id: 4,
    name: "Ascending Soul",
    sanskritName: "Tapasvi",
    icon: "🔥",
    range: "1001-1500 Jaaps",
    minCount: 1001,
    maxCount: 1500,
    gradient: "from-red-600 to-pink-600"
  },
  {
    id: 5,
    name: "Divine Radiance",
    sanskritName: "Rishi",
    icon: "🔱",
    range: "1501-2100 Jaaps",
    minCount: 1501,
    maxCount: 2100,
    gradient: "from-purple-600 to-indigo-700"
  },
  {
    id: 6,
    name: "Enlightened Master",
    sanskritName: "Jivanmukta",
    icon: "💎",
    range: "2100+ Jaaps",
    minCount: 2101,
    maxCount: Infinity,
    gradient: "from-yellow-400 to-orange-500"
  }
];

export interface CategoryCounts {
  [categoryId: number]: number;
}

/**
 * Get spiritual category based on jaap count
 */
export const getSpiritualCategory = (count: number): SpiritualCategory => {
  if (count === 0) return SPIRITUAL_CATEGORIES[0];
  
  for (let i = SPIRITUAL_CATEGORIES.length - 1; i >= 1; i--) {
    const category = SPIRITUAL_CATEGORIES[i];
    if (count >= category.minCount) {
      return category;
    }
  }
  
  return SPIRITUAL_CATEGORIES[1]; // Default to first active category
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
    const newCount = currentCount + count;
    
    // Get spiritual category for new count
    const category = getSpiritualCategory(newCount);
    
    // Update activity count with category info
    const activityData: DailyActivity = {
      date: today,
      count: newCount,
      timestamp: Date.now(),
      category: category.sanskritName,
      categoryLevel: category.id
    };
    
    await storeData(STORES.activityData, activityData, today);
    console.log(`Recorded activity: ${newCount} jaaps, category: ${category.sanskritName}`);
  } catch (error) {
    console.error("Failed to record daily activity:", error);
  }
};

/**
 * Get all activity data for calendar display
 */
export const getActivityData = async (): Promise<{[date: string]: DailyActivity}> => {
  try {
    const allActivity = await getAllData(STORES.activityData);
    const activityMap: {[date: string]: DailyActivity} = {};
    
    allActivity.forEach((activity: DailyActivity) => {
      activityMap[activity.date] = activity;
    });
    
    return activityMap;
  } catch (error) {
    console.error("Failed to get activity data:", error);
    return {};
  }
};

/**
 * Get category counts - how many days user achieved each category
 */
export const getCategoryCounts = async (): Promise<CategoryCounts> => {
  try {
    const activityData = await getActivityData();
    const categoryCounts: CategoryCounts = {};
    
    // Initialize all categories to 0
    SPIRITUAL_CATEGORIES.forEach(category => {
      categoryCounts[category.id] = 0;
    });
    
    // Count days for each category (highest category achieved per day)
    Object.values(activityData).forEach((activity: DailyActivity) => {
      const category = getSpiritualCategory(activity.count);
      categoryCounts[category.id]++;
    });
    
    return categoryCounts;
  } catch (error) {
    console.error("Failed to get category counts:", error);
    const emptyCounts: CategoryCounts = {};
    SPIRITUAL_CATEGORIES.forEach(category => {
      emptyCounts[category.id] = 0;
    });
    return emptyCounts;
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
    
    // Calculate total active days (days with count > 0)
    const activeDays = dates.filter(date => activityData[date].count > 0);
    const totalActiveDays = activeDays.length;
    
    // Calculate current streak (working backwards from today)
    const today = new Date().toISOString().split('T')[0];
    let currentStreak = 0;
    let checkDate = new Date();
    
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const dayActivity = activityData[dateStr];
      
      if (dayActivity && dayActivity.count > 0) {
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
    
    activeDays.forEach(dateStr => {
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
  getStreakData,
  getCategoryCounts,
  getSpiritualCategory,
  SPIRITUAL_CATEGORIES
};
