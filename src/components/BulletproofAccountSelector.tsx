
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  User, 
  Calendar, 
  Upload, 
  QrCode, 
  FileText,
  AlertCircle,
  Shield,
  Fingerprint
} from 'lucide-react';
import { useBulletproofAccountManager } from '@/hooks/useBulletproofAccountManager';
import { useBulletproofAuth } from '@/hooks/useBulletproofAuth';
import { toast } from '@/components/ui/sonner';
import { format } from 'date-fns';
import { spiritualIcons } from '@/utils/spiritualIdUtils';

interface BulletproofAccountSelectorProps {
  onCreateAccount: (slot: number) => void;
  onSelectAccount: (slot: number) => void;
}

const BulletproofAccountSelector: React.FC<BulletproofAccountSelectorProps> = ({
  onCreateAccount,
  onSelectAccount
}) => {
  const { accounts, deviceId, isLoading, hasMaxAccounts } = useBulletproofAccountManager();
  const { importAccount } = useBulletproofAuth();
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [qrData, setQrData] = useState('');
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getSpiritualSymbol = (symbolId: string): string => {
    const icon = spiritualIcons.find(icon => icon.id === symbolId);
    return icon?.symbol || '🕉️';
  };

  const formatAccountDate = (dateString: string | undefined): string => {
    if (!dateString) {
      return 'Unknown date';
    }
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return format(date, 'MMM yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const handleImportAccount = () => {
    if (hasMaxAccounts()) {
      toast.error('Device limit reached. Maximum 3 accounts per device.');
      return;
    }
    setShowImportDialog(true);
  };

  const handleQRImport = async () => {
    if (!qrData.trim()) {
      toast.error('Please provide QR code data');
      return;
    }

    setImporting(true);
    try {
      await importAccount(qrData);
      toast.success('Account imported successfully!');
      setShowImportDialog(false);
      setQrData('');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to import account. Please check your QR code.');
    } finally {
      setImporting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      try {
        const parsed = JSON.parse(result);
        if (parsed.account) {
          setQrData(btoa(result));
        } else {
          setQrData(result);
        }
      } catch {
        setQrData(result);
      }
    };
    reader.readAsText(file);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800">
        <div className="mb-6 text-amber-600 dark:text-amber-400 text-xl font-medium">
          Loading your device accounts...
        </div>
        <div className="relative">
          <div className="w-16 h-16 border-4 border-amber-200 dark:border-amber-800 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-amber-500 rounded-full animate-spin"></div>
        </div>
        {deviceId && (
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 font-mono">
            Device ID: {deviceId}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🕉️</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
            Mantra Verse
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            Choose or create your spiritual identity
          </p>
          
          {/* Device Info */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Shield className="w-4 h-4" />
            <span>Bulletproof Device Recognition</span>
            <Fingerprint className="w-4 h-4" />
          </div>
          {deviceId && (
            <div className="mt-1 text-xs text-gray-400 dark:text-gray-500 font-mono">
              Device: {deviceId}
            </div>
          )}
        </div>

        {/* Account Usage Info */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-lg border border-amber-200/50 dark:border-zinc-700/50">
            <User className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {accounts.filter(acc => !acc.isEmpty).length} / 3 accounts used on this device
            </span>
          </div>
        </div>

        {/* Account Slots */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {accounts.map((accountSlot) => (
            <Card 
              key={accountSlot.slot}
              className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border-amber-200/50 dark:border-zinc-700/50 hover:shadow-lg transition-all duration-300"
            >
              {accountSlot.isEmpty ? (
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-zinc-600 dark:to-zinc-700 flex items-center justify-center">
                    <Plus className="w-8 h-8 text-gray-500 dark:text-zinc-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Slot {accountSlot.slot}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Create a new account
                  </p>
                  <Button
                    onClick={() => onCreateAccount(accountSlot.slot)}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    disabled={hasMaxAccounts()}
                  >
                    Create Account
                  </Button>
                </CardContent>
              ) : (
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold text-2xl">
                        {accountSlot.account?.symbol ? getSpiritualSymbol(accountSlot.account.symbol) : getInitials(accountSlot.account?.name || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {accountSlot.account?.name}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        Slot {accountSlot.slot}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <User className="w-4 h-4" />
                      <span className="font-mono text-xs">
                        {accountSlot.account?.id.slice(0, 20)}...
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Created {formatAccountDate(accountSlot.account?.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => onSelectAccount(accountSlot.slot)}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    Enter Password
                  </Button>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Import Account Button */}
        <div className="text-center space-y-2">
          <Button
            variant="outline"
            onClick={handleImportAccount}
            className="bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm border-amber-200/50 dark:border-zinc-700/50"
            disabled={hasMaxAccounts()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import Account from QR
          </Button>
          
          {hasMaxAccounts() && (
            <p className="text-sm text-orange-600 dark:text-orange-400 flex items-center justify-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Device limit reached (3/3 accounts)
            </p>
          )}
          
          <p className="text-xs text-gray-500 dark:text-gray-400">
            ✅ This device will remember your accounts even after 100 days, cache clearing, or browser updates
          </p>
        </div>
      </div>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Account to This Device</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Import an account from another device using QR code data.
              This will use one of your remaining account slots.
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="qr-data">QR Code Data</Label>
              <textarea
                id="qr-data"
                value={qrData}
                onChange={(e) => setQrData(e.target.value)}
                placeholder="Paste your QR code data here..."
                className="w-full h-32 p-3 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-sm font-mono"
              />
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".txt,.json"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  size="sm"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Load from File
                </Button>
                <span className="text-xs text-gray-500">or paste data above</span>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowImportDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleQRImport}
                disabled={importing || !qrData.trim()}
                className="flex-1"
              >
                {importing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <QrCode className="w-4 h-4 mr-2" />
                )}
                Import
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BulletproofAccountSelector;
