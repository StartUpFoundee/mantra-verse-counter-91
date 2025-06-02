
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Eye, EyeOff, Lock, AlertCircle, User } from 'lucide-react';
import { useBulletproofAuth } from '@/hooks/useBulletproofAuth';
import { useBulletproofAccountManager } from '@/hooks/useBulletproofAccountManager';
import { spiritualIcons } from '@/utils/spiritualIdUtils';
import { toast } from '@/components/ui/sonner';

interface BulletproofLoginDialogProps {
  targetSlot: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const BulletproofLoginDialog: React.FC<BulletproofLoginDialogProps> = ({
  targetSlot,
  onSuccess,
  onCancel
}) => {
  const { login, isLoading } = useBulletproofAuth();
  const { accounts } = useBulletproofAccountManager();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);

  const account = accounts.find(acc => acc.slot === targetSlot)?.account;
  const MAX_ATTEMPTS = 3;
  const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes

  useEffect(() => {
    // Check for existing lockout
    const lockoutKey = `lockout_slot_${targetSlot}`;
    const lockoutEnd = localStorage.getItem(lockoutKey);
    
    if (lockoutEnd) {
      const remaining = parseInt(lockoutEnd) - Date.now();
      if (remaining > 0) {
        setIsLocked(true);
        setLockoutTime(remaining);
        
        // Update countdown
        const interval = setInterval(() => {
          const newRemaining = parseInt(lockoutEnd) - Date.now();
          if (newRemaining <= 0) {
            setIsLocked(false);
            setLockoutTime(0);
            localStorage.removeItem(lockoutKey);
            clearInterval(interval);
          } else {
            setLockoutTime(newRemaining);
          }
        }, 1000);
        
        return () => clearInterval(interval);
      } else {
        localStorage.removeItem(lockoutKey);
      }
    }
  }, [targetSlot]);

  const getAccountIcon = (account: any) => {
    if (!account) return '🕉️';
    
    const spiritualIcon = spiritualIcons.find(icon => 
      icon.id === account.symbol || icon.id === account.selectedIcon
    );
    
    return spiritualIcon ? spiritualIcon.symbol : (account.avatar || '🕉️');
  };

  const formatLockoutTime = (timeMs: number): string => {
    const minutes = Math.floor(timeMs / (1000 * 60));
    const seconds = Math.floor((timeMs % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLocked) {
      toast.error('Account is temporarily locked');
      return;
    }

    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    try {
      await login(targetSlot, password);
      
      // Clear login attempts on success
      setLoginAttempts(0);
      localStorage.removeItem(`attempts_slot_${targetSlot}`);
      
      toast.success(`Welcome back, ${account?.name}!`);
      onSuccess();
      
    } catch (err) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      localStorage.setItem(`attempts_slot_${targetSlot}`, newAttempts.toString());
      
      const errorMsg = err instanceof Error ? err.message : 'Login failed';
      setError(errorMsg);
      
      if (newAttempts >= MAX_ATTEMPTS) {
        const lockoutEnd = Date.now() + LOCKOUT_DURATION;
        localStorage.setItem(`lockout_slot_${targetSlot}`, lockoutEnd.toString());
        setIsLocked(true);
        setLockoutTime(LOCKOUT_DURATION);
        
        toast.error('Too many failed attempts. Account locked for 5 minutes.');
      } else {
        toast.error(`${MAX_ATTEMPTS - newAttempts} attempts remaining`);
      }
    }
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-4">Account not found</p>
            <Button onClick={onCancel} variant="outline">
              Back to Account Selection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border-amber-200/50 dark:border-zinc-700/50">
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <span className="text-sm text-gray-500 ml-auto">
              Account Slot {targetSlot}
            </span>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {getAccountIcon(account)}
            </div>
            
            <CardTitle className="text-2xl font-bold mb-2">
              Welcome back!
            </CardTitle>
            
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              {account.name}
            </p>
            
            <p className="text-sm text-gray-500 font-mono">
              {account.id.slice(0, 20)}...
            </p>
          </div>
        </CardHeader>

        <CardContent>
          {isLocked ? (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400">
                <Lock className="w-5 h-5" />
                <span className="font-medium">Account Temporarily Locked</span>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Too many failed login attempts. Please wait before trying again.
              </p>
              
              <div className="text-2xl font-mono font-bold text-red-600 dark:text-red-400">
                {formatLockoutTime(lockoutTime)}
              </div>
              
              <Button onClick={onCancel} variant="outline" className="w-full">
                Back to Account Selection
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password" className="text-base font-medium">
                  Enter your password
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pr-10 h-12 ${error ? 'border-red-500' : 'border-amber-200'}`}
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {loginAttempts > 0 && loginAttempts < MAX_ATTEMPTS && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {MAX_ATTEMPTS - loginAttempts} attempts remaining before account lockout
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isLoading || !password.trim()}
                className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Logging in...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Login to Account
                  </div>
                )}
              </Button>
            </form>
          )}
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
            <p className="text-blue-700 dark:text-blue-300 text-sm font-medium mb-1">
              🔒 Secure Family Account
            </p>
            <p className="text-blue-600 dark:text-blue-400 text-xs">
              Your account data is protected and isolated from other family members
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulletproofLoginDialog;
