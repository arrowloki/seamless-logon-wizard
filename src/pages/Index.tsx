
import React, { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Lock, Key, Shield, FileKey, Plus } from 'lucide-react';
import Header from '@/components/Header';
import SiteList from '@/components/SiteList';
import PasswordGenerator from '@/components/PasswordGenerator';
import AddLoginForm from '@/components/AddLoginForm';
import { storage, AppSettings, LoginCredential } from '@/utils/storage';

const Index = () => {
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState('passwords');
  const [isLocked, setIsLocked] = useState(true);
  const [masterPassword, setMasterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hasMaster, setHasMaster] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [credentials, setCredentials] = useState<LoginCredential[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  
  // Initial setup
  useEffect(() => {
    const init = async () => {
      // Check if master password exists
      const hasMasterPassword = await storage.hasMasterPassword();
      setHasMaster(hasMasterPassword);
      setIsFirstTime(!hasMasterPassword);
      
      // Get current tab URL
      if (chrome.tabs) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.url) {
            setCurrentUrl(tabs[0].url);
          }
        });
      }
      
      // Get settings
      const storedSettings = await storage.getSettings();
      setSettings(storedSettings);
    };
    
    init();
  }, []);
  
  // Load credentials when unlocked
  useEffect(() => {
    if (!isLocked && masterPassword) {
      loadCredentials();
    }
  }, [isLocked, masterPassword]);
  
  const loadCredentials = async () => {
    if (!masterPassword) return;
    
    const storedCredentials = await storage.getCredentials(masterPassword);
    setCredentials(storedCredentials || []);
  };
  
  const handleCreateMaster = async () => {
    if (masterPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Master password must be at least 8 characters",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    if (masterPassword !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "The passwords you entered don't match",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    setIsUnlocking(true);
    
    try {
      await storage.setMasterPassword(masterPassword);
      setHasMaster(true);
      setIsLocked(false);
      setIsFirstTime(false);
      
      toast({
        title: "Vault Created",
        description: "Your secure vault has been created successfully!",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create master password",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsUnlocking(false);
    }
  };
  
  const handleUnlock = async () => {
    if (!masterPassword) {
      toast({
        title: "Enter Password",
        description: "Please enter your master password",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    setIsUnlocking(true);
    
    try {
      const valid = await storage.verifyMasterPassword(masterPassword);
      
      if (valid) {
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
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unlock vault",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsUnlocking(false);
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
      setShowAddForm(false);
      
      toast({
        title: "Login Saved",
        description: "Your login details have been saved",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save login details",
        variant: "destructive",
        duration: 3000,
      });
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
      toast({
        title: "Error",
        description: "Failed to delete login details",
        variant: "destructive",
        duration: 3000,
      });
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
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
        duration: 3000,
      });
    }
  };
  
  const handleAutofill = async (credential: LoginCredential) => {
    if (chrome.runtime) {
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
    }
  };
  
  // Render locked state (login screen)
  if (isLocked) {
    return (
      <div className="min-h-[500px] w-[400px] flex flex-col bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <Header isLocked={true} onLock={() => {}} onShowSettings={() => {}} onAddNew={() => {}} />
        
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full glass-panel animate-fade-in">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>{isFirstTime ? "Create Master Password" : "Unlock Your Vault"}</CardTitle>
              <CardDescription>
                {isFirstTime 
                  ? "Create a strong master password to secure your vault" 
                  : "Enter your master password to access your saved logins"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Master password"
                    value={masterPassword}
                    onChange={(e) => setMasterPassword(e.target.value)}
                    className="form-input"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isFirstTime) {
                        handleUnlock();
                      }
                    }}
                  />
                  
                  {isFirstTime && (
                    <Input
                      type="password"
                      placeholder="Confirm master password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="form-input"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCreateMaster();
                        }
                      }}
                    />
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={isFirstTime ? handleCreateMaster : handleUnlock}
                disabled={isUnlocking}
              >
                {isUnlocking ? (
                  <span className="flex items-center">
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent"></span>
                    {isFirstTime ? "Creating..." : "Unlocking..."}
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Key className="mr-2 h-4 w-4" />
                    {isFirstTime ? "Create Vault" : "Unlock"}
                  </span>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }
  
  // Render unlocked state (main app)
  return (
    <div className="min-h-[500px] w-[400px] flex flex-col bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <Header 
        isLocked={false}
        onLock={handleLock}
        onShowSettings={() => setSettingsOpen(true)}
        onAddNew={() => setShowAddForm(true)}
      />
      
      <div className="flex-1 flex flex-col p-4">
        {showAddForm ? (
          <AddLoginForm 
            onSubmit={handleAddCredential}
            onCancel={() => setShowAddForm(false)}
            initialUrl={currentUrl}
          />
        ) : (
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="passwords" className="text-sm">
                Passwords
              </TabsTrigger>
              <TabsTrigger value="generator" className="text-sm">
                Generator
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="passwords" className="flex-1 flex flex-col mt-0 data-[state=inactive]:hidden">
              <div className="flex-1 flex flex-col">
                {credentials.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No Saved Passwords</h3>
                    <p className="text-muted-foreground mb-4 max-w-xs">
                      Add your first login to get started with OneLogin
                    </p>
                    <Button onClick={() => setShowAddForm(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Login
                    </Button>
                  </div>
                ) : (
                  <SiteList 
                    credentials={credentials}
                    onAutofill={handleAutofill}
                    onDelete={handleDeleteCredential}
                  />
                )}
              </div>
              
              {credentials.length > 0 && (
                <div className="pt-4">
                  <Button 
                    onClick={() => setShowAddForm(true)}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Login
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="generator" className="flex-1 flex flex-col mt-0">
              <PasswordGenerator />
            </TabsContent>
          </Tabs>
        )}
      </div>
      
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          
          {settings && (
            <div className="py-4">
              <div className="space-y-4">
                {/* Settings content would go here */}
                <p className="text-sm text-muted-foreground">
                  Settings functionality will be implemented in the next version.
                </p>
              </div>
              
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setSettingsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleSaveSettings(settings)}>
                  Save Changes
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
