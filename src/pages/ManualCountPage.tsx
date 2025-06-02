
import React from "react";
import { useNavigate } from "react-router-dom";
import ManualCounter from "@/components/ManualCounter";
import { ArrowLeft, Home, Sparkles } from "lucide-react";
import ModernCard from "@/components/ModernCard";

const ManualCountPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800">
      {/* Header - Mobile Responsive */}
      <header className="relative px-4 py-4 lg:px-8 lg:py-6">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <ModernCard 
            onClick={() => navigate('/')}
            className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform touch-manipulation"
          >
            <ArrowLeft className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700 dark:text-gray-300" />
          </ModernCard>
          
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg lg:rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </div>
            <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Manual Counter
            </h1>
          </div>
          
          <ModernCard 
            onClick={() => navigate('/')}
            className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform touch-manipulation"
          >
            <Home className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700 dark:text-gray-300" />
          </ModernCard>
        </div>
      </header>
      
      {/* Main Content - Mobile Optimized */}
      <main className="flex-1 px-4 pb-8 lg:px-8 lg:pb-12">
        <div className="max-w-6xl mx-auto">
          <ManualCounter />
        </div>
      </main>
    </div>
  );
};

export default ManualCountPage;
