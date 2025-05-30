
import React, { useState } from 'react';
import { useAccountAuth } from '@/hooks/useAccountAuth';
import { useAccountManager } from '@/hooks/useAccountManager';
import AccountSelector from './AccountSelector';
import AccountCreation from './AccountCreation';
import LoginDialog from './LoginDialog';

export type IdentityView = 'selector' | 'create' | 'login';

interface IdentitySystemProps {
  onAuthSuccess: () => void;
}

const IdentitySystem: React.FC<IdentitySystemProps> = ({ onAuthSuccess }) => {
  const { isAuthenticated } = useAccountAuth();
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
        <AccountCreation
          targetSlot={selectedSlot!}
          onComplete={handleAccountCreated}
          onCancel={handleCancel}
        />
      );

    case 'login':
      return (
        <LoginDialog
          targetSlot={selectedSlot!}
          onSuccess={handleLoginSuccess}
          onCancel={handleCancel}
        />
      );

    default:
      return (
        <AccountSelector
          onCreateAccount={handleCreateAccount}
          onSelectAccount={handleSelectAccount}
        />
      );
  }
};

export default IdentitySystem;
