
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  QrCode, 
  Camera, 
  Upload, 
  Download, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle,
  X 
} from 'lucide-react';
import { useQRTransfer } from '@/hooks/useQRTransfer';
import { useAccountManager } from '@/hooks/useAccountManager';
import { QRCode } from '@/components/ui/qr-code';
import { toast } from '@/components/ui/sonner';
import { format } from 'date-fns';

interface QRManagerProps {
  currentSlot?: number;
}

const QRManager: React.FC<QRManagerProps> = ({ currentSlot }) => {
  const { 
    generateQR, 
    refreshQR, 
    importFromQR, 
    downloadQR, 
    currentQR, 
    isGenerating, 
    isImporting,
    error 
  } = useQRTransfer();
  
  const { getAvailableSlot, isSlotOccupied } = useAccountManager();
  
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importData, setImportData] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const handleGenerateQR = async () => {
    if (!currentSlot) {
      toast.error('No account selected');
      return;
    }

    try {
      await generateQR(currentSlot);
      setShowGenerateDialog(true);
    } catch (error) {
      toast.error('Failed to generate QR code');
    }
  };

  const handleRefreshQR = async () => {
    if (!currentSlot) return;

    try {
      await refreshQR(currentSlot);
      toast.success('QR code refreshed');
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

  const handleImportQR = async () => {
    if (!importData.trim()) {
      toast.error('Please enter QR data');
      return;
    }

    const targetSlot = getAvailableSlot();
    if (!targetSlot) {
      toast.error('No available account slots. Maximum 3 accounts allowed.');
      return;
    }

    try {
      await importFromQR(importData, targetSlot);
      toast.success(`Account imported to slot ${targetSlot}`);
      setShowImportDialog(false);
      setImportData('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to import account');
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setShowCamera(true);
    } catch (error) {
      toast.error('Unable to access camera');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const captureQR = () => {
    // This is a simplified QR capture - in production, you'd use a proper QR scanner library
    toast.info('QR scanning functionality would be implemented here with a proper QR scanner library');
    stopCamera();
  };

  return (
    <div className="space-y-4">
      {/* QR Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Generate QR */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Export Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Generate a QR code to transfer your account to another device
            </p>
            <Button 
              onClick={handleGenerateQR}
              disabled={!currentSlot || isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4 mr-2" />
                  Generate QR Code
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Import QR */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Import Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Import an account from another device using QR code
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => setShowImportDialog(true)}
                variant="outline"
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import from QR
              </Button>
              
              <Button 
                onClick={startCamera}
                variant="outline"
                className="w-full"
              >
                <Camera className="w-4 h-4 mr-2" />
                Scan QR Code
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Slots Info */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {getAvailableSlot() ? (
            `Account slot ${getAvailableSlot()} is available for import.`
          ) : (
            'All 3 account slots are occupied. Delete an account to import a new one.'
          )}
        </AlertDescription>
      </Alert>

      {/* Generate QR Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Account QR Code</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {currentQR && (
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg inline-block shadow-sm">
                  <QRCode 
                    value={currentQR.qrCode} 
                    size={200}
                    className="mx-auto"
                  />
                </div>
                
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-600">
                    Scan this QR code on your target device
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline">
                      Generated: {format(new Date(currentQR.lastGenerated), 'HH:mm')}
                    </Badge>
                    <Badge variant="outline">
                      Expires: {format(new Date(currentQR.expiresAt), 'MMM dd')}
                    </Badge>
                  </div>
                </div>
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
          </div>
        </DialogContent>
      </Dialog>

      {/* Import QR Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Account from QR</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">QR Code Data</label>
              <textarea
                className="w-full mt-2 p-3 border rounded-lg resize-none"
                rows={6}
                placeholder="Paste the QR code data here..."
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
              />
            </div>
            
            {getAvailableSlot() && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Account will be imported to slot {getAvailableSlot()}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowImportDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              
              <Button
                onClick={handleImportQR}
                disabled={isImporting || !importData.trim() || !getAvailableSlot()}
                className="flex-1"
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  'Import Account'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Camera Dialog */}
      <Dialog open={showCamera} onOpenChange={() => stopCamera()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Scan QR Code
              <Button variant="ghost" size="sm" onClick={stopCamera}>
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={stopCamera} className="flex-1">
                Cancel
              </Button>
              <Button onClick={captureQR} className="flex-1">
                <Camera className="w-4 h-4 mr-2" />
                Capture
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default QRManager;
