
import React, { useState } from 'react';
import { Lock, Settings, Plus, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface HeaderProps {
  isLocked: boolean;
  onLock: () => void;
  onShowSettings: () => void;
  onAddNew: () => void;
}

const Header: React.FC<HeaderProps> = ({ isLocked, onLock, onShowSettings, onAddNew }) => {
  const { toast } = useToast();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleLock = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
      onLock();
      
      toast({
        title: "Vault Locked",
        description: "Your password vault has been secured.",
        duration: 3000,
      });
    }, 300);
  };

  return (
    <div className="sticky top-0 z-10 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/50 dark:border-gray-800/50 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`rounded-full bg-primary/10 p-2 transition-all duration-300 ${isAnimating ? 'scale-90' : 'scale-100'}`}>
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-lg font-medium">OneLogin</h1>
        </div>
        
        <div className="flex items-center space-x-1">
          {!isLocked && (
            <>
              <Button variant="ghost" size="icon" onClick={onAddNew} className="subtle-ring-focus" aria-label="Add new login">
                <Plus className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" size="icon" onClick={onShowSettings} className="subtle-ring-focus" aria-label="Settings">
                <Settings className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" size="icon" onClick={handleLock} className="subtle-ring-focus" aria-label="Lock vault">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
