
import { useState, useEffect } from 'react';
import { UserAccount } from '@/utils/advancedIdUtils';
import { DeviceAccountManager, DeviceAccountSlot } from '@/utils/deviceAccountManager';
import { getBulletproofDeviceId } from '@/utils/enhancedDeviceFingerprint';

export const useBulletproofAccountManager = () => {
  const [accounts, setAccounts] = useState<DeviceAccountSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    loadDeviceAccounts();
  }, []);

  const loadDeviceAccounts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const deviceId = await getBulletproofDeviceId();
      setDeviceId(deviceId);
      
      const deviceAccounts = await DeviceAccountManager.getDeviceAccounts();
      setAccounts(deviceAccounts);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const createAccount = async (name: string, dob: string, password: string): Promise<UserAccount> => {
    try {
      const { account } = await DeviceAccountManager.createAccountOnDevice(name, dob, password);
      await loadDeviceAccounts(); // Refresh accounts
      return account;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to create account';
      setError(error);
      throw new Error(error);
    }
  };

  const switchToAccount = async (slot: number, password: string): Promise<UserAccount> => {
    try {
      const account = await DeviceAccountManager.switchToAccount(slot, password);
      await loadDeviceAccounts(); // Refresh to update last login
      return account;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to switch account';
      setError(error);
      throw new Error(error);
    }
  };

  const importAccount = async (qrData: string): Promise<UserAccount> => {
    try {
      const { account } = await DeviceAccountManager.importAccountToDevice(qrData);
      await loadDeviceAccounts(); // Refresh accounts
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

  const getAccountsCount = (): number => {
    return accounts.filter(acc => !acc.isEmpty).length;
  };

  const hasMaxAccounts = (): boolean => {
    return getAccountsCount() >= 3;
  };

  return {
    accounts,
    deviceId,
    isLoading,
    error,
    createAccount,
    switchToAccount,
    importAccount,
    getAvailableSlot,
    isSlotOccupied,
    getAccountsCount,
    hasMaxAccounts,
    refreshAccounts: loadDeviceAccounts,
    clearError: () => setError(null)
  };
};
