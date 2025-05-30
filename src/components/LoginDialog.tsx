
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Eye, EyeOff, Lock, AlertCircle } from 'lucide-react';
import { useAccountAuth } from '@/hooks/useAccountAuth';
import { useAccountManager } from '@/hooks/useAccountManager';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/components/ui/sonner';

interface LoginDialogProps {
  targetSlot: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const LoginDialog: React.FC<LoginDialogProps> = ({
  targetSlot,
  onSuccess,
  onCancel
}) => {
  const { login, authState, checkLockoutStatus, getRemainingLockoutTime } = useAccountAuth();
  const { accounts } = useAccountManager();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);

  const account = accounts.find(acc => acc.slot === targetSlot)?.account;

  useEffect(() => {
    const locked = checkLockoutStatus(targetSlot);
    setIsLocked(locked);
    
    if (locked) {
      const remaining = getRemainingLockoutTime(targetSlot);
      setLockoutTime(remaining);
      
      // Update countdown
      const interval = setInterval(() => {
        const newRemaining = getRemainingLockoutTime(targetSlot);
        setLockoutTime(newRemaining);
        
        if (newRemaining <= 0) {
          setIsLocked(false);
          clearInterval(interval);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [targetSlot, checkLockoutStatus, getRemainingLockoutTime]);

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
      toast.success('Login successful');
      onSuccess();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed';
      setError(errorMsg);
      
      if (errorMsg.includes('locked')) {
        setIsLocked(true);
        const remaining = getRemainingLockoutTime(targetSlot);
        setLockoutTime(remaining);
      }
    }
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 dark:text-gray-300">Account not found</p>
            <Button onClick={onCancel} className="mt-4">
              Back to Account Selection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
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
            <Avatar className="w-16 h-16 mx-auto mb-4">
              <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white text-lg font-bold">
                {getInitials(account.name)}
              </AvatarFallback>
            </Avatar>
            
            <CardTitle className="text-2xl font-bold">
              Welcome back, {account.name}
            </CardTitle>
            
            <p className="text-sm text-gray-500 mt-2 font-mono">
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
                    className={error ? 'border-red-500 pr-10' : 'pr-10'}
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

              {authState.loginAttempts > 0 && authState.loginAttempts < 3 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {3 - authState.loginAttempts} attempts remaining before account lockout
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={authState.isLoading || !password.trim()}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                {authState.isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : null}
                Login
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginDialog;
