
import { useState, useEffect } from 'react';
import { AccountDataManager } from '@/utils/accountDataManager';
import { useBulletproofAuth } from './useBulletproofAuth';

export const useAccountData = <T>(key: string, defaultValue: T) => {
  const { currentUser } = useBulletproofAuth();
  const [data, setData] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) {
        setData(defaultValue);
        setIsLoading(false);
        return;
      }

      try {
        const accountData = await AccountDataManager.getAccountData<T>(key, currentUser.id);
        setData(accountData !== null ? accountData : defaultValue);
      } catch (error) {
        console.error(`Failed to load account data for key ${key}:`, error);
        setData(defaultValue);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [key, currentUser?.id, defaultValue]);

  const updateData = async (newData: T) => {
    if (!currentUser) {
      console.warn('Cannot update data: No current user');
      return;
    }

    try {
      await AccountDataManager.storeAccountData(key, newData, currentUser.id);
      setData(newData);
      console.log(`Updated account data for ${currentUser.id}: ${key}`);
    } catch (error) {
      console.error(`Failed to update account data for key ${key}:`, error);
      throw error;
    }
  };

  return {
    data,
    setData: updateData,
    isLoading
  };
};

export default useAccountData;
