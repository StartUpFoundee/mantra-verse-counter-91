
import { useState, useEffect } from 'react';
import { UserAccount, DataPersistenceManager } from '@/utils/advancedIdUtils';
import { DeviceAccountManager } from '@/utils/deviceAccountManager';
import { getBulletproofDeviceId } from '@/utils/enhancedDeviceFingerprint';
import { AccountDataManager } from '@/utils/accountDataManager';

export interface BulletproofAuthState {
  isAuthenticated: boolean;
  currentUser: UserAccount | null;
  isLoading: boolean;
  deviceId: string | null;
}

export const useBulletproofAuth = () => {
  const [authState, setAuthState] = useState<BulletproofAuthState>({
    isAuthenticated: false,
    currentUser: null,
    isLoading: true,
    deviceId: null
  });

  // Initialize bulletproof authentication
  useEffect(() => {
    initializeBulletproofAuth();
  }, []);

  // Cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'current_authenticated_account') {
        if (event.newValue) {
          try {
            const account = JSON.parse(event.newValue);
            setAuthState(prev => ({
              ...prev,
              isAuthenticated: true,
              currentUser: account
            }));
            // Update account context for the new account
            AccountDataManager.setCurrentAccount(account.id);
          } catch (e) {
            console.error('Error parsing auth change:', e);
          }
        } else {
          setAuthState(prev => ({
            ...prev,
            isAuthenticated: false,
            currentUser: null
          }));
          // Clear account context
          AccountDataManager.clearCurrentAccount();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // BroadcastChannel for same-tab communication
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('mantra-verse-auth');
      
      channel.onmessage = (event) => {
        if (event.data.type === 'auth-change') {
          if (event.data.account) {
            setAuthState(prev => ({
              ...prev,
              isAuthenticated: true,
              currentUser: event.data.account
            }));
            // Update account context for the new account
            AccountDataManager.setCurrentAccount(event.data.account.id);
          } else {
            setAuthState(prev => ({
              ...prev,
              isAuthenticated: false,
              currentUser: null
            }));
            // Clear account context
            AccountDataManager.clearCurrentAccount();
          }
        }
      };

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        channel.close();
      };
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const initializeBulletproofAuth = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Get bulletproof device ID
      const deviceId = await getBulletproofDeviceId();
      
      // SECURITY: Always clear sessions on app startup for maximum security
      // Users must enter password every time they open the app
      await DeviceAccountManager.clearCurrentAccount();
      AccountDataManager.clearCurrentAccount();
      
      console.log('App initialized - requiring password authentication for security');
      
      setAuthState({
        isAuthenticated: false,
        currentUser: null,
        isLoading: false,
        deviceId
      });
      
    } catch (error) {
      console.error('Error initializing bulletproof auth:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false,
        currentUser: null
      }));
    }
  };

  const login = async (slot: number, password: string): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const account = await DeviceAccountManager.switchToAccount(slot, password);
      
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: true,
        currentUser: account,
        isLoading: false
      }));
      
      console.log(`Successfully logged in as: ${account.name} (${account.id})`);
      
      return true;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      const currentAccountId = authState.currentUser?.id;
      
      // Save current session data before logout
      if (currentAccountId) {
        console.log(`Saving session data for account: ${currentAccountId}`);
      }
      
      await DeviceAccountManager.clearCurrentAccount();
      
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        currentUser: null
      }));
      
      console.log('Successfully logged out');
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  const createAccount = async (name: string, dob: string, password: string): Promise<UserAccount> => {
    try {
      const { account } = await DeviceAccountManager.createAccountOnDevice(name, dob, password);
      
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: true,
        currentUser: account
      }));
      
      console.log(`Created and logged in as new account: ${account.name} (${account.id})`);
      
      return account;
    } catch (error) {
      throw error;
    }
  };

  const importAccount = async (qrData: string): Promise<UserAccount> => {
    try {
      const { account } = await DeviceAccountManager.importAccountToDevice(qrData);
      
      // Don't auto-login imported account, just return it
      console.log(`Successfully imported account: ${account.name} (${account.id})`);
      
      return account;
    } catch (error) {
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    if (!authState.currentUser) {
      throw new Error('No authenticated user');
    }

    try {
      // Verify current password first
      const deviceId = await getBulletproofDeviceId();
      
      // Create temporary hash for verification
      const encoder = new TextEncoder();
      const currentData = encoder.encode(currentPassword + deviceId);
      const currentHashBuffer = await crypto.subtle.digest('SHA-256', currentData);
      const currentHashArray = Array.from(new Uint8Array(currentHashBuffer));
      const currentHash = currentHashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      if (currentHash !== authState.currentUser.passwordHash) {
        throw new Error('Current password is incorrect');
      }

      // Create new password hash
      const newData = encoder.encode(newPassword + deviceId);
      const newHashBuffer = await crypto.subtle.digest('SHA-256', newData);
      const newHashArray = Array.from(new Uint8Array(newHashBuffer));
      const newPasswordHash = newHashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Update password hash
      const updatedAccount = {
        ...authState.currentUser,
        passwordHash: newPasswordHash
      };

      // Store updated account
      const manager = new DataPersistenceManager(authState.currentUser.slot);
      await manager.storeData('account', updatedAccount);

      // Update current state
      setAuthState(prev => ({
        ...prev,
        currentUser: updatedAccount
      }));

      console.log('Password changed successfully');
    } catch (error) {
      throw error;
    }
  };

  return {
    ...authState,
    login,
    logout,
    createAccount,
    importAccount,
    changePassword,
    refreshAuth: initializeBulletproofAuth
  };
};
