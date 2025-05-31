
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, UserPlus, Calendar, Shield, Eye, EyeOff } from 'lucide-react';
import { useBulletproofAuth } from '@/hooks/useBulletproofAuth';
import { toast } from '@/components/ui/sonner';
import SpiritualIconSelector from './SpiritualIconSelector';

interface MultiStepAccountCreationProps {
  targetSlot: number;
  onComplete: (accountCreated: boolean) => void;
  onCancel: () => void;
}

const MultiStepAccountCreation: React.FC<MultiStepAccountCreationProps> = ({
  targetSlot,
  onComplete,
  onCancel
}) => {
  const { createAccount } = useBulletproofAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    selectedIcon: 'om',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const totalSteps = 4;

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        handleCreateAccount();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        if (!formData.name.trim()) {
          toast.error('Please enter your name');
          return false;
        }
        if (formData.name.trim().length < 2) {
          toast.error('Name must be at least 2 characters');
          return false;
        }
        break;
      case 2:
        if (!formData.dob) {
          toast.error('Please select your date of birth');
          return false;
        }
        break;
      case 3:
        // Icon selection is always valid since we have a default
        break;
      case 4:
        if (!formData.password) {
          toast.error('Password is required');
          return false;
        }
        if (formData.password.length < 6) {
          toast.error('Password must be at least 6 characters');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          return false;
        }
        break;
    }
    return true;
  };

  const handleCreateAccount = async () => {
    setIsCreating(true);
    try {
      await createAccount(formData.name.trim(), formData.dob, formData.password);
      toast.success('Account created successfully! Please login to continue.');
      onComplete(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create account');
    } finally {
      setIsCreating(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <UserPlus className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold">What's your name?</h3>
              <p className="text-sm text-gray-500">This will be displayed on your account</p>
            </div>
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-white/80 dark:bg-zinc-900/80"
                autoFocus
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Calendar className="w-12 h-12 text-blue-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold">When were you born?</h3>
              <p className="text-sm text-gray-500">This helps create your unique identity</p>
            </div>
            <div>
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                className="bg-white/80 dark:bg-zinc-900/80"
                autoFocus
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🕉️</div>
              <h3 className="text-lg font-semibold">Choose your spiritual symbol</h3>
              <p className="text-sm text-gray-500">Select an icon that represents your spiritual journey</p>
            </div>
            <SpiritualIconSelector
              selectedIcon={formData.selectedIcon}
              onSelectIcon={(icon) => setFormData(prev => ({ ...prev, selectedIcon: icon }))}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Shield className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold">Secure your account</h3>
              <p className="text-sm text-gray-500">Create a strong password to protect your data</p>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="bg-white/80 dark:bg-zinc-900/80 pr-10"
                  autoFocus
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="bg-white/80 dark:bg-zinc-900/80 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
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
          
          <div className="mt-4">
            <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span className={currentStep >= 1 ? 'text-amber-600 font-medium' : ''}>Name</span>
              <span className={currentStep >= 2 ? 'text-amber-600 font-medium' : ''}>Birth Date</span>
              <span className={currentStep >= 3 ? 'text-amber-600 font-medium' : ''}>Symbol</span>
              <span className={currentStep >= 4 ? 'text-amber-600 font-medium' : ''}>Password</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {renderStep()}
          
          <div className="flex gap-3 mt-6">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1"
                disabled={isCreating}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            
            <Button
              onClick={handleNext}
              disabled={isCreating}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              {isCreating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </div>
              ) : currentStep < totalSteps ? (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MultiStepAccountCreation;
