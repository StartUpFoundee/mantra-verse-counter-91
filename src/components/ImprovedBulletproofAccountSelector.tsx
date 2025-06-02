
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
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800 flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 lg:mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl">
              <Sparkles className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
            </div>
            <div className="text-6xl lg:text-7xl">🕉️</div>
          </div>
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-3">
            Choose Your Account
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg lg:text-xl font-medium max-w-2xl mx-auto">
            Select an account to continue your spiritual journey
          </p>
        </div>

        {/* Account Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
          {accounts.map((slot) => (
            <Card 
              key={slot.slot}
              className={`group cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border-2 ${
                slot.isEmpty 
                  ? 'border-dashed border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-zinc-800/60 hover:bg-white/80 dark:hover:bg-zinc-700/80 hover:border-amber-300 dark:hover:border-amber-600' 
                  : 'border-amber-200 dark:border-amber-700 bg-gradient-to-br from-white via-amber-50/50 to-orange-50/30 dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-600 shadow-lg hover:shadow-2xl hover:shadow-amber-200/50 dark:hover:shadow-amber-800/30'
              }`}
              onClick={() => slot.isEmpty ? onCreateAccount(slot.slot) : onSelectAccount(slot.slot)}
            >
              <CardContent className="p-6 lg:p-8 text-center">
                {slot.isEmpty ? (
                  <>
                    <div className="w-20 h-20 lg:w-24 lg:h-24 mx-auto mb-6 border-3 border-dashed border-gray-400 dark:border-gray-500 rounded-full flex items-center justify-center group-hover:border-amber-400 dark:group-hover:border-amber-500 transition-colors duration-300">
                      <Plus className="w-10 h-10 lg:w-12 lg:h-12 text-gray-500 dark:text-gray-400 group-hover:text-amber-500 transition-colors duration-300" />
                    </div>
                    <h3 className="font-bold text-xl lg:text-2xl text-gray-800 dark:text-gray-200 mb-3">
                      Account Slot {slot.slot}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-base lg:text-lg mb-6">
                      Create new spiritual identity
                    </p>
                    <Button 
                      className="w-full h-12 lg:h-14 text-base lg:text-lg font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Create Account
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 lg:w-24 lg:h-24 mx-auto mb-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white text-3xl lg:text-4xl font-bold shadow-2xl group-hover:shadow-3xl transition-shadow duration-300">
                      {getAccountIcon(slot.account)}
                    </div>
                    <h3 className="font-bold text-xl lg:text-2xl text-gray-900 dark:text-gray-100 mb-2 truncate">
                      {slot.account?.name}
                    </h3>
                    <div className="flex items-center justify-center gap-2 text-sm lg:text-base text-gray-600 dark:text-gray-300 mb-6">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">
                        {slot.account?.lastLogin ? formatLastLogin(slot.account.lastLogin) : 'Never'}
                      </span>
                    </div>
                    <Button 
                      className="w-full h-12 lg:h-14 text-base lg:text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <User className="w-5 h-5 mr-2" />
                      Continue as {slot.account?.name.split(' ')[0]}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Security Banner */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-200 dark:border-blue-800 shadow-lg">
          <CardContent className="p-6 lg:p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h3 className="text-xl lg:text-2xl font-bold text-blue-800 dark:text-blue-200">
                🔒 Bulletproof Account Security
              </h3>
            </div>
            <p className="text-blue-700 dark:text-blue-300 text-base lg:text-lg font-medium max-w-3xl mx-auto">
              Your accounts are permanently linked to this device with advanced fingerprinting technology. 
              Each account maintains complete data isolation for maximum privacy and security.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImprovedBulletproofAccountSelector;
