
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
      <Card className="w-full max-w-2xl bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm border-amber-200/70 dark:border-zinc-700/70 shadow-xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Choose Your Account</CardTitle>
          </div>
          <p className="text-gray-700 dark:text-gray-200 font-medium">
            Select an account to continue your spiritual journey
          </p>
          {deviceId && (
            <p className="text-xs text-gray-600 dark:text-gray-300 font-mono mt-2 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
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
                    ? 'border-2 border-dashed border-gray-400 dark:border-gray-500 bg-gray-50 dark:bg-zinc-900/70 hover:bg-gray-100 dark:hover:bg-zinc-800/70' 
                    : 'border-amber-300 dark:border-amber-600 bg-gradient-to-br from-white to-amber-50 dark:from-zinc-800 dark:to-zinc-700/80 hover:shadow-amber-200/50 dark:hover:shadow-amber-800/30'
                }`}
                onClick={() => slot.isEmpty ? onCreateAccount(slot.slot) : onSelectAccount(slot.slot)}
              >
                <CardContent className="p-6 text-center">
                  {slot.isEmpty ? (
                    <>
                      <div className="w-16 h-16 mx-auto mb-4 border-2 border-dashed border-gray-500 dark:border-gray-400 rounded-full flex items-center justify-center">
                        <Plus className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                      </div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        Account Slot {slot.slot}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        Create new account
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full border-amber-400 text-amber-700 hover:bg-amber-50 dark:border-amber-500 dark:text-amber-300 dark:hover:bg-amber-900/20 font-medium"
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
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-lg">
                        {slot.account?.name}
                      </h3>
                      <p className="text-xs text-gray-700 dark:text-gray-300 mb-1 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {slot.account?.id.slice(0, 20)}...
                      </p>
                      <div className="flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-gray-300 mb-4">
                        <Clock className="w-3 h-3" />
                        <span className="font-medium">
                          {slot.account?.lastLogin ? formatLastLogin(slot.account.lastLogin) : 'Never'}
                        </span>
                      </div>
                      <Button 
                        size="sm"
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium shadow-md"
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
          
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-center border border-blue-200 dark:border-blue-800">
            <p className="text-blue-800 dark:text-blue-200 text-sm font-semibold mb-2">
              🔒 Bulletproof Account Security
            </p>
            <p className="text-blue-700 dark:text-blue-300 text-xs font-medium">
              Your accounts are permanently linked to this device with advanced fingerprinting
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImprovedBulletproofAccountSelector;
