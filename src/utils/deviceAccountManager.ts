import { getBulletproofDeviceId, BulletproofStorage } from './enhancedDeviceFingerprint';
import { UserAccount, DataPersistenceManager } from './advancedIdUtils';
import { AccountDataManager } from './accountDataManager';

export interface DeviceAccountSlot {
  slot: number;
  account: UserAccount | null;
  isEmpty: boolean;
  deviceId: string;
}

export class DeviceAccountManager {
  private static readonly DEVICE_ACCOUNTS_KEY = 'device_accounts';
  private static readonly MAX_ACCOUNTS_PER_DEVICE = 3;
  
  static async getDeviceAccounts(): Promise<DeviceAccountSlot[]> {
    const deviceId = await getBulletproofDeviceId();
    
    // Initialize default slots
    const defaultSlots: DeviceAccountSlot[] = [
      { slot: 1, account: null, isEmpty: true, deviceId },
      { slot: 2, account: null, isEmpty: true, deviceId },
      { slot: 3, account: null, isEmpty: true, deviceId }
    ];
    
    try {
      // Check each slot for accounts
      for (let slot = 1; slot <= 3; slot++) {
        const manager = new DataPersistenceManager(slot);
        const account = await manager.getData('account');
        
        if (account && account.deviceFingerprint === deviceId) {
          defaultSlots[slot - 1] = {
            slot,
            account,
            isEmpty: false,
            deviceId
          };
        }
      }
      
      // Store device accounts mapping
      await this.storeDeviceAccountsMapping(deviceId, defaultSlots);
      
      return defaultSlots;
    } catch (error) {
      console.error('Error loading device accounts:', error);
      return defaultSlots;
    }
  }
  
  static async createAccountOnDevice(name: string, dob: string, password: string): Promise<{ account: UserAccount; slot: number }> {
    const deviceId = await getBulletproofDeviceId();
    const currentAccounts = await this.getDeviceAccounts();
    
    // Find first empty slot
    const emptySlot = currentAccounts.find(slot => slot.isEmpty);
    if (!emptySlot) {
      throw new Error(`Device limit reached. Maximum ${this.MAX_ACCOUNTS_PER_DEVICE} accounts per device.`);
    }
    
    // Create account in the empty slot
    const manager = new DataPersistenceManager(emptySlot.slot);
    const timestamp = Date.now();
    
    const account: UserAccount = {
      id: `${timestamp}_${deviceId.slice(0, 8)}_slot${emptySlot.slot}_${Math.random().toString(36).substr(2, 4)}`,
      name,
      dob,
      passwordHash: await this.hashPassword(password, deviceId),
      slot: emptySlot.slot,
      deviceFingerprint: deviceId,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      avatar: this.generateAvatar(),
      chantingStats: {}
    };
    
    // Store account
    await manager.storeData('account', account);
    
    // Initialize account-specific data storage with unique account ID context
    console.log(`Initializing account-specific storage for: ${account.id}`);
    await this.initializeAccountData(account);
    
    // Update device accounts mapping
    const updatedAccounts = await this.getDeviceAccounts();
    await this.storeDeviceAccountsMapping(deviceId, updatedAccounts);
    
    return { account, slot: emptySlot.slot };
  }
  
  static async switchToAccount(slot: number, password: string): Promise<UserAccount> {
    const deviceId = await getBulletproofDeviceId();
    const manager = new DataPersistenceManager(slot);
    const account = await manager.getData('account');
    
    if (!account) {
      throw new Error('Account not found');
    }
    
    if (account.deviceFingerprint !== deviceId) {
      throw new Error('Account does not belong to this device');
    }
    
    // Verify password
    const isValid = await this.verifyPassword(password, account.passwordHash || '', deviceId);
    if (!isValid) {
      throw new Error('Invalid password');
    }
    
    // Get current account to save its data first
    const currentAccount = await this.getCurrentAccount();
    const currentAccountId = currentAccount?.id || null;
    
    // Critical: Switch account data context to ensure complete data isolation
    await AccountDataManager.switchAccountContext(currentAccountId, account);
    
    // Update last login
    account.lastLogin = new Date().toISOString();
    await manager.storeData('account', account);
    
    // Set as current account
    await this.setCurrentAccount(account);
    
    console.log(`Successfully switched to account: ${account.name} (${account.id})`);
    console.log(`Account context set to: ${account.id}`);
    
    return account;
  }
  
  static async importAccountToDevice(qrData: string): Promise<{ account: UserAccount; slot: number }> {
    const deviceId = await getBulletproofDeviceId();
    const currentAccounts = await this.getDeviceAccounts();
    
    // Find empty slot
    const emptySlot = currentAccounts.find(slot => slot.isEmpty);
    if (!emptySlot) {
      throw new Error(`Device limit reached. Maximum ${this.MAX_ACCOUNTS_PER_DEVICE} accounts per device.`);
    }
    
    try {
      // Decode QR data
      const decoded = atob(qrData);
      const importData = JSON.parse(decoded);
      
      if (!importData.account || !importData.version) {
        throw new Error('Invalid QR code format');
      }
      
      const account = importData.account;
      
      // Generate new unique ID for this device to prevent conflicts
      const timestamp = Date.now();
      const originalId = account.id;
      account.id = `${timestamp}_${deviceId.slice(0, 8)}_slot${emptySlot.slot}_imported_${Math.random().toString(36).substr(2, 4)}`;
      
      // Update account for this device
      account.slot = emptySlot.slot;
      account.deviceFingerprint = deviceId;
      account.lastLogin = new Date().toISOString();
      
      // Store in the empty slot
      const manager = new DataPersistenceManager(emptySlot.slot);
      await manager.storeData('account', account);
      
      // Initialize account-specific data storage for imported account
      await this.initializeAccountData(account);
      
      // If the import data contains account-specific data, migrate it
      if (importData.accountData) {
        await this.migrateImportedAccountData(account.id, importData.accountData);
      }
      
      // Update device accounts mapping
      const updatedAccounts = await this.getDeviceAccounts();
      await this.storeDeviceAccountsMapping(deviceId, updatedAccounts);
      
      console.log(`Successfully imported account: ${account.name} (original: ${originalId}, new: ${account.id})`);
      
      return { account, slot: emptySlot.slot };
    } catch (error) {
      console.error('Account import failed:', error);
      throw new Error('Failed to import account from QR code');
    }
  }
  
  static async getCurrentAccount(): Promise<UserAccount | null> {
    try {
      // Check for persistent session first
      const persistedAccount = localStorage.getItem('current_authenticated_account');
      if (persistedAccount) {
        try {
          const account = JSON.parse(persistedAccount);
          const deviceId = await getBulletproofDeviceId();
          
          // Verify account belongs to this device
          if (account.deviceFingerprint === deviceId) {
            // Set account context for data access
            AccountDataManager.setCurrentAccount(account.id);
            console.log(`Restored session for: ${account.name} (${account.id})`);
            return account;
          }
        } catch (e) {
          // Invalid session data, clear it
          localStorage.removeItem('current_authenticated_account');
        }
      }
      
      // Fallback to global manager
      const globalManager = new DataPersistenceManager(1);
      const globalCurrent = await globalManager.getData('globalCurrentAccount');
      
      if (globalCurrent?.account) {
        const deviceId = await getBulletproofDeviceId();
        
        // Verify account belongs to this device
        if (globalCurrent.account.deviceFingerprint === deviceId) {
          // Set account context for data access
          AccountDataManager.setCurrentAccount(globalCurrent.account.id);
          return globalCurrent.account;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting current account:', error);
      return null;
    }
  }
  
  static async setCurrentAccount(account: UserAccount): Promise<void> {
    const globalManager = new DataPersistenceManager(1);
    await globalManager.storeData('globalCurrentAccount', { 
      account, 
      timestamp: Date.now(),
      deviceId: await getBulletproofDeviceId()
    });
    
    // Critical: Set account context for data access
    AccountDataManager.setCurrentAccount(account.id);
    
    // Store in multiple places for bulletproof persistence
    localStorage.setItem('current_authenticated_account', JSON.stringify(account));
    sessionStorage.setItem('current_authenticated_account', JSON.stringify(account));
    
    // Broadcast to other tabs
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('mantra-verse-auth');
      channel.postMessage({ type: 'auth-change', account });
      channel.close();
    }
    
    console.log(`Set current account: ${account.name} (${account.id})`);
    console.log(`Account data context: account_${account.id}_*`);
  }
  
  static async clearCurrentAccount(): Promise<void> {
    const globalManager = new DataPersistenceManager(1);
    await globalManager.storeData('globalCurrentAccount', null);
    
    // Clear account context
    AccountDataManager.clearCurrentAccount();
    
    localStorage.removeItem('current_authenticated_account');
    sessionStorage.removeItem('current_authenticated_account');
    
    // Broadcast to other tabs
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('mantra-verse-auth');
      channel.postMessage({ type: 'auth-change', account: null });
      channel.close();
    }
    
    console.log('Cleared current account and data context');
  }
  
  /**
   * Initialize default data for a new account with UNIQUE account ID
   */
  private static async initializeAccountData(account: UserAccount): Promise<void> {
    try {
      // Initialize default account-specific data with unique keys
      const defaultData = {
        mantraCount: 0,
        dailyGoal: 108,
        streakCount: 0,
        userPreferences: {
          theme: 'light',
          soundEnabled: true,
          vibrationEnabled: true,
          language: 'en'
        },
        chantingHistory: [],
        spiritualStats: {
          totalSessions: 0,
          totalDuration: 0,
          favoriteMantra: null
        },
        activeDays: [],
        audioSettings: {
          volume: 0.7,
          autoplay: false
        },
        lastSession: null
      };
      
      // Store each piece of default data with account-specific keys using the account ID
      for (const [key, value] of Object.entries(defaultData)) {
        await AccountDataManager.storeAccountData(key, value, account.id);
      }
      
      console.log(`Initialized account-specific data for: ${account.id}`);
      console.log(`Data keys created with prefix: account_${account.id}_`);
    } catch (error) {
      console.error('Failed to initialize account data:', error);
    }
  }
  
  /**
   * Migrate imported account data
   */
  private static async migrateImportedAccountData(accountId: string, importedData: any): Promise<void> {
    try {
      for (const [key, value] of Object.entries(importedData)) {
        await AccountDataManager.storeAccountData(key, value, accountId);
      }
      console.log(`Migrated imported data for account: ${accountId}`);
    } catch (error) {
      console.error('Failed to migrate imported account data:', error);
    }
  }
  
  private static async storeDeviceAccountsMapping(deviceId: string, accounts: DeviceAccountSlot[]): Promise<void> {
    const mapping = {
      deviceId,
      accounts: accounts.map(acc => ({
        slot: acc.slot,
        hasAccount: !acc.isEmpty,
        accountId: acc.account?.id || null
      })),
      lastUpdated: Date.now()
    };
    
    // Store in multiple places
    localStorage.setItem(`${this.DEVICE_ACCOUNTS_KEY}_${deviceId}`, JSON.stringify(mapping));
    
    try {
      await BulletproofStorage.storeDeviceId(deviceId, { accountsMapping: mapping });
    } catch (e) {
      console.warn('Failed to store device accounts mapping:', e);
    }
  }
  
  private static async hashPassword(password: string, salt: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  private static async verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
    const newHash = await this.hashPassword(password, salt);
    return newHash === hash;
  }
  
  private static generateAvatar(): string {
    const avatars = ['🕉️', '🧘', '🪷', '🕯️', '📿', '⚡', '🌟', '🔱', '☀️', '🌙'];
    return avatars[Math.floor(Math.random() * avatars.length)];
  }
}
