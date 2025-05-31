
import React, { useState } from 'react';
import { useBulletproofAuth } from '@/hooks/useBulletproofAuth';
import BulletproofAccountSelector from './BulletproofAccountSelector';
import BulletproofAccountCreation from './BulletproofAccountCreation';
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

  const handleAccountCreated = () => {
    setCurrentView('selector');
    setSelectedSlot(null);
    onAuthSuccess();
  };

  const handleLoginSuccess = () => {
    setCurrentView('selector');
    setSelectedSlot(null);
    onAuthSuccess();
  };

  const handleCancel = () => {
    setCurrentView('selector');
    setSelectedSlot(null);
  };

  switch (currentView) {
    case 'create':
      return (
        <BulletproofAccountCreation
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
        <BulletproofAccountSelector
          onCreateAccount={handleCreateAccount}
          onSelectAccount={handleSelectAccount}
        />
      );
  }
};

export default IdentitySystem;
