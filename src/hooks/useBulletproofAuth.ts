import { useState, useEffect, useCallback } from 'react';
import { DeviceAccountManager } from '@/utils/deviceAccountManager';
import { UserAccount } from '@/utils/advancedIdUtils';

export const useBulletproofAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if any accounts exist on this device (but don't auto-login)
  const checkPersistedSession = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Get all accounts on this device
      const deviceAccounts = await DeviceAccountManager.getDeviceAccounts();
      const hasAccounts = deviceAccounts.some(slot => !slot.isEmpty);
      
      // Never auto-login - always require explicit authentication
      setIsAuthenticated(false);
      setCurrentUser(null);
      
      return hasAccounts;
    } catch (error) {
      console.error('Error checking persisted session:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new account
  const createAccount = useCallback(async (name: string, dob: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      const { account } = await DeviceAccountManager.createAccountOnDevice(name, dob, password);
      
      // After creation, don't auto-login - require explicit login
      console.log(`Account created successfully: ${account.name} (${account.id})`);
      
    } catch (error) {
      console.error('Failed to create account:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login to an existing account
  const login = useCallback(async (slot: number, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      const account = await DeviceAccountManager.switchToAccount(slot, password);
      
      setIsAuthenticated(true);
      setCurrentUser(account);
      
      console.log(`Successfully logged in: ${account.name}`);
      
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout and clear session
  const logout = useCallback(async (): Promise<void> => {
    try {
      await DeviceAccountManager.clearCurrentAccount();
      
      setIsAuthenticated(false);
      setCurrentUser(null);
      
      console.log('Successfully logged out');
      
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }, []);

  // Clear any automatic session restoration
  const clearSession = useCallback(async (): Promise<void> => {
    try {
      // Clear any stored session data but keep account data
      localStorage.removeItem('current_authenticated_account');
      sessionStorage.removeItem('current_authenticated_account');
      
      // Clear current account context but don't delete account data
      await DeviceAccountManager.clearCurrentAccount();
      
      setIsAuthenticated(false);
      setCurrentUser(null);
      
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }, []);

  // Import account from QR code
  const importAccount = useCallback(async (qrData: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      const { account } = await DeviceAccountManager.importAccountToDevice(qrData);
      
      console.log(`Account imported successfully: ${account.name}`);
      
    } catch (error) {
      console.error('Failed to import account:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    checkPersistedSession();
  }, [checkPersistedSession]);

  return {
    // State
    isAuthenticated,
    currentUser,
    isLoading,
    
    // Methods
    createAccount,
    login,
    logout,
    checkPersistedSession,
    clearSession,
    importAccount
  };
};
