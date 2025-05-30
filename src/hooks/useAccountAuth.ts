
import { useState, useEffect } from 'react';
import { UserAccount, DataPersistenceManager } from '@/utils/advancedIdUtils';
import { useAccountManager } from './useAccountManager';

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: UserAccount | null;
  isLoading: boolean;
  loginAttempts: number;
  isLocked: boolean;
}

const MAX_LOGIN_ATTEMPTS = 3;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes
const CURRENT_ACCOUNT_KEY = 'current_authenticated_account';

export const useAccountAuth = () => {
  const { currentAccount, switchToAccount, logout: accountLogout, refreshAccounts } = useAccountManager();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    currentUser: null,
    isLoading: true,
    loginAttempts: 0,
    isLocked: false
  });

  // Load persisted session on mount
  useEffect(() => {
    const loadPersistedSession = async () => {
      try {
        setAuthState(prev => ({ ...prev, isLoading: true }));
        
        // Check for persisted current account in multiple storage layers
        let persistedAccount: UserAccount | null = null;
        
        // First check localStorage for quick access
        const localStoredAccount = localStorage.getItem(CURRENT_ACCOUNT_KEY);
        if (localStoredAccount) {
          try {
            persistedAccount = JSON.parse(localStoredAccount);
          } catch (e) {
            console.error('Error parsing localStorage account:', e);
          }
        }
        
        // Then check IndexedDB for more reliable storage
        if (!persistedAccount) {
          const globalManager = new DataPersistenceManager(1);
          const globalCurrent = await globalManager.getData('globalCurrentAccount');
          if (globalCurrent?.account) {
            persistedAccount = globalCurrent.account;
            // Sync to localStorage for faster future access
            localStorage.setItem(CURRENT_ACCOUNT_KEY, JSON.stringify(persistedAccount));
          }
        }
        
        // If we found a persisted account, verify it still exists and set as current
        if (persistedAccount) {
          const accountManager = new DataPersistenceManager(persistedAccount.slot);
          const accountData = await accountManager.getData('account');
          
          if (accountData && accountData.id === persistedAccount.id) {
            // Account still exists, restore session
            setAuthState(prev => ({
              ...prev,
              isAuthenticated: true,
              currentUser: persistedAccount,
              isLoading: false,
              loginAttempts: 0,
              isLocked: false
            }));
            
            // Update last login time
            accountData.lastLogin = new Date().toISOString();
            await accountManager.storeData('account', accountData);
            
            return;
          } else {
            // Account no longer exists, clear persisted data
            localStorage.removeItem(CURRENT_ACCOUNT_KEY);
            const globalManager = new DataPersistenceManager(1);
            await globalManager.storeData('globalCurrentAccount', null);
          }
        }
        
        // No valid persisted session found
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: false,
          currentUser: null,
          isLoading: false
        }));
        
      } catch (error) {
        console.error('Error loading persisted session:', error);
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: false,
          currentUser: null,
          isLoading: false
        }));
      }
    };

    loadPersistedSession();
  }, []);

  // Set up cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === CURRENT_ACCOUNT_KEY) {
        if (event.newValue) {
          try {
            const newAccount = JSON.parse(event.newValue);
            setAuthState(prev => ({
              ...prev,
              isAuthenticated: true,
              currentUser: newAccount
            }));
          } catch (e) {
            console.error('Error parsing storage change:', e);
          }
        } else {
          // Account was cleared in another tab
          setAuthState(prev => ({
            ...prev,
            isAuthenticated: false,
            currentUser: null
          }));
        }
      }
    };

    // Listen for storage changes from other tabs
    window.addEventListener('storage', handleStorageChange);
    
    // Set up BroadcastChannel for same-tab communication
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

  // Update auth state when currentAccount changes from useAccountManager
  useEffect(() => {
    if (currentAccount && currentAccount.id !== authState.currentUser?.id) {
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: true,
        currentUser: currentAccount,
        isLoading: false
      }));
      
      // Persist to storage
      localStorage.setItem(CURRENT_ACCOUNT_KEY, JSON.stringify(currentAccount));
      
      // Broadcast to other tabs
      if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel('mantra-verse-auth');
        channel.postMessage({ type: 'auth-change', account: currentAccount });
        channel.close();
      }
    }
  }, [currentAccount, authState.currentUser?.id]);

  const login = async (slot: number, password: string): Promise<boolean> => {
    if (authState.isLocked) {
      throw new Error('Account is temporarily locked. Please try again later.');
    }

    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const account = await switchToAccount(slot, password);
      
      // Reset login attempts on successful login
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: true,
        currentUser: account,
        loginAttempts: 0,
        isLocked: false,
        isLoading: false
      }));

      // Persist session data
      localStorage.setItem(CURRENT_ACCOUNT_KEY, JSON.stringify(account));
      
      // Store in IndexedDB for reliability
      const globalManager = new DataPersistenceManager(1);
      await globalManager.storeData('globalCurrentAccount', { 
        account, 
        timestamp: Date.now(),
        deviceFingerprint: account.deviceFingerprint
      });
      
      // Broadcast to other tabs
      if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel('mantra-verse-auth');
        channel.postMessage({ type: 'auth-change', account });
        channel.close();
      }

      // Clear any stored lockout
      localStorage.removeItem(`lockout_${slot}`);
      
      return true;
    } catch (error) {
      const newAttempts = authState.loginAttempts + 1;
      
      setAuthState(prev => ({
        ...prev,
        loginAttempts: newAttempts,
        isLoading: false
      }));

      // Lock account after max attempts
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lockoutEnd = Date.now() + LOCKOUT_DURATION;
        localStorage.setItem(`lockout_${slot}`, lockoutEnd.toString());
        
        setAuthState(prev => ({
          ...prev,
          isLocked: true
        }));

        // Auto-unlock after duration
        setTimeout(() => {
          setAuthState(prev => ({
            ...prev,
            isLocked: false,
            loginAttempts: 0
          }));
          localStorage.removeItem(`lockout_${slot}`);
        }, LOCKOUT_DURATION);
      }

      throw error;
    }
  };

  const logout = async () => {
    try {
      await accountLogout();
      
      setAuthState({
        isAuthenticated: false,
        currentUser: null,
        isLoading: false,
        loginAttempts: 0,
        isLocked: false
      });
      
      // Clear all persisted session data
      localStorage.removeItem(CURRENT_ACCOUNT_KEY);
      
      // Clear global current account
      const globalManager = new DataPersistenceManager(1);
      await globalManager.storeData('globalCurrentAccount', null);
      
      // Broadcast logout to other tabs
      if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel('mantra-verse-auth');
        channel.postMessage({ type: 'auth-change', account: null });
        channel.close();
      }
      
    } catch (error) {
      throw error;
    }
  };

  const checkLockoutStatus = (slot: number): boolean => {
    const lockoutEnd = localStorage.getItem(`lockout_${slot}`);
    if (!lockoutEnd) return false;

    const lockoutTime = parseInt(lockoutEnd, 10);
    if (Date.now() > lockoutTime) {
      localStorage.removeItem(`lockout_${slot}`);
      return false;
    }

    return true;
  };

  const getRemainingLockoutTime = (slot: number): number => {
    const lockoutEnd = localStorage.getItem(`lockout_${slot}`);
    if (!lockoutEnd) return 0;

    const lockoutTime = parseInt(lockoutEnd, 10);
    const remaining = lockoutTime - Date.now();
    return Math.max(0, remaining);
  };

  return {
    authState,
    login,
    logout,
    checkLockoutStatus,
    getRemainingLockoutTime,
    isAuthenticated: authState.isAuthenticated,
    currentUser: authState.currentUser,
    isLoading: authState.isLoading
  };
};
