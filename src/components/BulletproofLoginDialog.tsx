
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, LogIn, Shield } from 'lucide-react';
import { useBulletproofAuth } from '@/hooks/useBulletproofAuth';
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
  const { login } = useBulletproofAuth();
  const [password, setPassword] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      toast.error('Please enter your password');
      return;
    }

    setIsLogging(true);
    try {
      await login(targetSlot, password);
      toast.success('Login successful! Welcome back!');
      
      // Small delay to ensure state is updated before redirect
      setTimeout(() => {
        onSuccess();
      }, 100);
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
      setIsLogging(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border-amber-200/50 dark:border-zinc-700/50">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-xl">Login to Account - Slot {targetSlot}</CardTitle>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/80 dark:bg-zinc-900/80"
                autoFocus
              />
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
              <p className="text-green-700 dark:text-green-300 text-sm font-medium mb-2">
                🔐 Device Verified
              </p>
              <p className="text-green-600 dark:text-green-400 text-xs">
                This device has been recognized. Your account data is ready to load.
              </p>
            </div>
            
            <Button
              type="submit"
              disabled={isLogging}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {isLogging ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Logging in...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Login
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulletproofLoginDialog;
