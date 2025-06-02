
import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, LogOut, Settings, Key, Shield, Bell } from 'lucide-react';
import { useBulletproofAuth } from '@/hooks/useBulletproofAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import ChangePasswordDialog from './ChangePasswordDialog';
import AlarmSettingsDialog from './AlarmSettingsDialog';

const ProfileDropdown: React.FC = () => {
  const { currentUser, logout } = useBulletproofAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Profile clicked, navigating to /spiritual-id');
    navigate('/spiritual-id');
  };

  const handleAccountSettings = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Account settings clicked, navigating to /identity-guide');
    navigate('/identity-guide');
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!currentUser) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-white/20 dark:hover:bg-zinc-700/50">
          <Avatar className="h-10 w-10 border-2 border-white/20 shadow-lg">
            <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white text-sm font-bold">
              {getInitials(currentUser.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-64 bg-white/95 dark:bg-zinc-800/95 backdrop-blur-md border border-gray-200/50 dark:border-zinc-700/50 shadow-xl" 
        align="end" 
        forceMount
        side="bottom"
        sideOffset={8}
      >
        <DropdownMenuLabel className="font-normal p-4">
          <div className="flex flex-col space-y-2">
            <p className="text-base font-semibold leading-none text-gray-900 dark:text-white">
              {currentUser.name}
            </p>
            <p className="text-xs leading-none text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-zinc-700 px-2 py-1 rounded">
              {currentUser.id.slice(0, 20)}...
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-zinc-700/50" />
        
        <DropdownMenuItem 
          className="p-3 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/20 focus:bg-amber-50 dark:focus:bg-amber-900/20"
          onSelect={handleProfileClick}
        >
          <User className="mr-3 h-4 w-4 text-amber-600 dark:text-amber-400" />
          <span className="text-gray-700 dark:text-gray-200">Profile</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="p-3 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/20 focus:bg-amber-50 dark:focus:bg-amber-900/20"
          onSelect={handleAccountSettings}
        >
          <Shield className="mr-3 h-4 w-4 text-amber-600 dark:text-amber-400" />
          <span className="text-gray-700 dark:text-gray-200">Account Settings</span>
        </DropdownMenuItem>
        
        <AlarmSettingsDialog>
          <DropdownMenuItem 
            onSelect={(e) => e.preventDefault()}
            className="p-3 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/20 focus:bg-amber-50 dark:focus:bg-amber-900/20"
          >
            <Bell className="mr-3 h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-gray-700 dark:text-gray-200">Alarm Settings</span>
          </DropdownMenuItem>
        </AlarmSettingsDialog>
        
        <ChangePasswordDialog>
          <DropdownMenuItem 
            onSelect={(e) => e.preventDefault()}
            className="p-3 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/20 focus:bg-amber-50 dark:focus:bg-amber-900/20"
          >
            <Key className="mr-3 h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-gray-700 dark:text-gray-200">Change Password</span>
          </DropdownMenuItem>
        </ChangePasswordDialog>
        
        <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-zinc-700/50" />
        <DropdownMenuItem 
          onSelect={handleLogout}
          className="p-3 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 focus:bg-red-50 dark:focus:bg-red-900/20"
        >
          <LogOut className="mr-3 h-4 w-4 text-red-600 dark:text-red-400" />
          <span className="text-red-700 dark:text-red-300">Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
