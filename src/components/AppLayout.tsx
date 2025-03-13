
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Shield } from 'lucide-react';
import SiteList from '@/components/SiteList';
import PasswordGenerator from '@/components/PasswordGenerator';
import AddLoginForm from '@/components/AddLoginForm';
import { LoginCredential } from '@/utils/storage';

interface AppLayoutProps {
  credentials: LoginCredential[];
  currentTab: string;
  currentUrl: string;
  setCurrentTab: (tab: string) => void;
  onAddCredential: (credential: LoginCredential) => Promise<void>;
  onDeleteCredential: (id: string) => Promise<void>;
  onAutofill: (credential: LoginCredential) => Promise<void>;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  credentials,
  currentTab,
  currentUrl,
  setCurrentTab,
  onAddCredential,
  onDeleteCredential,
  onAutofill
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  
  return (
    <div className="flex-1 flex flex-col p-4">
      {showAddForm ? (
        <AddLoginForm 
          onSubmit={async (credential) => {
            await onAddCredential(credential);
            setShowAddForm(false);
          }}
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
                  onAutofill={onAutofill}
                  onDelete={onDeleteCredential}
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
  );
};

export default AppLayout;
