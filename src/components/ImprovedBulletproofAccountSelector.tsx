
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Shield, Clock, User } from 'lucide-react';
import { useBulletproofAccountManager } from '@/hooks/useBulletproofAccountManager';
import { spiritualIcons } from '@/utils/spiritualIdUtils';

interface ImprovedBulletproofAccountSelectorProps {
  onCreateAccount: (slot: number) => void;
  onSelectAccount: (slot: number) => void;
}

const ImprovedBulletproofAccountSelector: React.FC<ImprovedBulletproofAccountSelectorProps> = ({
  onCreateAccount,
  onSelectAccount
}) => {
  const { accounts, isLoading, deviceId } = useBulletproofAccountManager();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-200 dark:border-amber-800 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-amber-600 dark:text-amber-400 text-lg font-medium">
            Loading your device accounts...
          </div>
        </div>
      </div>
    );
  }

  const getAccountIcon = (account: any) => {
    if (!account) return null;
    
    // Try to find the spiritual icon
    const spiritualIcon = spiritualIcons.find(icon => 
      icon.id === account.symbol || icon.id === account.selectedIcon
    );
    
    if (spiritualIcon) {
      return spiritualIcon.symbol;
    }
    
    // Fallback to avatar or default
    return account.avatar || account.symbolImage || '🕉️';
  };

  const formatLastLogin = (lastLogin: string) => {
    const date = new Date(lastLogin);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border-amber-200/50 dark:border-zinc-700/50">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <CardTitle className="text-2xl font-bold">Choose Your Account</CardTitle>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Select an account to continue your spiritual journey
          </p>
          {deviceId && (
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-2">
              Device: {deviceId.slice(0, 16)}...
            </p>
          )}
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {accounts.map((slot) => (
              <Card 
                key={slot.slot}
                className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  slot.isEmpty 
                    ? 'border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-zinc-900/50' 
                    : 'border-amber-200 dark:border-amber-700 bg-gradient-to-br from-white to-amber-50 dark:from-zinc-800 dark:to-zinc-700'
                }`}
                onClick={() => slot.isEmpty ? onCreateAccount(slot.slot) : onSelectAccount(slot.slot)}
              >
                <CardContent className="p-6 text-center">
                  {slot.isEmpty ? (
                    <>
                      <div className="w-16 h-16 mx-auto mb-4 border-2 border-dashed border-gray-400 dark:border-gray-500 rounded-full flex items-center justify-center">
                        <Plus className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <h3 className="font-semibold text-gray-600 dark:text-gray-300 mb-2">
                        Account Slot {slot.slot}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Create new account
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full border-amber-300 text-amber-600 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-400 dark:hover:bg-amber-900/20"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Account
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {getAccountIcon(slot.account)}
                      </div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                        {slot.account?.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-mono">
                        {slot.account?.id.slice(0, 20)}...
                      </p>
                      <div className="flex items-center justify-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-4">
                        <Clock className="w-3 h-3" />
                        {slot.account?.lastLogin ? formatLastLogin(slot.account.lastLogin) : 'Never'}
                      </div>
                      <Button 
                        size="sm"
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Continue as {slot.account?.name.split(' ')[0]}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
            <p className="text-blue-700 dark:text-blue-300 text-sm font-medium mb-2">
              🔒 Bulletproof Account Security
            </p>
            <p className="text-blue-600 dark:text-blue-400 text-xs">
              Your accounts are permanently linked to this device with advanced fingerprinting
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImprovedBulletproofAccountSelector;
