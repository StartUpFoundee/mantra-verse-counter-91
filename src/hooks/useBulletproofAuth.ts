import { useState, useEffect } from 'react';
import { UserAccount } from '@/utils/advancedIdUtils';
import { DeviceAccountManager } from '@/utils/deviceAccountManager';
import { getBulletproofDeviceId } from '@/utils/enhancedDeviceFingerprint';

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
          } catch (e) {
            console.error('Error parsing auth change:', e);
          }
        } else {
          setAuthState(prev => ({
            ...prev,
            isAuthenticated: false,
            currentUser: null
          }));
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
          } else {
            setAuthState(prev => ({
              ...prev,
              isAuthenticated: false,
              currentUser: null
            }));
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
      
      // DO NOT auto-login - always require password entry
      // Just check if we have device accounts but don't authenticate
      
      setAuthState({
        isAuthenticated: false, // Never auto-authenticate
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
      
      return true;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await DeviceAccountManager.clearCurrentAccount();
      
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        currentUser: null
      }));
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  const createAccount = async (name: string, dob: string, password: string, symbol?: string): Promise<UserAccount> => {
    try {
      const { account } = await DeviceAccountManager.createAccountOnDevice(name, dob, password, symbol);
      
      // DO NOT auto-login after account creation
      // User should go back to account selector and enter password
      
      return account;
    } catch (error) {
      throw error;
    }
  };

  const importAccount = async (qrData: string): Promise<UserAccount> => {
    try {
      const { account } = await DeviceAccountManager.importAccountToDevice(qrData);
      
      // Don't auto-login imported account, just return it
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
