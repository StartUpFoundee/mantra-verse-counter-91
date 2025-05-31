import { v4 as uuidv4 } from 'uuid';
import { UserAccount } from './advancedIdUtils';
import { getBulletproofDeviceId } from './enhancedDeviceFingerprint';
import CryptoJS from 'crypto-js';

export interface DeviceAccount {
  encryptedData: string;
  createdAt: string;
  lastLogin: string;
  deviceFingerprint: string;
}

export interface DeviceAccountSlot {
  slot: number;
  isEmpty: boolean;
  account?: UserAccount | null;
}

interface DeviceAccounts {
  [deviceId: string]: {
    [slot: number]: DeviceAccount;
  };
}

const ACCOUNT_SLOTS = [1, 2, 3];
const STORAGE_KEY = 'device_accounts';
const LOCKOUT_KEY_PREFIX = 'lockout_';
const MAX_LOGIN_ATTEMPTS = 3;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes

export class DeviceAccountManager {
  private static async getStoredDeviceAccounts(): Promise<DeviceAccounts | null> {
    try {
      const accountsJson = localStorage.getItem(STORAGE_KEY);
      return accountsJson ? JSON.parse(accountsJson) : null;
    } catch (error) {
      console.error('Error getting stored device accounts:', error);
      return null;
    }
  }

  private static async storeDeviceAccounts(accounts: DeviceAccounts): Promise<void> {
    try {
      const accountsJson = JSON.stringify(accounts);
      localStorage.setItem(STORAGE_KEY, accountsJson);
    } catch (error) {
      console.error('Error storing device accounts:', error);
    }
  }

  private static async encryptAccountData(account: UserAccount, password: string): Promise<string> {
    try {
      const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(account), password).toString();
      return ciphertext;
    } catch (error) {
      console.error('Error encrypting account data:', error);
      throw new Error('Failed to encrypt account data');
    }
  }

  private static async decryptAccountData(encryptedData: string, password: string): Promise<UserAccount> {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, password);
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
      if (!decryptedData) {
        throw new Error('Decryption failed: invalid password or corrupted data');
      }
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('Error decrypting account data:', error);
      throw new Error('Invalid password or corrupted account data');
    }
  }

  private static getLoginAttemptsKey(slot: number): string {
    return `login_attempts_${slot}`;
  }

  private static async getLoginAttempts(slot: number): Promise<number> {
    const key = this.getLoginAttemptsKey(slot);
    const attemptsStr = localStorage.getItem(key);
    return attemptsStr ? parseInt(attemptsStr, 10) : 0;
  }

  private static async setLoginAttempts(slot: number, attempts: number): Promise<void> {
    const key = this.getLoginAttemptsKey(slot);
    localStorage.setItem(key, attempts.toString());
  }

  private static async clearLoginAttempts(slot: number): Promise<void> {
    const key = this.getLoginAttemptsKey(slot);
    localStorage.removeItem(key);
  }

  private static getLockoutKey(slot: number): string {
    return `${LOCKOUT_KEY_PREFIX}${slot}`;
  }

  public static async setAccountLockout(slot: number): Promise<void> {
    const lockoutKey = this.getLockoutKey(slot);
    const lockoutExpiry = Date.now() + LOCKOUT_DURATION;
    localStorage.setItem(lockoutKey, lockoutExpiry.toString());
  }

  public static async clearAccountLockout(slot: number): Promise<void> {
    const lockoutKey = this.getLockoutKey(slot);
    localStorage.removeItem(lockoutKey);
  }

  public static checkLockoutStatus(slot: number): boolean {
    const lockoutKey = this.getLockoutKey(slot);
    const lockoutExpiryStr = localStorage.getItem(lockoutKey);

    if (lockoutExpiryStr) {
      const lockoutExpiry = parseInt(lockoutExpiryStr, 10);
      return Date.now() < lockoutExpiry;
    }

    return false;
  }

  public static getRemainingLockoutTime(slot: number): number {
    const lockoutKey = this.getLockoutKey(slot);
    const lockoutExpiryStr = localStorage.getItem(lockoutKey);

    if (lockoutExpiryStr) {
      const lockoutExpiry = parseInt(lockoutExpiryStr, 10);
      const remainingTime = lockoutExpiry - Date.now();
      return Math.max(remainingTime, 0);
    }

    return 0;
  }

  public static async getDeviceAccounts(): Promise<DeviceAccountSlot[]> {
    try {
      const deviceId = await getBulletproofDeviceId();
      const storedAccounts = await this.getStoredDeviceAccounts() || {};
      const deviceAccounts = storedAccounts[deviceId] || {};

      return ACCOUNT_SLOTS.map(slot => {
        const accountData = deviceAccounts[slot];
        if (accountData) {
          return {
            slot,
            isEmpty: false,
            account: null // Account will be loaded on demand
          };
        } else {
          return {
            slot,
            isEmpty: true,
            account: null
          };
        }
      });
    } catch (error) {
      console.error('Error getting device accounts:', error);
      return ACCOUNT_SLOTS.map(slot => ({
        slot,
        isEmpty: true,
        account: null
      }));
    }
  }

  public static async createAccountOnDevice(
    name: string, 
    dob: string, 
    password: string,
    symbol?: string
  ): Promise<{ account: UserAccount; slot: number }> {
    try {
      const deviceId = await getBulletproofDeviceId();
      const accounts = await this.getDeviceAccounts();
      
      // Find first empty slot
      const emptySlot = accounts.find(acc => acc.isEmpty);
      if (!emptySlot) {
        throw new Error('No available account slots on this device');
      }

      // Check if we already have 3 accounts
      const occupiedSlots = accounts.filter(acc => !acc.isEmpty).length;
      if (occupiedSlots >= 3) {
        throw new Error('Maximum 3 accounts per device limit reached');
      }

      // Generate account
      const account = generateUserAccount(name, dob);
      
      // Add symbol if provided
      if (symbol) {
        account.symbol = symbol;
      }

      // Create encrypted storage entry
      const encryptedData = await this.encryptAccountData(account, password);
      
      // Store in device accounts
      const deviceAccounts = await this.getStoredDeviceAccounts() || {};
      if (!deviceAccounts[deviceId]) {
        deviceAccounts[deviceId] = {};
      }
      
      deviceAccounts[deviceId][emptySlot.slot] = {
        encryptedData,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        deviceFingerprint: deviceId
      };

      await this.storeDeviceAccounts(deviceAccounts);
      
      console.log(`Account created in slot ${emptySlot.slot} for device ${deviceId}`);
      
      return { account, slot: emptySlot.slot };
    } catch (error) {
      console.error('Error creating account on device:', error);
      throw error;
    }
  }

  public static async importAccountToDevice(qrData: string): Promise<{ account: UserAccount; slot: number }> {
    try {
      const deviceId = await getBulletproofDeviceId();
      const accounts = await this.getDeviceAccounts();
      
      // Find first empty slot
      const emptySlot = accounts.find(acc => acc.isEmpty);
      if (!emptySlot) {
        throw new Error('No available account slots on this device');
      }

      // Check if we already have 3 accounts
      const occupiedSlots = accounts.filter(acc => !acc.isEmpty).length;
      if (occupiedSlots >= 3) {
        throw new Error('Maximum 3 accounts per device limit reached');
      }

      // Decode QR data
      const qrJson = atob(qrData);
      const qrAccount = JSON.parse(qrJson);
      const { account, password } = qrAccount;

      // Create encrypted storage entry
      const encryptedData = await this.encryptAccountData(account, password);
      
      // Store in device accounts
      const deviceAccounts = await this.getStoredDeviceAccounts() || {};
      if (!deviceAccounts[deviceId]) {
        deviceAccounts[deviceId] = {};
      }
      
      deviceAccounts[deviceId][emptySlot.slot] = {
        encryptedData,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        deviceFingerprint: deviceId
      };

      await this.storeDeviceAccounts(deviceAccounts);
      
      console.log(`Account imported to slot ${emptySlot.slot} for device ${deviceId}`);
      
      return { account, slot: emptySlot.slot };
    } catch (error) {
      console.error('Error importing account to device:', error);
      throw error;
    }
  }

  public static async switchToAccount(slot: number, password: string): Promise<UserAccount> {
    try {
      const deviceId = await getBulletproofDeviceId();
      const storedAccounts = await this.getStoredDeviceAccounts() || {};
      const deviceAccounts = storedAccounts[deviceId] || {};
      const accountData = deviceAccounts[slot];

      if (!accountData) {
        throw new Error('No account found in this slot');
      }

      // Check lockout status
      if (this.checkLockoutStatus(slot)) {
        throw new Error('Account is temporarily locked. Please try again later.');
      }

      // Decrypt account data
      const account = await this.decryptAccountData(accountData.encryptedData, password);

      // Update last login
      accountData.lastLogin = new Date().toISOString();
      await this.storeDeviceAccounts(storedAccounts);

      // Clear login attempts on successful login
      await this.clearLoginAttempts(slot);
      await this.clearAccountLockout(slot);

      // Store current account
      localStorage.setItem('current_authenticated_account', JSON.stringify(account));

      // Notify other tabs
      if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel('mantra-verse-auth');
        channel.postMessage({ type: 'auth-change', account });
        channel.close();
      }

      return account;
    } catch (error: any) {
      const attempts = await this.getLoginAttempts(slot);
      const newAttempts = attempts + 1;
      await this.setLoginAttempts(slot, newAttempts);

      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        await this.setAccountLockout(slot);
        await this.clearLoginAttempts(slot); // Clear attempts after lockout
        throw new Error('Account locked due to too many failed login attempts.');
      }

      console.error('Error switching to account:', error);
      throw new Error('Invalid password. Please try again.');
    }
  }

  public static async getCurrentAccount(): Promise<UserAccount | null> {
    try {
      const accountJson = localStorage.getItem('current_authenticated_account');
      return accountJson ? JSON.parse(accountJson) : null;
    } catch (error) {
      console.error('Error getting current account:', error);
      return null;
    }
  }

  public static async clearCurrentAccount(): Promise<void> {
    localStorage.removeItem('current_authenticated_account');

    // Notify other tabs
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('mantra-verse-auth');
      channel.postMessage({ type: 'auth-change', account: null });
      channel.close();
    }
  }

  public static async removeAccountFromDevice(slot: number): Promise<void> {
    try {
      const deviceId = await getBulletproofDeviceId();
      const storedAccounts = await this.getStoredDeviceAccounts() || {};

      if (storedAccounts[deviceId] && storedAccounts[deviceId][slot]) {
        delete storedAccounts[deviceId][slot];
        await this.storeDeviceAccounts(storedAccounts);
        console.log(`Account removed from slot ${slot} for device ${deviceId}`);
      } else {
        console.warn(`No account found in slot ${slot} for device ${deviceId}`);
      }
    } catch (error) {
      console.error('Error removing account from device:', error);
    }
  }
}

function generateUserAccount(name: string, dob: string): UserAccount {
  return {
    id: uuidv4(),
    name: name,
    dob: dob,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    chantingStats: {},
    slot: undefined,
    deviceFingerprint: undefined
  };
}
