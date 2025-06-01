import { AccountDataManager } from './accountDataManager';

let db: IDBDatabase | null = null;

export const STORES = {
  activityData: "activityData",
  counts: "counts"
};

export const initializeDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve();
      return;
    }

    const request = indexedDB.open('MantraCounterDB', 3);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBRequest).result as IDBDatabase;

      if (event.oldVersion < 1) {
        // Initial version, create object store
        db.createObjectStore('counts', { keyPath: 'id', autoIncrement: true });
      }

      if (event.oldVersion < 2) {
        // Version 2, add index for date
        const countsStore = (event.target as IDBRequest).transaction.objectStore('counts');
        countsStore.createIndex('date', 'date', { unique: false });
      }

      if (event.oldVersion < 3) {
        // Version 3, add activityData store
        if (!db.objectStoreNames.contains('activityData')) {
          db.createObjectStore('activityData');
        }
      }
    };

    request.onsuccess = (event: Event) => {
      db = (event.target as IDBRequest).result as IDBDatabase;
      console.log('Database initialized');
      resolve();
    };

    request.onerror = (event: Event) => {
      console.error('Database failed to open', event);
      reject('Database failed to open');
    };
  });
};

export const migrateFromLocalStorage = async (): Promise<boolean> => {
  try {
    // Check if migration is needed
    const isMigrated = localStorage.getItem('migrationComplete');
    if (isMigrated) {
      console.log('Migration already complete.');
      return true;
    }
    
    // Initialize database
    await initializeDatabase();
    
    // Get data from localStorage
    const lifetimeCount = localStorage.getItem('lifetimeCount');
    const todayCount = localStorage.getItem('todayCount');
    
    // Store data in IndexedDB
    if (lifetimeCount) {
      await AccountDataManager.storeAccountData('mantraCount', parseInt(lifetimeCount, 10));
    }
    
    // Migrate daily progress
    if (todayCount) {
      const today = new Date().toDateString();
      const dailyData = { [today]: parseInt(todayCount, 10) };
      await AccountDataManager.storeAccountData('dailyProgress', dailyData);
    }
    
    // Set migration flag
    localStorage.setItem('migrationComplete', 'true');
    console.log('Data migration from localStorage to IndexedDB complete.');
    return true;
  } catch (error) {
    console.error('Data migration failed:', error);
    return false;
  }
};

export const getLifetimeCount = async (): Promise<number> => {
  try {
    const accountData = await AccountDataManager.getAccountData<number>('mantraCount');
    return accountData || 0;
  } catch (error) {
    console.error('Error getting lifetime count:', error);
    return 0;
  }
};

export const getTodayCount = async (): Promise<number> => {
  try {
    const today = new Date().toDateString();
    const dailyData = await AccountDataManager.getAccountData<any>('dailyProgress');
    return dailyData?.[today] || 0;
  } catch (error) {
    console.error('Error getting today count:', error);
    return 0;
  }
};

export const updateMantraCount = async (count: number): Promise<void> => {
  try {
    await AccountDataManager.storeAccountData('mantraCount', count);
    
    // Also update today's count
    const today = new Date().toDateString();
    const dailyData = await AccountDataManager.getAccountData<any>('dailyProgress') || {};
    dailyData[today] = (dailyData[today] || 0) + 1;
    await AccountDataManager.storeAccountData('dailyProgress', dailyData);
    
    console.log(`Updated mantra count to ${count} for current account`);
  } catch (error) {
    console.error('Error updating mantra count:', error);
    throw error;
  }
};

// Fixed function name and return type
export const updateMantraCounts = async (incrementBy: number = 1): Promise<{ lifetimeCount: number; todayCount: number }> => {
  try {
    // Get current counts
    const currentLifetime = await getLifetimeCount();
    const currentToday = await getTodayCount();
    
    // Update lifetime count
    const newLifetime = currentLifetime + incrementBy;
    await AccountDataManager.storeAccountData('mantraCount', newLifetime);
    
    // Update today's count
    const today = new Date().toDateString();
    const dailyData = await AccountDataManager.getAccountData<any>('dailyProgress') || {};
    const newToday = (dailyData[today] || 0) + incrementBy;
    dailyData[today] = newToday;
    await AccountDataManager.storeAccountData('dailyProgress', dailyData);
    
    console.log(`Updated mantra counts: lifetime=${newLifetime}, today=${newToday}`);
    return { lifetimeCount: newLifetime, todayCount: newToday };
  } catch (error) {
    console.error('Error updating mantra counts:', error);
    throw error;
  }
};

// Legacy compatibility functions
export const getUserData = () => {
  const userData = localStorage.getItem('chantTrackerUserData');
  return userData ? JSON.parse(userData) : null;
};

export const saveUserData = (userData: any) => {
  localStorage.setItem('chantTrackerUserData', JSON.stringify(userData));
};

export const logoutUser = () => {
  localStorage.removeItem('chantTrackerUserData');
};

export const isUserLoggedIn = (): boolean => {
  return localStorage.getItem('chantTrackerUserData') !== null;
};

export const getItem = (key: string) => {
  return localStorage.getItem(key);
};

export const setItem = (key: string, value: string) => {
  localStorage.setItem(key, value);
};

export const removeItem = (key: string) => {
  localStorage.removeItem(key);
};

// Generic IndexedDB functions
export const getData = async (storeName: string, key: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject('Database not initialized');
      return;
    }

    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const storeData = async (storeName: string, data: any, key?: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject('Database not initialized');
      return;
    }

    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = key ? store.put(data, key) : store.add(data);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const getAllData = async (storeName: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject('Database not initialized');
      return;
    }

    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

// Add function to clear all data for fresh start
export const clearAllData = async (): Promise<void> => {
  try {
    await initializeDatabase();
    
    // Clear activity data
    const request = indexedDB.open('MantraCounterDB', 3);
    
    request.onsuccess = () => {
      const db = request.result;
      
      // Clear activity data store
      if (db.objectStoreNames.contains('activityData')) {
        const transaction = db.transaction(['activityData'], 'readwrite');
        const store = transaction.objectStore('activityData');
        store.clear();
      }
      
      // Clear counts store
      if (db.objectStoreNames.contains('counts')) {
        const transaction2 = db.transaction(['counts'], 'readwrite');
        const store2 = transaction2.objectStore('counts');
        store2.clear();
      }
    };
    
    // Also clear localStorage for account data
    Object.keys(localStorage).forEach(key => {
      if (key.includes('account_') || key.includes('mantra') || key.includes('daily')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('All data cleared successfully');
  } catch (error) {
    console.error('Failed to clear all data:', error);
  }
};

export const syncTodayActivityData = async (): Promise<void> => {
  try {
    const { recordDailyActivity } = await import('./activityUtils');
    const todayCount = await getTodayCount();
    
    if (todayCount > 0) {
      // This will update the activity data with current count
      await recordDailyActivity(0); // Pass 0 to avoid double counting
      
      // Update the activity data directly with today's actual count
      const today = new Date().toISOString().split('T')[0];
      const activityData = {
        date: today,
        count: todayCount,
        timestamp: Date.now()
      };
      
      await storeData(STORES.activityData, activityData, today);
      console.log(`Synced today's activity: ${todayCount} jaaps`);
    }
  } catch (error) {
    console.error('Failed to sync today activity data:', error);
  }
};
