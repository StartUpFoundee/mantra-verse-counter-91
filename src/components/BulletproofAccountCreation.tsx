
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, UserPlus, Shield } from 'lucide-react';
import { useBulletproofAuth } from '@/hooks/useBulletproofAuth';
import { toast } from '@/components/ui/sonner';

interface BulletproofAccountCreationProps {
  targetSlot: number;
  onComplete: () => void;
  onCancel: () => void;
}

const BulletproofAccountCreation: React.FC<BulletproofAccountCreationProps> = ({
  targetSlot,
  onComplete,
  onCancel
}) => {
  const { createAccount } = useBulletproofAuth();
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    password: '',
    confirmPassword: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsCreating(true);
    try {
      await createAccount(formData.name, formData.dob, formData.password);
      toast.success('Account created successfully!');
      onComplete();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create account');
    } finally {
      setIsCreating(false);
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
              <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <CardTitle className="text-xl">Create Account - Slot {targetSlot}</CardTitle>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                className="bg-white/80 dark:bg-zinc-900/80"
              />
            </div>
            
            <div>
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                required
                className="bg-white/80 dark:bg-zinc-900/80"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
                minLength={6}
                className="bg-white/80 dark:bg-zinc-900/80"
              />
            </div>
            
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                required
                minLength={6}
                className="bg-white/80 dark:bg-zinc-900/80"
              />
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
              <p className="text-blue-700 dark:text-blue-300 text-sm font-medium mb-2">
                🔒 Bulletproof Account Security
              </p>
              <p className="text-blue-600 dark:text-blue-400 text-xs">
                Your account will be permanently linked to this device with 15+ fingerprinting methods
              </p>
            </div>
            
            <Button
              type="submit"
              disabled={isCreating}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              {isCreating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Account...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulletproofAccountCreation;
