
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useBulletproofAuth } from '@/hooks/useBulletproofAuth';
import IdentitySystem from '@/components/IdentitySystem';
import HomePage from '@/pages/HomePage';
import ActiveDaysPage from '@/pages/ActiveDaysPage';
import WelcomeScreen from '@/components/WelcomeScreen';
import { Toaster } from '@/components/ui/sonner';

function App() {
  const { isAuthenticated, isLoading, checkPersistedSession, clearSession } = useBulletproofAuth();
  const [showIdentitySystem, setShowIdentitySystem] = useState(false);
  const [hasCheckedSession, setHasCheckedSession] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      // Always clear any automatic session restoration
      // Users must explicitly login each time they return to the website
      await clearSession();
      
      // Check if any accounts exist on this device
      const hasAccounts = await checkPersistedSession();
      
      if (hasAccounts) {
        // If accounts exist, show the identity system (login required)
        setShowIdentitySystem(true);
      } else {
        // If no accounts exist, show welcome screen to create accounts
        setShowIdentitySystem(false);
      }
      
      setHasCheckedSession(true);
    };

    initializeAuth();
  }, []);

  const handleAuthSuccess = () => {
    setShowIdentitySystem(false);
  };

  const handleLogout = async () => {
    await clearSession();
    setShowIdentitySystem(true);
  };

  // Show loading while checking authentication state
  if (isLoading || !hasCheckedSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-200 dark:border-amber-800 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-amber-600 dark:text-amber-400 text-lg font-medium">
            Loading your spiritual journey...
          </div>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show identity system or welcome screen
  if (!isAuthenticated) {
    if (showIdentitySystem) {
      return (
        <>
          <IdentitySystem onAuthSuccess={handleAuthSuccess} />
          <Toaster />
        </>
      );
    } else {
      return (
        <>
          <WelcomeScreen />
          <Toaster />
        </>
      );
    }
  }

  // User is authenticated, show the main app
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800">
        <Routes>
          <Route path="/" element={<HomePage onLogout={handleLogout} />} />
          <Route path="/active-days" element={<ActiveDaysPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
