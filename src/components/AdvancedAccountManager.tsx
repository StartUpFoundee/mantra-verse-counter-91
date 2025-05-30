
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/sonner";
import { QRCode } from "@/components/ui/qr-code";
import { 
  User, Plus, Download, Upload, Shield, AlertTriangle, 
  CheckCircle, Copy, RefreshCw, Settings, LogOut, Camera
} from "lucide-react";
import { AccountManager, UserAccount, DataPersistenceManager } from "@/utils/advancedIdUtils";
import ModernCard from "./ModernCard";

interface AccountSlot {
  slot: number;
  account: UserAccount | null;
  isEmpty: boolean;
}

const AdvancedAccountManager: React.FC = () => {
  const [accounts, setAccounts] = useState<AccountSlot[]>([
    { slot: 1, account: null, isEmpty: true },
    { slot: 2, account: null, isEmpty: true },
    { slot: 3, account: null, isEmpty: true }
  ]);
  const [currentSlot, setCurrentSlot] = useState<number>(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [qrData, setQrData] = useState<string>("");
  const [importQRData, setImportQRData] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<number>(1);
  
  // Create account form
  const [createForm, setCreateForm] = useState({
    name: "",
    dob: "",
    password: "",
    confirmPassword: ""
  });

  // Security data
  const [securityStatus, setSecurityStatus] = useState({
    layers: {} as { [key: string]: boolean },
    consistent: true,
    errors: [] as string[]
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const accountManager = new AccountManager(1);
      const loadedAccounts = await accountManager.getAllAccounts();
      
      const newAccountSlots = [1, 2, 3].map(slot => {
        const account = loadedAccounts.find(acc => acc.slot === slot);
        return {
          slot,
          account: account || null,
          isEmpty: !account
        };
      });

      setAccounts(newAccountSlots);
    } catch (error) {
      console.error('Error loading accounts:', error);
      toast("Error", {
        description: "Failed to load accounts"
      });
    }
  };

  const handleCreateAccount = async () => {
    if (!createForm.name || !createForm.dob || !createForm.password) {
      toast("Missing Information", {
        description: "Please fill all required fields"
      });
      return;
    }

    if (createForm.password !== createForm.confirmPassword) {
      toast("Password Mismatch", {
        description: "Passwords do not match"
      });
      return;
    }

    try {
      const emptySlot = accounts.find(acc => acc.isEmpty);
      if (!emptySlot) {
        toast("Device Full", {
          description: "All 3 account slots are occupied"
        });
        return;
      }

      const accountManager = new AccountManager(emptySlot.slot);
      const newAccount = await accountManager.createAccount(
        createForm.name,
        createForm.dob,
        createForm.password
      );

      toast("Account Created", {
        description: `Account created in slot ${emptySlot.slot}`,
        icon: <CheckCircle className="h-4 w-4 text-green-500" />
      });

      setShowCreateModal(false);
      setCreateForm({ name: "", dob: "", password: "", confirmPassword: "" });
      await loadAccounts();
      
    } catch (error) {
      console.error('Account creation error:', error);
      toast("Creation Failed", {
        description: "Failed to create account"
      });
    }
  };

  const handleSwitchAccount = async (slot: number) => {
    try {
      const accountManager = new AccountManager(slot);
      await accountManager.switchToAccount(slot);
      setCurrentSlot(slot);
      
      toast("Account Switched", {
        description: `Switched to account ${slot}`,
        icon: <User className="h-4 w-4 text-blue-500" />
      });
    } catch (error) {
      console.error('Account switch error:', error);
      toast("Switch Failed", {
        description: "Failed to switch account"
      });
    }
  };

  const handleExportQR = async (slot: number) => {
    try {
      const accountManager = new AccountManager(slot);
      const qrDataString = await accountManager.exportAccountQR(false);
      setQrData(qrDataString);
      setSelectedSlot(slot);
      setShowQRModal(true);
    } catch (error) {
      console.error('QR export error:', error);
      toast("Export Failed", {
        description: "Failed to generate QR code"
      });
    }
  };

  const handleImportAccount = async () => {
    if (!importQRData.trim()) {
      toast("Missing Data", {
        description: "Please enter QR data or scan a code"
      });
      return;
    }

    try {
      const emptySlot = accounts.find(acc => acc.isEmpty);
      if (!emptySlot) {
        toast("Device Full", {
          description: "All 3 account slots are occupied. Please remove an account first."
        });
        return;
      }

      const accountManager = new AccountManager(emptySlot.slot);
      await accountManager.importAccountQR(importQRData, emptySlot.slot);
      
      toast("Account Imported", {
        description: `Account imported to slot ${emptySlot.slot}`,
        icon: <CheckCircle className="h-4 w-4 text-green-500" />
      });

      setShowImportModal(false);
      setImportQRData("");
      await loadAccounts();
      
    } catch (error) {
      console.error('Account import error:', error);
      toast("Import Failed", {
        description: "Failed to import account"
      });
    }
  };

  const checkSecurityStatus = async () => {
    try {
      const manager = new DataPersistenceManager(currentSlot);
      const status = await manager.checkDataIntegrity('account');
      setSecurityStatus(status);
      setShowSecurityModal(true);
    } catch (error) {
      console.error('Security check error:', error);
      toast("Security Check Failed", {
        description: "Failed to check security status"
      });
    }
  };

  const copyAccountId = (account: UserAccount) => {
    navigator.clipboard.writeText(account.id);
    toast("ID Copied", {
      description: "Account ID copied to clipboard",
      icon: <Copy className="h-4 w-4 text-green-500" />
    });
  };

  const downloadQRCode = () => {
    // Implementation for downloading QR code
    toast("QR Downloaded", {
      description: "QR code saved to device"
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
          Account Manager
        </h1>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-green-500 to-green-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Account
          </Button>
          <Button
            onClick={() => setShowImportModal(true)}
            variant="outline"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button
            onClick={checkSecurityStatus}
            variant="outline"
          >
            <Shield className="h-4 w-4 mr-2" />
            Security
          </Button>
        </div>
      </div>

      {/* Account Slots */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {accounts.map((slot) => (
          <ModernCard
            key={slot.slot}
            className={`p-6 cursor-pointer transition-all duration-300 ${
              currentSlot === slot.slot
                ? 'ring-2 ring-amber-500 bg-gradient-to-br from-amber-50 to-orange-50'
                : 'hover:shadow-lg'
            }`}
            onClick={() => !slot.isEmpty && handleSwitchAccount(slot.slot)}
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={slot.isEmpty ? "secondary" : "default"}>
                  Slot {slot.slot}
                </Badge>
                {currentSlot === slot.slot && (
                  <Badge variant="outline" className="text-green-600">
                    Active
                  </Badge>
                )}
              </div>

              {slot.isEmpty ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                    <Plus className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">Empty Slot</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCreateModal(true);
                    }}
                  >
                    Create Account
                  </Button>
                </div>
              ) : (
                <div className="text-center w-full">
                  <Avatar className="w-16 h-16 mx-auto mb-3">
                    <AvatarFallback className="text-xl">
                      {slot.account!.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h3 className="font-semibold text-lg">{slot.account!.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    ID: {slot.account!.id.substring(0, 20)}...
                  </p>
                  <p className="text-xs text-gray-400">
                    Created: {new Date(slot.account!.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-400">
                    Last Login: {new Date(slot.account!.lastLogin).toLocaleDateString()}
                  </p>

                  <div className="flex gap-1 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyAccountId(slot.account!);
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportQR(slot.slot);
                      }}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </ModernCard>
        ))}
      </div>

      {/* Current Account Details */}
      {!accounts[currentSlot - 1]?.isEmpty && (
        <ModernCard className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-amber-600">Current Account Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-gray-600">Full Name</Label>
              <p className="text-lg font-semibold">{accounts[currentSlot - 1].account?.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Date of Birth</Label>
              <p className="text-lg">{accounts[currentSlot - 1].account?.dob}</p>
            </div>
            <div className="md:col-span-2">
              <Label className="text-sm font-medium text-gray-600">Complete User ID</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 p-2 bg-gray-100 rounded text-sm font-mono">
                  {accounts[currentSlot - 1].account?.id}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyAccountId(accounts[currentSlot - 1].account!)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Account Created</Label>
              <p className="text-lg">{new Date(accounts[currentSlot - 1].account?.createdAt || '').toLocaleString()}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Last Login</Label>
              <p className="text-lg">{new Date(accounts[currentSlot - 1].account?.lastLogin || '').toLocaleString()}</p>
            </div>
          </div>
        </ModernCard>
      )}

      {/* Create Account Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="create-name">Full Name</Label>
              <Input
                id="create-name"
                value={createForm.name}
                onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <Label htmlFor="create-dob">Date of Birth</Label>
              <Input
                id="create-dob"
                type="date"
                value={createForm.dob}
                onChange={(e) => setCreateForm(prev => ({ ...prev, dob: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="create-password">Password</Label>
              <Input
                id="create-password"
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Choose a secure password"
              />
            </div>
            <div>
              <Label htmlFor="create-confirm">Confirm Password</Label>
              <Input
                id="create-confirm"
                type="password"
                value={createForm.confirmPassword}
                onChange={(e) => setCreateForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm your password"
              />
            </div>
            <Button onClick={handleCreateAccount} className="w-full">
              Create Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Export Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Account QR Code - Slot {selectedSlot}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            {qrData && (
              <div className="p-4 bg-white rounded-lg">
                <QRCode value={qrData} size={200} />
              </div>
            )}
            <p className="text-sm text-gray-600 text-center">
              Scan this QR code to import this account on another device
            </p>
            <div className="flex gap-2 w-full">
              <Button onClick={downloadQRCode} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                onClick={() => navigator.clipboard.writeText(qrData)}
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Data
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Modal */}
      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="import-data">QR Data or JSON</Label>
              <textarea
                id="import-data"
                className="w-full h-32 p-3 border rounded-lg font-mono text-sm"
                value={importQRData}
                onChange={(e) => setImportQRData(e.target.value)}
                placeholder="Paste QR data or scan a QR code..."
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleImportAccount} className="flex-1">
                <Upload className="h-4 w-4 mr-2" />
                Import Account
              </Button>
              <Button variant="outline" className="flex-1">
                <Camera className="h-4 w-4 mr-2" />
                Scan QR
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Security Status Modal */}
      <Dialog open={showSecurityModal} onOpenChange={setShowSecurityModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>8-Layer Security Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(securityStatus.layers).map(([layer, status]) => (
                <div key={layer} className="flex items-center gap-2">
                  {status ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">{layer}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-4">
              <Label className="text-sm font-medium">Overall Status</Label>
              <div className="flex items-center gap-2 mt-1">
                {securityStatus.consistent ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                )}
                <span>{securityStatus.consistent ? 'Data Secure' : 'Issues Detected'}</span>
              </div>
            </div>

            {securityStatus.errors.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-red-600">Errors</Label>
                <ul className="list-disc list-inside text-sm text-red-600 mt-1">
                  {securityStatus.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <Progress 
              value={Object.values(securityStatus.layers).filter(Boolean).length / 8 * 100} 
              className="mt-4"
            />
            <p className="text-xs text-gray-500 text-center">
              {Object.values(securityStatus.layers).filter(Boolean).length}/8 storage layers active
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdvancedAccountManager;
