
import React, { useState } from 'react';
import { useBulletproofAuth } from '@/hooks/useBulletproofAuth';
import ImprovedBulletproofAccountSelector from './ImprovedBulletproofAccountSelector';
import MultiStepAccountCreation from './MultiStepAccountCreation';
import BulletproofLoginDialog from './BulletproofLoginDialog';

export type IdentityView = 'selector' | 'create' | 'login';

interface IdentitySystemProps {
  onAuthSuccess: () => void;
}

const IdentitySystem: React.FC<IdentitySystemProps> = ({ onAuthSuccess }) => {
  const { isAuthenticated } = useBulletproofAuth();
  const [currentView, setCurrentView] = useState<IdentityView>('selector');
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  // If authenticated, don't show identity system
  if (isAuthenticated) {
    return null;
  }

  const handleCreateAccount = (slot: number) => {
    setSelectedSlot(slot);
    setCurrentView('create');
  };

  const handleSelectAccount = (slot: number) => {
    setSelectedSlot(slot);
    setCurrentView('login');
  };

  const handleAccountCreated = (accountCreated: boolean) => {
    if (accountCreated) {
      // Account was created and user is automatically logged in
      onAuthSuccess();
    } else {
      // User cancelled or error occurred, go back to selector
      setCurrentView('selector');
      setSelectedSlot(null);
    }
  };

  const handleLoginSuccess = () => {
    // User successfully logged in, trigger auth success to redirect to home
    onAuthSuccess();
  };

  const handleCancel = () => {
    setCurrentView('selector');
    setSelectedSlot(null);
  };

  switch (currentView) {
    case 'create':
      return (
        <MultiStepAccountCreation
          targetSlot={selectedSlot!}
          onComplete={handleAccountCreated}
          onCancel={handleCancel}
        />
      );

    case 'login':
      return (
        <BulletproofLoginDialog
          targetSlot={selectedSlot!}
          onSuccess={handleLoginSuccess}
          onCancel={handleCancel}
        />
      );

    default:
      return (
        <ImprovedBulletproofAccountSelector
          onCreateAccount={handleCreateAccount}
          onSelectAccount={handleSelectAccount}
        />
      );
  }
};

export default IdentitySystem;
