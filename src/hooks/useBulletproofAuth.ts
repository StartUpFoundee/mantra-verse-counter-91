
import { useState, useEffect } from 'react';
import { UserAccount } from '@/utils/advancedIdUtils';
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
      
      // Check for current account
      const currentAccount = await DeviceAccountManager.getCurrentAccount();
      
      if (currentAccount) {
        // Set account context for data access
        AccountDataManager.setCurrentAccount(currentAccount.id);
        console.log(`Initialized with account context: ${currentAccount.id}`);
      }
      
      setAuthState({
        isAuthenticated: !!currentAccount,
        currentUser: currentAccount,
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
        // This will be handled by the DeviceAccountManager.clearCurrentAccount
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

  return {
    ...authState,
    login,
    logout,
    createAccount,
    importAccount,
    refreshAuth: initializeBulletproofAuth
  };
};
