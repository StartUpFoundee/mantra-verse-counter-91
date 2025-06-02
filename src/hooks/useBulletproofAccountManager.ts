
import { useState, useEffect } from 'react';
import { DeviceAccountManager, DeviceAccountSlot } from '@/utils/deviceAccountManager';
import { getBulletproofDeviceId } from '@/utils/enhancedDeviceFingerprint';

export const useBulletproofAccountManager = () => {
  const [accounts, setAccounts] = useState<DeviceAccountSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deviceId, setDeviceId] = useState<string>('');

  const loadAccounts = async () => {
    try {
      setIsLoading(true);
      
      // Get device ID
      const id = await getBulletproofDeviceId();
      setDeviceId(id);
      
      // Load all accounts for this device
      const deviceAccounts = await DeviceAccountManager.getDeviceAccounts();
      setAccounts(deviceAccounts);
      
    } catch (error) {
      console.error('Failed to load accounts:', error);
      // Initialize empty slots on error
      setAccounts([
        { slot: 1, account: null, isEmpty: true, deviceId: '' },
        { slot: 2, account: null, isEmpty: true, deviceId: '' },
        { slot: 3, account: null, isEmpty: true, deviceId: '' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const hasMaxAccounts = () => {
    return accounts.filter(slot => !slot.isEmpty).length >= 3;
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  return {
    accounts,
    isLoading,
    deviceId,
    refreshAccounts: loadAccounts,
    hasMaxAccounts
  };
};
