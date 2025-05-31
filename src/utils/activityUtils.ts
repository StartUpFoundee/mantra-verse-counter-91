
import { getData, storeData, getAllData, STORES } from './indexedDBUtils';

export interface DailyActivity {
  date: string;
  count: number;
  timestamp: number;
  category?: string;
  icon?: string;
}

export interface StreakData {
  currentStreak: number;
  maxStreak: number;
  totalActiveDays: number;
  currentCategory: string;
  highestCategory: string;
  categoryDistribution: {[category: string]: number};
}

export interface MantraCategory {
  id: string;
  name: string;
  icon: string;
  minCount: number;
  maxCount: number;
  color: string;
  description: string;
}

/**
 * Mantra count categories with icons and motivational names
 */
export const MANTRA_CATEGORIES: MantraCategory[] = [
  {
    id: 'beginner',
    name: 'Seeker',
    icon: '🌱',
    minCount: 1,
    maxCount: 108,
    color: 'text-green-500',
    description: 'Beginning the spiritual journey'
  },
  {
    id: 'dedicated',
    name: 'Devoted',
    icon: '🪷',
    minCount: 109,
    maxCount: 500,
    color: 'text-pink-500',
    description: 'Showing dedication to practice'
  },
  {
    id: 'committed',
    name: 'Committed',
    icon: '🕉️',
    minCount: 501,
    maxCount: 1000,
    color: 'text-orange-500',
    description: 'Deeply committed practitioner'
  },
  {
    id: 'advanced',
    name: 'Enlightened',
    icon: '✨',
    minCount: 1001,
    maxCount: 1500,
    color: 'text-yellow-500',
    description: 'Advanced spiritual seeker'
  },
  {
    id: 'master',
    name: 'Sage',
    icon: '🔥',
    minCount: 1501,
    maxCount: 2100,
    color: 'text-red-500',
    description: 'Wisdom and discipline master'
  },
  {
    id: 'transcendent',
    name: 'Transcendent Master',
    icon: '🧘‍♂️',
    minCount: 2101,
    maxCount: Infinity,
    color: 'text-purple-500',
    description: 'Transcended beyond ordinary practice'
  }
];

/**
 * Get category based on mantra count
 */
export const getCategoryByCount = (count: number): MantraCategory => {
  return MANTRA_CATEGORIES.find(cat => count >= cat.minCount && count <= cat.maxCount) || MANTRA_CATEGORIES[0];
};

/**
 * Get category by ID
 */
export const getCategoryById = (id: string): MantraCategory | undefined => {
  return MANTRA_CATEGORIES.find(cat => cat.id === id);
};

/**
 * Record daily activity when user completes jaaps with category tracking
 */
export const recordDailyActivity = async (count: number = 1): Promise<void> => {
  const today = new Date().toISOString().split('T')[0];
  
  try {
    // Get existing activity for today
    const existingActivity = await getData(STORES.activityData, today);
    const currentCount = existingActivity ? existingActivity.count : 0;
    const newTotalCount = currentCount + count;
    
    // Determine category and icon
    const category = getCategoryByCount(newTotalCount);
    
    // Update activity count with category information
    const activityData: DailyActivity = {
      date: today,
      count: newTotalCount,
      timestamp: Date.now(),
      category: category.id,
      icon: category.icon
    };
    
    await storeData(STORES.activityData, activityData, today);
  } catch (error) {
    console.error("Failed to record daily activity:", error);
  }
};

/**
 * Get all activity data for calendar display with categories
 */
export const getActivityData = async (): Promise<{[date: string]: DailyActivity}> => {
  try {
    const allActivity = await getAllData(STORES.activityData);
    const activityMap: {[date: string]: DailyActivity} = {};
    
    allActivity.forEach((activity: DailyActivity) => {
      // Ensure backward compatibility by adding category if missing
      if (!activity.category && activity.count > 0) {
        const category = getCategoryByCount(activity.count);
        activity.category = category.id;
        activity.icon = category.icon;
      }
      activityMap[activity.date] = activity;
    });
    
    return activityMap;
  } catch (error) {
    console.error("Failed to get activity data:", error);
    return {};
  }
};

/**
 * Calculate enhanced streak data with category information
 */
export const getStreakData = async (): Promise<StreakData> => {
  try {
    const activityData = await getActivityData();
    const activities = Object.values(activityData);
    const dates = Object.keys(activityData).sort();
    
    if (dates.length === 0) {
      return { 
        currentStreak: 0, 
        maxStreak: 0, 
        totalActiveDays: 0,
        currentCategory: 'beginner',
        highestCategory: 'beginner',
        categoryDistribution: {}
      };
    }
    
    // Calculate total active days
    const totalActiveDays = dates.length;
    
    // Calculate current streak (working backwards from today)
    const today = new Date().toISOString().split('T')[0];
    let currentStreak = 0;
    let checkDate = new Date();
    
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (activityData[dateStr] && activityData[dateStr].count > 0) {
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
    
    // Calculate category distribution
    const categoryDistribution: {[category: string]: number} = {};
    activities.forEach(activity => {
      if (activity.category) {
        categoryDistribution[activity.category] = (categoryDistribution[activity.category] || 0) + 1;
      }
    });
    
    // Get current and highest categories
    const todayActivity = activityData[today];
    const currentCategory = todayActivity?.category || 'beginner';
    
    // Find highest category achieved
    let highestCategory = 'beginner';
    const sortedCategories = MANTRA_CATEGORIES.slice().reverse(); // Start from highest
    for (const category of sortedCategories) {
      if (categoryDistribution[category.id] > 0) {
        highestCategory = category.id;
        break;
      }
    }
    
    return {
      currentStreak,
      maxStreak,
      totalActiveDays,
      currentCategory,
      highestCategory,
      categoryDistribution
    };
  } catch (error) {
    console.error("Failed to calculate streak data:", error);
    return { 
      currentStreak: 0, 
      maxStreak: 0, 
      totalActiveDays: 0,
      currentCategory: 'beginner',
      highestCategory: 'beginner',
      categoryDistribution: {}
    };
  }
};

export default {
  recordDailyActivity,
  getActivityData,
  getStreakData,
  getCategoryByCount,
  getCategoryById,
  MANTRA_CATEGORIES
};
