
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  LogOut, 
  Copy, 
  QrCode, 
  RefreshCw, 
  Download, 
  Settings,
  CheckCircle,
  Upload
} from 'lucide-react';
import { useAccountAuth } from '@/hooks/useAccountAuth';
import { useQRTransfer } from '@/hooks/useQRTransfer';
import { QRCode } from '@/components/ui/qr-code';
import { toast } from '@/components/ui/sonner';
import { format } from 'date-fns';

const ProfileManager: React.FC = () => {
  const { currentUser, logout } = useAccountAuth();
  const { generateQR, refreshQR, downloadQR, currentQR, isGenerating } = useQRTransfer();
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  if (!currentUser) return null;

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(currentUser.id);
      setCopiedId(true);
      toast.success('User ID copied to clipboard');
      setTimeout(() => setCopiedId(false), 2000);
    } catch (error) {
      toast.error('Failed to copy ID');
    }
  };

  const handleGenerateQR = async () => {
    try {
      await generateQR(currentUser.slot);
      setShowQRDialog(true);
    } catch (error) {
      toast.error('Failed to generate QR code');
    }
  };

  const handleRefreshQR = async () => {
    try {
      await refreshQR(currentUser.slot);
      toast.success('QR code updated with latest data');
    } catch (error) {
      toast.error('Failed to refresh QR code');
    }
  };

  const handleDownloadQR = () => {
    try {
      downloadQR('png');
      toast.success('QR code downloaded');
    } catch (error) {
      toast.error('Failed to download QR code');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      // Redirect to identity system
      window.location.href = '/';
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold text-lg">
                {currentUser.avatar || getInitials(currentUser.name)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-80 p-0" align="end" forceMount>
          {/* Profile Header */}
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold text-xl">
                  {currentUser.avatar || getInitials(currentUser.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white truncate">
                  {currentUser.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    Account {currentUser.slot}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    Since {format(new Date(currentUser.createdAt), 'MMM yyyy')}
                  </span>
                </div>
              </div>
            </div>
            
            {/* User ID with Copy */}
            <div className="mt-3 p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">User ID</p>
                  <p className="font-mono text-sm text-gray-900 dark:text-white truncate">
                    {currentUser.id}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyId}
                  className="ml-2 h-8 w-8 p-0"
                >
                  {copiedId ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* QR Code Actions */}
          <div className="p-2">
            <DropdownMenuItem onClick={handleGenerateQR} disabled={isGenerating}>
              <QrCode className="mr-2 h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Export QR Code'}
            </DropdownMenuItem>
          </div>

          <DropdownMenuSeparator />

          {/* Settings & Logout */}
          <div className="p-2">
            <DropdownMenuItem disabled>
              <Settings className="mr-2 h-4 w-4" />
              Settings
              <Badge variant="secondary" className="ml-auto text-xs">Soon</Badge>
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Export Account</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {currentQR && (
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg inline-block shadow-sm border">
                  <QRCode 
                    value={currentQR.qrCode} 
                    size={200}
                    className="mx-auto"
                  />
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-3">
                  Scan this QR code to import your account on another device
                </p>
                
                <p className="text-xs text-gray-400 mt-1">
                  Generated: {format(new Date(currentQR.lastGenerated), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleRefreshQR}
                disabled={isGenerating}
                className="flex-1"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button
                variant="outline"
                onClick={handleDownloadQR}
                disabled={!currentQR}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400 p-2 bg-amber-50 dark:bg-amber-900/20 rounded">
              💡 Use this QR code to transfer your account to another device. 
              Import it using the "Import Account" option on the target device.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileManager;
