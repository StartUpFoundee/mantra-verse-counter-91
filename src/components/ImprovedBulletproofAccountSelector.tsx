
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Shield, Clock, User, Sparkles } from 'lucide-react';
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
  const { accounts, isLoading } = useBulletproofAccountManager();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-200 dark:border-amber-800 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-amber-600 dark:text-amber-400 text-base font-medium">
            Loading accounts...
          </div>
        </div>
      </div>
    );
  }

  const getAccountIcon = (account: any) => {
    if (!account) return null;
    
    const spiritualIcon = spiritualIcons.find(icon => 
      icon.id === account.symbol || icon.id === account.selectedIcon
    );
    
    if (spiritualIcon) {
      return spiritualIcon.symbol;
    }
    
    return account.avatar || account.symbolImage || '🕉️';
  };

  const formatLastLogin = (lastLogin: string) => {
    const date = new Date(lastLogin);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Compact Header */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="text-3xl sm:text-4xl">🕉️</div>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
            Choose Your Account
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base font-medium max-w-xl mx-auto">
            Select an account to continue your spiritual journey
          </p>
        </div>

        {/* Compact Account Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {accounts.map((slot) => (
            <Card 
              key={slot.slot}
              className={`group cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl border-2 ${
                slot.isEmpty 
                  ? 'border-dashed border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-zinc-800/60 hover:bg-white/80 dark:hover:bg-zinc-700/80 hover:border-amber-300 dark:hover:border-amber-600' 
                  : 'border-amber-200 dark:border-amber-700 bg-gradient-to-br from-white via-amber-50/50 to-orange-50/30 dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-600 shadow-md hover:shadow-xl hover:shadow-amber-200/50 dark:hover:shadow-amber-800/30'
              }`}
              onClick={() => slot.isEmpty ? onCreateAccount(slot.slot) : onSelectAccount(slot.slot)}
            >
              <CardContent className="p-3 sm:p-4 text-center">
                {slot.isEmpty ? (
                  <>
                    <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 border-2 border-dashed border-gray-400 dark:border-gray-500 rounded-full flex items-center justify-center group-hover:border-amber-400 dark:group-hover:border-amber-500 transition-colors duration-300">
                      <Plus className="w-6 h-6 sm:w-7 sm:h-7 text-gray-500 dark:text-gray-400 group-hover:text-amber-500 transition-colors duration-300" />
                    </div>
                    <h3 className="font-bold text-base sm:text-lg text-gray-800 dark:text-gray-200 mb-2">
                      Account {slot.slot}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mb-3">
                      Create new identity
                    </p>
                    <Button 
                      className="w-full h-8 sm:h-10 text-xs sm:text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Create
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white text-lg sm:text-xl font-bold shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      {getAccountIcon(slot.account)}
                    </div>
                    <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-gray-100 mb-1 truncate">
                      {slot.account?.name}
                    </h3>
                    <div className="flex items-center justify-center gap-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3">
                      <Clock className="w-3 h-3" />
                      <span className="font-medium">
                        {slot.account?.lastLogin ? formatLastLogin(slot.account.lastLogin) : 'Never'}
                      </span>
                    </div>
                    <Button 
                      className="w-full h-8 sm:h-10 text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Continue as {slot.account?.name.split(' ')[0]}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Compact Security Banner */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-200 dark:border-blue-800 shadow-md">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base sm:text-lg font-bold text-blue-800 dark:text-blue-200">
                🔒 Secure Accounts
              </h3>
            </div>
            <p className="text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-medium max-w-2xl mx-auto">
              Your accounts are securely linked to this device with advanced encryption. 
              Complete data isolation for maximum privacy.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImprovedBulletproofAccountSelector;
