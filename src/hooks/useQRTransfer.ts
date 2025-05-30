
import { useState } from 'react';
import { useAccountManager } from './useAccountManager';
import { QRCode } from '@/components/ui/qr-code';

export interface QRData {
  qrCode: string;
  lastGenerated: string;
  expiresAt: string;
}

export const useQRTransfer = () => {
  const { exportAccountQR, importAccountQR } = useAccountManager();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [currentQR, setCurrentQR] = useState<QRData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateQR = async (slot: number, includePassword: boolean = false): Promise<string> => {
    try {
      setIsGenerating(true);
      setError(null);

      const qrData = await exportAccountQR(slot, includePassword);
      const now = new Date();
      const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

      const qrInfo: QRData = {
        qrCode: qrData,
        lastGenerated: now.toISOString(),
        expiresAt: expires.toISOString()
      };

      setCurrentQR(qrInfo);
      return qrData;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to generate QR code';
      setError(error);
      throw new Error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const refreshQR = async (slot: number, includePassword: boolean = false): Promise<string> => {
    return await generateQR(slot, includePassword);
  };

  const importFromQR = async (qrData: string, targetSlot: number) => {
    try {
      setIsImporting(true);
      setError(null);

      const account = await importAccountQR(qrData, targetSlot);
      return account;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to import from QR code';
      setError(error);
      throw new Error(error);
    } finally {
      setIsImporting(false);
    }
  };

  const downloadQR = (format: 'png' | 'pdf' = 'png') => {
    if (!currentQR) {
      throw new Error('No QR code available to download');
    }

    try {
      // Create a temporary canvas to generate the QR image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Cannot create canvas context');

      const size = 400;
      canvas.width = size;
      canvas.height = size;

      // Create QR code image
      const img = new Image();
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(currentQR.qrCode)}&bgcolor=ffffff&color=000000&qzone=1&format=png`;
      
      img.onload = () => {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);

        // Convert to blob and download
        canvas.toBlob((blob) => {
          if (!blob) return;
          
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `account-backup-${new Date().getTime()}.${format}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, `image/${format}`);
      };

      img.src = qrCodeUrl;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to download QR code';
      setError(error);
      throw new Error(error);
    }
  };

  const isQRExpired = (): boolean => {
    if (!currentQR) return true;
    return new Date() > new Date(currentQR.expiresAt);
  };

  const getQRTimeRemaining = (): number => {
    if (!currentQR) return 0;
    const remaining = new Date(currentQR.expiresAt).getTime() - Date.now();
    return Math.max(0, remaining);
  };

  return {
    currentQR,
    isGenerating,
    isImporting,
    error,
    generateQR,
    refreshQR,
    importFromQR,
    downloadQR,
    isQRExpired,
    getQRTimeRemaining,
    clearError: () => setError(null)
  };
};
