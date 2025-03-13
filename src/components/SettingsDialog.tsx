
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AppSettings } from '@/utils/storage';

interface SettingsDialogProps {
  open: boolean;
  settings: AppSettings | null;
  onOpenChange: (open: boolean) => void;
  onSave: (settings: AppSettings) => Promise<void>;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ 
  open, 
  settings, 
  onOpenChange, 
  onSave 
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={() => onSave(settings)}>
                Save Changes
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
