
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, UserPlus, Shield, Calendar, User, Lock } from 'lucide-react';
import { useBulletproofAuth } from '@/hooks/useBulletproofAuth';
import { toast } from '@/components/ui/sonner';
import SpiritualIconSelector from './SpiritualIconSelector';

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
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    selectedIcon: 'om',
    password: '',
    confirmPassword: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.name.trim().length >= 2;
      case 2:
        return !!formData.dob;
      case 3:
        return !!formData.selectedIcon;
      case 4:
        return formData.password.length >= 6 && formData.password === formData.confirmPassword;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsCreating(true);
    try {
      // Pass the selected symbol to createAccount
      await createAccount(formData.name.trim(), formData.dob, formData.password, formData.selectedIcon);
      toast.success('Account created successfully! Please login with your password.');
      onComplete();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create account');
    } finally {
      setIsCreating(false);
    }
  };

  const stepTitles = ['Name', 'Birth Date', 'Symbol', 'Password'];
  const stepIcons = [User, Calendar, Shield, Lock];

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

          {/* Progress */}
          <div className="space-y-3">
            <Progress value={(currentStep / 4) * 100} className="h-2" />
            <div className="flex justify-between">
              {stepTitles.map((title, index) => {
                const StepIcon = stepIcons[index];
                const stepNumber = index + 1;
                const isActive = currentStep === stepNumber;
                const isCompleted = currentStep > stepNumber;
                
                return (
                  <div key={title} className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      isCompleted ? 'bg-green-500 text-white' :
                      isActive ? 'bg-amber-500 text-white' :
                      'bg-gray-200 dark:bg-zinc-600 text-gray-500 dark:text-zinc-400'
                    }`}>
                      <StepIcon className="w-4 h-4" />
                    </div>
                    <span className={`text-xs ${
                      isActive ? 'text-amber-600 dark:text-amber-400 font-medium' :
                      'text-gray-500 dark:text-gray-400'
                    }`}>
                      {title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Step 1: Name */}
          {currentStep === 1 && (
            <div className="space-y-4 text-center">
              <div className="text-4xl mb-4">👋</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                What's your name?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                This will be displayed on your spiritual account
              </p>
              <Input
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-white/80 dark:bg-zinc-900/80 text-center text-lg h-12"
                autoFocus
              />
            </div>
          )}

          {/* Step 2: Date of Birth */}
          {currentStep === 2 && (
            <div className="space-y-4 text-center">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                When were you born?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                This helps create your unique spiritual identity
              </p>
              <Input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                className="bg-white/80 dark:bg-zinc-900/80 text-center text-lg h-12"
              />
            </div>
          )}

          {/* Step 3: Spiritual Symbol */}
          {currentStep === 3 && (
            <div className="space-y-4 text-center">
              <div className="text-4xl mb-4">🕉️</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Choose your spiritual symbol
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                This will represent you on your profile
              </p>
              <SpiritualIconSelector
                selectedIcon={formData.selectedIcon}
                onSelectIcon={(icon) => setFormData(prev => ({ ...prev, selectedIcon: icon }))}
              />
            </div>
          )}

          {/* Step 4: Password */}
          {currentStep === 4 && (
            <div className="space-y-4 text-center">
              <div className="text-4xl mb-4">🔐</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Secure your account
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Create a strong password to protect your spiritual journey
              </p>
              <div className="space-y-3">
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="bg-white/80 dark:bg-zinc-900/80 text-center h-12"
                />
                <Input
                  type="password"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="bg-white/80 dark:bg-zinc-900/80 text-center h-12"
                />
                {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-red-500 text-sm">Passwords do not match</p>
                )}
              </div>
            </div>
          )}
          
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
            <p className="text-blue-700 dark:text-blue-300 text-sm font-medium mb-2">
              🔒 Bulletproof Account Security
            </p>
            <p className="text-blue-600 dark:text-blue-400 text-xs">
              Your account will be permanently linked to this device with 15+ fingerprinting methods
            </p>
          </div>
          
          {/* Navigation */}
          <div className="flex gap-3 pt-4">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            
            <Button
              onClick={handleNext}
              disabled={!validateStep(currentStep) || isCreating}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              {isCreating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </div>
              ) : currentStep < 4 ? (
                <div className="flex items-center gap-2">
                  Next
                  <ArrowRight className="w-4 h-4" />
                </div>
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

export default BulletproofAccountCreation;
