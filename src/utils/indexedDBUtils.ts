import { AccountDataManager } from './accountDataManager';

let db: IDBDatabase | null = null;

export const initializeDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve();
      return;
    }

    const request = indexedDB.open('MantraCounterDB', 2);

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
