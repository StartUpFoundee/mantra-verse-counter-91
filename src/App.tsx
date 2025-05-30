
import React, { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AudioCountPage from "./pages/AudioCountPage";
import ManualCountPage from "./pages/ManualCountPage";
import SpiritualIdPage from "./pages/SpiritualIdPage";
import IdentityGuidePage from "./pages/IdentityGuidePage";
import ActiveDaysPage from "./pages/ActiveDaysPage";
import NotFound from "./pages/NotFound";
import IdentitySystem from "./components/IdentitySystem";
import { initializeDatabase } from "./utils/indexedDBUtils";
import { useAccountAuth } from "./hooks/useAccountAuth";

const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, currentUser } = useAccountAuth();
  const [dbInitialized, setDbInitialized] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Initialize IndexedDB when the app starts
  useEffect(() => {
    const init = async () => {
      try {
        await initializeDatabase();
        setDbInitialized(true);
      } catch (error) {
        console.error("Database initialization failed:", error);
        setDbInitialized(true); // Continue anyway with localStorage fallback
      }
    };
    init();
  }, []);

  // Wait for both database and auth to initialize
  useEffect(() => {
    if (dbInitialized && !isLoading) {
      setInitializing(false);
    }
  }, [dbInitialized, isLoading]);

  // Show loading screen while initializing
  if (initializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800">
        <div className="mb-6 text-amber-600 dark:text-amber-400 text-xl font-medium">
          {!dbInitialized ? 'Initializing database...' : 'Restoring your session...'}
        </div>
        <div className="relative">
          <div className="w-16 h-16 border-4 border-amber-200 dark:border-amber-800 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-amber-500 rounded-full animate-spin"></div>
        </div>
        {currentUser && (
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            Welcome back, {currentUser.name}
          </div>
        )}
      </div>
    );
  }

  // Show identity system if not authenticated
  if (!isAuthenticated) {
    return <IdentitySystem onAuthSuccess={() => {
      // Force navigation to home after successful auth
      window.location.href = '/';
    }} />;
  }

  // Show main app if authenticated
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/audio" element={<AudioCountPage />} />
      <Route path="/manual" element={<ManualCountPage />} />
      <Route path="/spiritual-id" element={<SpiritualIdPage />} />
      <Route path="/identity-guide" element={<IdentityGuidePage />} />
      <Route path="/active-days" element={<ActiveDaysPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
