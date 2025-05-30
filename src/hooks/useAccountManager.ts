
import { useState, useEffect, useCallback } from 'react';
import { DataPersistenceManager, UserAccount, AccountManager } from '@/utils/advancedIdUtils';
import { getCachedDeviceFingerprint } from '@/utils/deviceFingerprint';

export interface AccountSlot {
  slot: number;
  account: UserAccount | null;
  isEmpty: boolean;
}

export const useAccountManager = () => {
  const [accounts, setAccounts] = useState<AccountSlot[]>([
    { slot: 1, account: null, isEmpty: true },
    { slot: 2, account: null, isEmpty: true },
    { slot: 3, account: null, isEmpty: true }
  ]);
  const [currentAccount, setCurrentAccount] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all accounts on mount
  useEffect(() => {
    loadAllAccounts();
  }, []);

  const loadAllAccounts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const loadedAccounts: AccountSlot[] = [];
      
      for (let slot = 1; slot <= 3; slot++) {
        const manager = new DataPersistenceManager(slot);
        const account = await manager.getData('account');
        
        loadedAccounts.push({
          slot,
          account: account || null,
          isEmpty: !account
        });
      }
      
      setAccounts(loadedAccounts);
      
      // Check for current account
      const globalManager = new DataPersistenceManager(1);
      const globalCurrent = await globalManager.getData('globalCurrentAccount');
      if (globalCurrent?.account) {
        setCurrentAccount(globalCurrent.account);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const createAccount = async (name: string, dob: string, password: string, targetSlot: number): Promise<UserAccount> => {
    try {
      if (targetSlot < 1 || targetSlot > 3) {
        throw new Error('Invalid account slot');
      }

      const accountManager = new AccountManager(targetSlot);
      const account = await accountManager.createAccount(name, dob, password);
      
      await loadAllAccounts(); // Refresh all accounts
      return account;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to create account';
      setError(error);
      throw new Error(error);
    }
  };

  const switchToAccount = async (slot: number, password: string): Promise<UserAccount> => {
    try {
      const accountManager = new AccountManager(slot);
      const account = await accountManager.switchToAccount(slot);
      
      if (!account) {
        throw new Error('Account not found');
      }

      // Verify password
      const isValid = await accountManager.verifyPassword(password, account.passwordHash || '', account.id);
      if (!isValid) {
        throw new Error('Invalid password');
      }

      setCurrentAccount(account);
      await loadAllAccounts(); // Refresh to update last login times
      return account;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to switch account';
      setError(error);
      throw new Error(error);
    }
  };

  const logout = async () => {
    try {
      setCurrentAccount(null);
      
      // Clear global current account
      const globalManager = new DataPersistenceManager(1);
      await globalManager.storeData('globalCurrentAccount', null);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to logout');
    }
  };

  const exportAccountQR = async (slot: number, includePassword: boolean = false): Promise<string> => {
    try {
      const accountManager = new AccountManager(slot);
      return await accountManager.exportAccountQR(includePassword);
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to export account';
      setError(error);
      throw new Error(error);
    }
  };

  const importAccountQR = async (qrData: string, targetSlot: number): Promise<UserAccount> => {
    try {
      if (targetSlot < 1 || targetSlot > 3) {
        throw new Error('Invalid account slot');
      }

      const accountManager = new AccountManager(targetSlot);
      const account = await accountManager.importAccountQR(qrData, targetSlot);
      
      await loadAllAccounts(); // Refresh all accounts
      return account;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to import account';
      setError(error);
      throw new Error(error);
    }
  };

  const getAvailableSlot = (): number | null => {
    const emptySlot = accounts.find(acc => acc.isEmpty);
    return emptySlot ? emptySlot.slot : null;
  };

  const isSlotOccupied = (slot: number): boolean => {
    const account = accounts.find(acc => acc.slot === slot);
    return account ? !account.isEmpty : false;
  };

  return {
    accounts,
    currentAccount,
    isLoading,
    error,
    createAccount,
    switchToAccount,
    logout,
    exportAccountQR,
    importAccountQR,
    getAvailableSlot,
    isSlotOccupied,
    refreshAccounts: loadAllAccounts,
    clearError: () => setError(null)
  };
};
