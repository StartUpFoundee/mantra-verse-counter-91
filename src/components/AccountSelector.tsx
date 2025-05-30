
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Plus, Lock } from 'lucide-react';
import { useAccountManager } from '@/hooks/useAccountManager';
import { useAccountAuth } from '@/hooks/useAccountAuth';
import { format } from 'date-fns';

interface AccountSelectorProps {
  onCreateAccount: (slot: number) => void;
  onSelectAccount: (slot: number) => void;
}

const AccountSelector: React.FC<AccountSelectorProps> = ({
  onCreateAccount,
  onSelectAccount
}) => {
  const { accounts, isLoading } = useAccountManager();
  const { checkLockoutStatus, getRemainingLockoutTime } = useAccountAuth();

  const getAvatarInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatLastLogin = (lastLogin: string): string => {
    try {
      return format(new Date(lastLogin), 'MMM dd, yyyy');
    } catch {
      return 'Unknown';
    }
  };

  const formatLockoutTime = (timeMs: number): string => {
    const minutes = Math.ceil(timeMs / (1000 * 60));
    return `${minutes} min`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800">
      {/* Header */}
      <div className="pt-12 pb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
            <User className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Choose Account
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Select an account to continue your spiritual journey
        </p>
      </div>

      {/* Account Grid */}
      <div className="px-4 lg:px-8 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {accounts.map((accountSlot) => {
            const isLocked = checkLockoutStatus(accountSlot.slot);
            const lockoutTime = getRemainingLockoutTime(accountSlot.slot);

            return (
              <Card 
                key={accountSlot.slot}
                className="relative overflow-hidden border-2 hover:border-amber-300 dark:hover:border-amber-600 transition-all duration-300 hover:shadow-xl cursor-pointer"
              >
                <CardContent className="p-6">
                  {/* Slot Number */}
                  <div className="absolute top-4 right-4 w-8 h-8 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-amber-700 dark:text-amber-300">
                      {accountSlot.slot}
                    </span>
                  </div>

                  {accountSlot.isEmpty ? (
                    /* Empty Slot */
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Empty Slot
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Create a new account
                      </p>
                      <Button 
                        onClick={() => onCreateAccount(accountSlot.slot)}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                      >
                        Create Account
                      </Button>
                    </div>
                  ) : (
                    /* Occupied Slot */
                    <div className="text-center py-4">
                      <Avatar className="w-16 h-16 mx-auto mb-4">
                        <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white text-lg font-bold">
                          {getAvatarInitials(accountSlot.account!.name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {accountSlot.account!.name}
                      </h3>
                      
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-mono">
                        ID: {accountSlot.account!.id.slice(0, 12)}...
                      </p>
                      
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                        Last login: {formatLastLogin(accountSlot.account!.lastLogin)}
                      </p>

                      {isLocked ? (
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Lock className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                              Account Locked
                            </span>
                          </div>
                          <p className="text-xs text-red-500 mb-4">
                            Try again in {formatLockoutTime(lockoutTime)}
                          </p>
                          <Button disabled className="w-full">
                            Locked
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          onClick={() => onSelectAccount(accountSlot.slot)}
                          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                        >
                          Continue
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="text-center mt-12 pb-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Maximum 3 accounts per device • Accounts are stored locally and securely
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountSelector;
