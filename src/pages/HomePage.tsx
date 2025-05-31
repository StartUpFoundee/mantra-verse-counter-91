
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Hand, Infinity, Clock, Sparkles, Calendar } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import ProfileManager from "@/components/ProfileManager";
import WelcomePopup from "@/components/WelcomePopup";
import { getLifetimeCount, getTodayCount } from "@/utils/indexedDBUtils";
import { toast } from "@/components/ui/sonner";
import ModernCard from "@/components/ModernCard";
import StatsCard from "@/components/StatsCard";
import ActionCard from "@/components/ActionCard";
import { useBulletproofAuth } from "@/hooks/useBulletproofAuth";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, isLoading: authLoading } = useBulletproofAuth();
  const [lifetimeCount, setLifetimeCount] = useState<number>(0);
  const [todayCount, setTodayCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated || authLoading) return;
      
      setIsLoading(true);
      try {
        const lifetime = await getLifetimeCount();
        const today = await getTodayCount();
        
        setLifetimeCount(lifetime);
        setTodayCount(today);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("There was an error loading your data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [isAuthenticated, authLoading]);

  // Don't render anything if not authenticated - App.tsx will handle showing IdentitySystem
  if (!isAuthenticated) {
    return null;
  }

  // Show loading while data is being fetched
  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800">
        <div className="mb-6 text-amber-600 dark:text-amber-400 text-xl font-medium">
          Loading your spiritual journey...
        </div>
        <div className="relative">
          <div className="w-16 h-16 border-4 border-amber-200 dark:border-amber-800 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-amber-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800">
      <WelcomePopup />
      
      {/* Header */}
      <header className="relative px-4 lg:px-8 pt-6 lg:pt-8 pb-4 lg:pb-6">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Mantra Verse
              </h1>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300">
                {currentUser ? `Namaste, ${currentUser.name} Ji` : 'Spiritual Practice'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-3">
            <ThemeToggle />
            <ProfileManager />
          </div>
        </div>
      </header>
      
      <main className="px-4 lg:px-8 pb-24 lg:pb-32">
        <div className="max-w-6xl mx-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            <StatsCard
              title="Lifetime"
              value={lifetimeCount}
              subtitle="Total Jaaps"
              icon={Infinity}
              gradient="bg-gradient-to-br from-purple-400 to-purple-600"
            />
            
            <StatsCard
              title="Today"
              value={todayCount}
              subtitle="Daily Count"
              icon={Clock}
              gradient="bg-gradient-to-br from-emerald-400 to-emerald-600"
            />
            
            {/* Desktop only - additional stats cards */}
            <div className="hidden lg:block">
              <StatsCard
                title="This Week"
                value={Math.floor(lifetimeCount * 0.1)}
                subtitle="Weekly Progress"
                icon={Calendar}
                gradient="bg-gradient-to-br from-blue-400 to-blue-600"
              />
            </div>
            
            <div className="hidden lg:block">
              <StatsCard
                title="Average"
                value={Math.floor(lifetimeCount / 30)}
                subtitle="Per Day"
                icon={Sparkles}
                gradient="bg-gradient-to-br from-pink-400 to-pink-600"
              />
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="space-y-4 lg:space-y-6">
            <h2 className="text-lg lg:text-xl xl:text-2xl font-semibold text-gray-900 dark:text-white px-1">Choose Your Practice</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* Manual Counter Card */}
              <ActionCard
                title="Manual Counter"
                description="Tap screen, earphone or volume buttons"
                hindiDescription="हाथ से दबाएं या ईयरफोन/वॉल्यूम बटन का उपयोग करें"
                icon={Hand}
                gradient="bg-gradient-to-br from-amber-400 to-orange-500"
                onClick={() => navigate('/manual')}
              />
              
              {/* Audio Counter Card */}
              <ActionCard
                title="Audio Counter"
                description="Chant with 1 second pauses for auto-count"
                hindiDescription="मंत्र जाप करें, 1 सेकंड रुकें, काउंटर बढ़ेगा"
                icon={Mic}
                gradient="bg-gradient-to-br from-blue-400 to-purple-500"
                onClick={() => navigate('/audio')}
              />
            </div>
          </div>

          {/* Active Days Card */}
          <div className="mt-6 lg:mt-8">
            <ModernCard 
              onClick={() => navigate('/active-days')}
              className="p-6 lg:p-8 bg-gradient-to-r from-emerald-500 to-teal-600 text-white cursor-pointer hover:scale-[1.02] transition-all duration-300"
              glowEffect
            >
              <div className="flex items-center gap-4 lg:gap-6">
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Calendar className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg lg:text-xl xl:text-2xl font-semibold mb-1 lg:mb-2">Track Your Journey</h3>
                  <p className="text-sm lg:text-base text-emerald-100">View your practice streaks and active days</p>
                </div>
                <div className="text-2xl lg:text-3xl">🔥</div>
              </div>
            </ModernCard>
          </div>
        </div>
      </main>
      
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-t border-amber-200/50 dark:border-zinc-700/50 py-4 lg:py-6">
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm lg:text-base">
          Created with 🧡 for spiritual practice
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
