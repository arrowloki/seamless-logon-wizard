
import React, { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import Header from '@/components/Header';
import Auth from '@/components/Auth';
import AppLayout from '@/components/AppLayout';
import SettingsDialog from '@/components/SettingsDialog';
import { storage, AppSettings, LoginCredential } from '@/utils/storage';

const Index = () => {
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState('passwords');
  const [isLocked, setIsLocked] = useState(true);
  const [masterPassword, setMasterPassword] = useState('');
  const [hasMaster, setHasMaster] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [credentials, setCredentials] = useState<LoginCredential[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [isFirstTime, setIsFirstTime] = useState(true); // Default to true until we check
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Initial setup
  useEffect(() => {
    const init = async () => {
      try {
        console.log("Starting initialization");
        // Check if master password exists
        const hasMasterPassword = await storage.hasMasterPassword();
        console.log("Has master password check result:", hasMasterPassword);
        setHasMaster(hasMasterPassword);
        setIsFirstTime(!hasMasterPassword);
        
        // Get current tab URL if in extension context
        const isExtension = typeof window.chrome !== 'undefined' && chrome.tabs !== undefined;
        if (isExtension) {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.url) {
              setCurrentUrl(tabs[0].url);
            }
          });
        }
        
        // Get settings
        const storedSettings = await storage.getSettings();
        setSettings(storedSettings);
      } catch (error) {
        console.error("Initialization error:", error);
        toast({
          title: "Initialization Error",
          description: "There was an error loading your data. Please try again.",
          variant: "destructive",
          duration: 3000,
        });
      } finally {
        setIsInitializing(false);
      }
    };
    
    init();
  }, [toast]);
  
  // Load credentials when unlocked
  useEffect(() => {
    if (!isLocked && masterPassword) {
      loadCredentials();
    }
  }, [isLocked, masterPassword]);
  
  const loadCredentials = async () => {
    if (!masterPassword) return;
    
    try {
      const storedCredentials = await storage.getCredentials(masterPassword);
      setCredentials(storedCredentials || []);
    } catch (error) {
      console.error("Error loading credentials:", error);
      toast({
        title: "Error",
        description: "Failed to load your saved credentials",
        variant: "destructive",
        duration: 3000,
      });
    }
  };
  
  const handleCreateMaster = async (password: string) => {
    try {
      await storage.setMasterPassword(password);
      setMasterPassword(password);
      setHasMaster(true);
      setIsLocked(false);
      setIsFirstTime(false);
      
      toast({
        title: "Vault Created",
        description: "Your secure vault has been created successfully!",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error creating master password:", error);
      throw error;
    }
  };
  
  const handleUnlock = async (password: string) => {
    try {
      const valid = await storage.verifyMasterPassword(password);
      
      if (valid) {
        setMasterPassword(password);
        setIsLocked(false);
        
        toast({
          title: "Unlocked",
          description: "Your password vault is now unlocked",
          duration: 3000,
        });
      } else {
        toast({
          title: "Invalid Password",
          description: "The password you entered is incorrect",
          variant: "destructive",
          duration: 3000,
        });
        throw new Error("Invalid password");
      }
    } catch (error) {
      console.error("Error unlocking vault:", error);
      throw error;
    }
  };
  
  const handleLock = () => {
    setIsLocked(true);
    setMasterPassword('');
    setCredentials([]);
  };
  
  const handleAddCredential = async (credential: LoginCredential) => {
    try {
      await storage.saveCredential(credential, masterPassword);
      await loadCredentials();
      
      toast({
        title: "Login Saved",
        description: "Your login details have been saved",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error saving credential:", error);
      toast({
        title: "Error",
        description: "Failed to save login details",
        variant: "destructive",
        duration: 3000,
      });
      throw error;
    }
  };
  
  const handleDeleteCredential = async (id: string) => {
    try {
      await storage.deleteCredential(id, masterPassword);
      await loadCredentials();
      
      toast({
        title: "Login Deleted",
        description: "Your login details have been deleted",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error deleting credential:", error);
      toast({
        title: "Error",
        description: "Failed to delete login details",
        variant: "destructive",
        duration: 3000,
      });
      throw error;
    }
  };
  
  const handleSaveSettings = async (newSettings: AppSettings) => {
    try {
      await storage.saveSettings(newSettings);
      setSettings(newSettings);
      setSettingsOpen(false);
      
      toast({
        title: "Settings Saved",
        description: "Your settings have been updated",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
        duration: 3000,
      });
      throw error;
    }
  };
  
  const handleAutofill = async (credential: LoginCredential) => {
    const isExtension = typeof window.chrome !== 'undefined' && chrome.runtime !== undefined;
    if (isExtension) {
      chrome.runtime.sendMessage(
        { action: 'fillCredential', credential },
        (response) => {
          if (response?.success) {
            toast({
              title: "Autofill Complete",
              description: "Your login details have been filled",
              duration: 3000,
            });
          } else {
            toast({
              title: "Autofill Failed",
              description: "Unable to fill login form",
              variant: "destructive",
              duration: 3000,
            });
          }
        }
      );
    } else {
      toast({
        title: "Not Available",
        description: "Autofill is only available in the extension",
        duration: 3000,
      });
    }
  };
  
  // Show loading state
  if (isInitializing) {
    return (
      <div className="min-h-[500px] w-[400px] flex flex-col items-center justify-center bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading OneLogin...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-[500px] w-[400px] flex flex-col bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <Header 
        isLocked={isLocked}
        onLock={handleLock}
        onShowSettings={() => setSettingsOpen(true)}
        onAddNew={() => {}}
      />
      
      {isLocked ? (
        <Auth 
          isFirstTime={isFirstTime} 
          onCreateMaster={handleCreateMaster}
          onUnlock={handleUnlock}
        />
      ) : (
        <AppLayout
          credentials={credentials}
          currentTab={currentTab}
          currentUrl={currentUrl}
          setCurrentTab={setCurrentTab}
          onAddCredential={handleAddCredential}
          onDeleteCredential={handleDeleteCredential}
          onAutofill={handleAutofill}
        />
      )}
      
      <SettingsDialog
        open={settingsOpen}
        settings={settings}
        onOpenChange={setSettingsOpen}
        onSave={handleSaveSettings}
      />
    </div>
  );
};

export default Index;
