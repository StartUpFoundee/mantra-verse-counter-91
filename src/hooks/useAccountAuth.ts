
import { useState, useEffect } from 'react';
import { UserAccount } from '@/utils/advancedIdUtils';
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

export const useAccountAuth = () => {
  const { currentAccount, switchToAccount, logout: accountLogout } = useAccountManager();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    currentUser: null,
    isLoading: true,
    loginAttempts: 0,
    isLocked: false
  });

  useEffect(() => {
    setAuthState(prev => ({
      ...prev,
      isAuthenticated: !!currentAccount,
      currentUser: currentAccount,
      isLoading: false
    }));
  }, [currentAccount]);

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
