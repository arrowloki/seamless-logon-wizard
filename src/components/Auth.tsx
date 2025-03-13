
import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Key } from 'lucide-react';

interface AuthProps {
  isFirstTime: boolean;
  onCreateMaster: (password: string) => Promise<void>;
  onUnlock: (password: string) => Promise<void>;
}

const Auth: React.FC<AuthProps> = ({ isFirstTime, onCreateMaster, onUnlock }) => {
  const { toast } = useToast();
  const [masterPassword, setMasterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);

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
      await onCreateMaster(masterPassword);
    } catch (error) {
      console.error("Error creating master password:", error);
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
      await onUnlock(masterPassword);
    } catch (error) {
      console.error("Error unlocking vault:", error);
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

  return (
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
  );
};

export default Auth;
