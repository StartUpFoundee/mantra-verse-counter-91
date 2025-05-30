
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Download, Upload, RefreshCw, CheckCircle, Settings } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { getUserData, saveUserData, importAccountFromID } from "@/utils/spiritualIdUtils";
import { AccountManager, DataPersistenceManager } from "@/utils/advancedIdUtils";
import ModernCard from "./ModernCard";
import AdvancedAccountManager from "./AdvancedAccountManager";

const SimpleIdSystem: React.FC = () => {
  const [userID, setUserID] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [importID, setImportID] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [showImport, setShowImport] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      // Check for traditional user data first
      const userData = getUserData();
      if (userData) {
        setUserID(userData.id || "");
        setUserName(userData.name || "");
        setIsLoggedIn(true);
        return;
      }

      // Check for new advanced account system
      const accountManager = new AccountManager(1);
      const accounts = await accountManager.getAllAccounts();
      
      if (accounts.length > 0) {
        const currentAccount = accounts[0]; // Use first available account
        setUserID(currentAccount.id);
        setUserName(currentAccount.name);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Error checking user status:', error);
    }
  };

  const handleCopyID = () => {
    navigator.clipboard.writeText(userID);
    toast("ID Copied!", {
      description: "Your unique ID has been copied to clipboard",
      icon: <CheckCircle className="h-4 w-4 text-green-500" />
    });
  };

  const handleDownloadID = () => {
    const userData = getUserData();
    const dataStr = JSON.stringify({
      id: userID,
      name: userName,
      backup_data: userData,
      export_timestamp: new Date().toISOString(),
      version: "2.0"
    }, null, 2);
    
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportFileDefaultName = `spiritual-id-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast("ID Downloaded!", {
      description: "Your ID backup file has been saved",
      icon: <Download className="h-4 w-4 text-blue-500" />
    });
  };

  const handleRefreshID = async () => {
    setIsGenerating(true);
    try {
      const userData = getUserData();
      if (userData) {
        // For advanced accounts, use the new system
        const accountManager = new AccountManager(1);
        const persistenceManager = new DataPersistenceManager(1);
        
        // Update account data across all 8 layers
        userData.lastLogin = new Date().toISOString();
        await persistenceManager.storeData('account', userData);
        
        toast("ID Updated!", {
          description: "Your ID has been refreshed with latest data",
          icon: <RefreshCw className="h-4 w-4 text-green-500" />
        });

        // Refresh the display
        await checkUserStatus();
      }
    } catch (error) {
      console.error('ID refresh error:', error);
      toast("Update Failed", {
        description: "Could not update your ID. Please try again."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImportID = async () => {
    if (!importID.trim()) {
      toast("Missing ID", {
        description: "Please enter your ID to import"
      });
      return;
    }

    setIsImporting(true);
    try {
      const success = await importAccountFromID(importID.trim());
      
      if (success) {
        await checkUserStatus();
        setShowImport(false);
        setImportID("");
        
        toast("Account Restored!", {
          description: "Your account and all data have been restored successfully",
          icon: <CheckCircle className="h-4 w-4 text-green-500" />
        });
        
        // Refresh the page to show updated data
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast("Import Failed", {
          description: "Could not restore account. Please check your ID and try again."
        });
      }
    } catch (error) {
      toast("Import Error", {
        description: "An error occurred while importing your account"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (data.id) {
          setImportID(data.id);
          toast("File Loaded", {
            description: "ID extracted from file. Click 'Restore Account' to continue.",
            icon: <Upload className="h-4 w-4 text-blue-500" />
          });
        } else {
          toast("Invalid File", {
            description: "This file doesn't contain a valid ID"
          });
        }
      } catch (error) {
        toast("File Error", {
          description: "Could not read the file. Please check the format."
        });
      }
    };
    reader.readAsText(file);
  };

  // Show advanced account manager if requested
  if (showAdvanced) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-4 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(false)}
          >
            ← Back to Simple View
          </Button>
        </div>
        <AdvancedAccountManager />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <ModernCard className="p-6 lg:p-8 max-w-md mx-auto border-blue-200/50 dark:border-blue-700/50" gradient>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            Get Your Unique ID
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Use your ID on any device to access your spiritual journey
          </p>
        </div>

        {!showImport ? (
          <div className="space-y-4">
            <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
              You need to create an account first to get your unique ID
            </p>
            
            <Button
              onClick={() => setShowImport(true)}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              I Have an ID - Restore My Account
            </Button>

            <Button
              onClick={() => setShowAdvanced(true)}
              variant="outline"
              className="w-full"
            >
              <Settings className="h-4 w-4 mr-2" />
              Advanced Account Manager
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="import-id" className="text-gray-700 dark:text-gray-300 font-medium">
                Enter Your Unique ID
              </Label>
              <Input
                id="import-id"
                placeholder="Paste your ID here..."
                value={importID}
                onChange={(e) => setImportID(e.target.value)}
                className="bg-white/80 dark:bg-zinc-900/80 border-gray-300/50 dark:border-zinc-600/50"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleImportID}
                disabled={isImporting || !importID.trim()}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex-1"
              >
                {isImporting ? "Restoring..." : "Restore Account"}
              </Button>
              
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button
                  variant="outline"
                  className="bg-white/60 dark:bg-zinc-800/60 border-gray-300 dark:border-zinc-600"
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <Button
              variant="ghost"
              onClick={() => setShowImport(false)}
              className="w-full text-gray-500 dark:text-gray-400"
            >
              Back
            </Button>
          </div>
        )}
      </ModernCard>
    );
  }

  return (
    <ModernCard className="p-6 lg:p-8 max-w-md mx-auto border-green-200/50 dark:border-green-700/50" gradient>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
          Your Unique ID
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          Use this ID to access your account on any device
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4">
          <Label className="text-gray-700 dark:text-gray-300 font-medium block mb-2">
            Account Holder: {userName}
          </Label>
          <div className="bg-white dark:bg-zinc-900 rounded border p-3 font-mono text-sm break-all">
            {userID}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={handleCopyID}
            variant="outline"
            className="flex flex-col items-center py-4 h-auto"
          >
            <Copy className="h-5 w-5 mb-1" />
            <span className="text-xs">Copy</span>
          </Button>
          
          <Button
            onClick={handleDownloadID}
            variant="outline"
            className="flex flex-col items-center py-4 h-auto"
          >
            <Download className="h-5 w-5 mb-1" />
            <span className="text-xs">Save</span>
          </Button>
          
          <Button
            onClick={handleRefreshID}
            disabled={isGenerating}
            variant="outline"
            className="flex flex-col items-center py-4 h-auto"
          >
            <RefreshCw className={`h-5 w-5 mb-1 ${isGenerating ? 'animate-spin' : ''}`} />
            <span className="text-xs">Update</span>
          </Button>
        </div>

        <Button
          onClick={() => setShowAdvanced(true)}
          variant="outline"
          className="w-full"
        >
          <Settings className="h-4 w-4 mr-2" />
          Advanced Account Manager
        </Button>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
          <p className="text-blue-700 dark:text-blue-300 text-sm font-medium mb-2">
            📱 Switch Devices?
          </p>
          <p className="text-blue-600 dark:text-blue-400 text-xs">
            Use the Advanced Account Manager for multi-device management with bulletproof 8-layer data persistence!
          </p>
        </div>
      </div>
    </ModernCard>
  );
};

export default SimpleIdSystem;
