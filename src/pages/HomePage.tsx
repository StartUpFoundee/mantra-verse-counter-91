import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Pause, RotateCcw, Calendar, LogOut, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useBulletproofAuth } from "@/hooks/useBulletproofAuth";
import { updateMantraCounts, getLifetimeCount, getTodayCount } from "@/utils/indexedDBUtils";
import { recordDailyActivity, getStreakData } from "@/utils/activityUtils";
import { Link } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

interface HomePageProps {
  onLogout: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onLogout }) => {
  const { currentUser, logout } = useBulletproofAuth();
  const [isChanting, setIsChanting] = useState(false);
  const [mantraCount, setMantraCount] = useState(0);
  const [lifetimeCount, setLifetimeCount] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [incrementBy, setIncrementBy] = useState(1);
  const [streakData, setStreakData] = useState({ currentStreak: 0, maxStreak: 0, totalActiveDays: 0 });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadCounts();
    loadStreakData();
  }, []);

  const loadCounts = async () => {
    try {
      const lifetime = await getLifetimeCount();
      const today = await getTodayCount();
      setLifetimeCount(lifetime);
      setTodayCount(today);
    } catch (error) {
      console.error("Error loading counts:", error);
    }
  };

  const loadStreakData = async () => {
    try {
      const data = await getStreakData();
      setStreakData(data);
    } catch (error) {
      console.error("Error loading streak data:", error);
    }
  };

  const handleChantToggle = async () => {
    setIsChanting(!isChanting);
    if (!isChanting) {
      startChanting();
    }
  };

  const startChanting = async () => {
    setIsUpdating(true);
    try {
      const { lifetimeCount: newLifetime, todayCount: newToday } = await updateMantraCounts(incrementBy);
      setLifetimeCount(newLifetime);
      setTodayCount(newToday);
      setMantraCount(prevCount => prevCount + incrementBy);
      await recordDailyActivity(incrementBy);
      await loadStreakData();
    } catch (error) {
      console.error("Error updating mantra count:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetToday = () => {
    setMantraCount(0);
    setTodayCount(0);
  };

  const handleIncrementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setIncrementBy(isNaN(value) ? 1 : value);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      onLogout();
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with user info and logout */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {currentUser?.avatar || '🕉️'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-amber-800 dark:text-amber-200">
                Welcome, {currentUser?.name || 'Spiritual Seeker'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Continue your spiritual journey
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Link to="/active-days">
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Activity
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Account Info Card */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200/50 dark:border-blue-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-semibold text-blue-800 dark:text-blue-200">
                    Account Slot {currentUser?.slot}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-mono">
                    ID: {currentUser?.id.slice(0, 20)}...
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                Family Account {currentUser?.slot}/3
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chanting Section */}
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-zinc-800 dark:to-zinc-700 border-amber-200/50 dark:border-zinc-700/50">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-amber-700 dark:text-amber-300 mb-4">
                Start Chanting Now
              </h2>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Today's Count:
                  </p>
                  <p className="text-2xl font-semibold text-orange-700 dark:text-orange-300">
                    {todayCount}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Lifetime Count:
                  </p>
                  <p className="text-2xl font-semibold text-orange-700 dark:text-orange-300">
                    {lifetimeCount}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <Input
                  type="number"
                  placeholder="Increment By"
                  value={incrementBy}
                  onChange={handleIncrementChange}
                  className="w-24 text-center bg-white/80 dark:bg-zinc-900/80 border-gray-300/50 dark:border-zinc-600/50"
                />
                <Button
                  className="w-32 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                  onClick={handleChantToggle}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                  ) : isChanting ? (
                    <Pause className="mr-2 h-4 w-4" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  {isUpdating ? "Updating..." : isChanting ? "Pause" : "Chant"}
                </Button>
              </div>

              <Button
                variant="secondary"
                onClick={handleResetToday}
                className="w-full text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-zinc-800/50"
              >
                Reset Today's Count
              </Button>
            </CardContent>
          </Card>

          {/* Streak and Stats Section */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-zinc-800 dark:to-zinc-700 border-blue-200/50 dark:border-zinc-700/50">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-blue-700 dark:text-blue-300 mb-4">
                Your Spiritual Stats
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Current Streak:
                  </p>
                  <p className="text-2xl font-semibold text-indigo-700 dark:text-indigo-300">
                    {streakData.currentStreak} days
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Max Streak:
                  </p>
                  <p className="text-2xl font-semibold text-indigo-700 dark:text-indigo-300">
                    {streakData.maxStreak} days
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Total Active Days:
                  </p>
                  <p className="text-2xl font-semibold text-indigo-700 dark:text-indigo-300">
                    {streakData.totalActiveDays} days
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Separator */}
        <Separator className="my-6" />

        {/* Tips and Motivation */}
        <Card className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border-gray-200/50 dark:border-zinc-700/50">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-green-700 dark:text-green-300 mb-4">
              Daily Motivation
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              "The mind is everything. What you think you become." - Buddha
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Take a moment to reflect on this quote as you continue your
              chanting practice.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
