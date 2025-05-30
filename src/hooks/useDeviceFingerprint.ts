
import { useState, useEffect } from 'react';
import { getCachedDeviceFingerprint, clearFingerprintCache } from '@/utils/deviceFingerprint';

export const useDeviceFingerprint = () => {
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateFingerprint = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fp = await getCachedDeviceFingerprint();
        setFingerprint(fp);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate device fingerprint');
      } finally {
        setIsLoading(false);
      }
    };

    generateFingerprint();
  }, []);

  const refreshFingerprint = async () => {
    clearFingerprintCache();
    const fp = await getCachedDeviceFingerprint();
    setFingerprint(fp);
    return fp;
  };

  return {
    fingerprint,
    isLoading,
    error,
    refreshFingerprint
  };
};
