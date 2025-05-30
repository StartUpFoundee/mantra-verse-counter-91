
import { getCachedDeviceFingerprint } from './deviceFingerprint';

export interface UserAccount {
  id: string;
  name: string;
  dob: string;
  passwordHash?: string;
  slot: number;
  deviceFingerprint: string;
  createdAt: string;
  lastLogin: string;
  avatar?: string;
  chantingStats?: any;
}

export interface QRAccountData {
  account: UserAccount;
  exportDate: string;
  deviceFingerprint: string;
  version: string;
}

// Enhanced data persistence manager with cross-tab sync
export class DataPersistenceManager {
  private slot: number;
  private dbName = 'MantraVerseDB';
  private storeName = 'accounts';
  
  constructor(slot: number) {
    this.slot = slot;
  }

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'key' });
        }
      };
    });
  }

  async storeData(key: string, data: any): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const storeKey = `slot_${this.slot}_${key}`;
      await store.put({ key: storeKey, data, timestamp: Date.now() });
      
      // Also store in localStorage as backup
      localStorage.setItem(storeKey, JSON.stringify({ data, timestamp: Date.now() }));
      
      // Broadcast change to other tabs
      this.broadcastChange(storeKey, data);
    } catch (error) {
      console.error('Failed to store data:', error);
      // Fallback to localStorage
      const storeKey = `slot_${this.slot}_${key}`;
      localStorage.setItem(storeKey, JSON.stringify({ data, timestamp: Date.now() }));
    }
  }

  async getData(key: string): Promise<any> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      const storeKey = `slot_${this.slot}_${key}`;
      const result = await store.get(storeKey);
      
      if (result) {
        return result.data;
      }
      
      // Fallback to localStorage
      const stored = localStorage.getItem(storeKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.data;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get data:', error);
      // Fallback to localStorage
      const storeKey = `slot_${this.slot}_${key}`;
      const stored = localStorage.getItem(storeKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.data;
      }
      return null;
    }
  }

  private broadcastChange(key: string, data: any): void {
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('mantra-verse-sync');
      channel.postMessage({ type: 'data-change', key, data });
    }
  }
}

// Account manager with enhanced QR functionality
export class AccountManager {
  private slot: number;
  private dataManager: DataPersistenceManager;

  constructor(slot: number) {
    this.slot = slot;
    this.dataManager = new DataPersistenceManager(slot);
  }

  async createAccount(name: string, dob: string, password: string): Promise<UserAccount> {
    const deviceFingerprint = await getCachedDeviceFingerprint();
    const timestamp = Date.now();
    
    const account: UserAccount = {
      id: `${timestamp}_${deviceFingerprint.slice(0, 8)}_${Math.random().toString(36).substr(2, 4)}`,
      name,
      dob,
      passwordHash: await this.hashPassword(password, deviceFingerprint),
      slot: this.slot,
      deviceFingerprint,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      avatar: this.generateAvatar(),
      chantingStats: {}
    };

    await this.dataManager.storeData('account', account);
    await this.setCurrentAccount(account);
    
    return account;
  }

  async switchToAccount(slot: number): Promise<UserAccount | null> {
    const manager = new DataPersistenceManager(slot);
    const account = await manager.getData('account');
    
    if (account) {
      account.lastLogin = new Date().toISOString();
      await manager.storeData('account', account);
      await this.setCurrentAccount(account);
    }
    
    return account;
  }

  async exportAccountQR(includePassword: boolean = false): Promise<string> {
    const account = await this.dataManager.getData('account');
    if (!account) {
      throw new Error('No account found to export');
    }

    const exportData: QRAccountData = {
      account: {
        ...account,
        passwordHash: includePassword ? account.passwordHash : undefined
      },
      exportDate: new Date().toISOString(),
      deviceFingerprint: await getCachedDeviceFingerprint(),
      version: '1.0'
    };

    // Encrypt the data
    const encrypted = await this.encryptData(JSON.stringify(exportData));
    return btoa(encrypted);
  }

  async importAccountQR(qrData: string, targetSlot: number): Promise<UserAccount> {
    try {
      const decrypted = await this.decryptData(atob(qrData));
      const importData: QRAccountData = JSON.parse(decrypted);
      
      if (!importData.account || !importData.version) {
        throw new Error('Invalid QR code format');
      }

      const account = importData.account;
      account.slot = targetSlot;
      account.lastLogin = new Date().toISOString();

      const targetManager = new DataPersistenceManager(targetSlot);
      await targetManager.storeData('account', account);
      
      return account;
    } catch (error) {
      throw new Error('Failed to import account from QR code');
    }
  }

  private async setCurrentAccount(account: UserAccount): Promise<void> {
    const globalManager = new DataPersistenceManager(1);
    await globalManager.storeData('globalCurrentAccount', { account, timestamp: Date.now() });
  }

  private async hashPassword(password: string, salt: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
    const newHash = await this.hashPassword(password, salt);
    return newHash === hash;
  }

  private async encryptData(data: string): Promise<string> {
    const key = await this.generateEncryptionKey();
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: new Uint8Array(12) },
      key,
      encodedData
    );
    
    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  }

  private async decryptData(encryptedData: string): Promise<string> {
    const key = await this.generateEncryptionKey();
    const data = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(12) },
      key,
      data
    );
    
    return new TextDecoder().decode(decrypted);
  }

  private async generateEncryptionKey(): Promise<CryptoKey> {
    const deviceFingerprint = await getCachedDeviceFingerprint();
    const encoder = new TextEncoder();
    const keyData = encoder.encode(deviceFingerprint);
    
    return crypto.subtle.importKey(
      'raw',
      keyData.slice(0, 32),
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  private generateAvatar(): string {
    const avatars = ['🕉️', '🧘', '🪷', '🕯️', '📿', '⚡', '🌟', '🔱', '☀️', '🌙'];
    return avatars[Math.floor(Math.random() * avatars.length)];
  }
}
