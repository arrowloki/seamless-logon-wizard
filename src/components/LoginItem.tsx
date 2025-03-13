
import React, { useState } from 'react';
import { Eye, EyeOff, Copy, MoreVertical, Trash } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { LoginCredential } from '@/utils/storage';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LoginItemProps {
  credential: LoginCredential;
  onAutofill: (credential: LoginCredential) => void;
  onDelete: (id: string) => void;
}

const LoginItem: React.FC<LoginItemProps> = ({ credential, onAutofill, onDelete }) => {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  
  // Format the domain from the URL
  const domain = (() => {
    try {
      const url = new URL(credential.url);
      return url.hostname;
    } catch (e) {
      return credential.url;
    }
  })();
  
  const handleCopyUsername = () => {
    navigator.clipboard.writeText(credential.username);
    toast({
      title: "Username Copied",
      description: "Username copied to clipboard",
      duration: 2000,
    });
  };
  
  const handleCopyPassword = () => {
    navigator.clipboard.writeText(credential.password);
    toast({
      title: "Password Copied",
      description: "Password copied to clipboard",
      duration: 2000,
    });
  };
  
  const handleDelete = () => {
    onDelete(credential.id);
  };
  
  const handleAutofill = () => {
    onAutofill(credential);
  };
  
  return (
    <div className="bg-white/40 dark:bg-gray-900/40 border border-gray-200/70 dark:border-gray-800/70 rounded-lg p-3 hover:bg-white/60 dark:hover:bg-gray-900/60 transition-all duration-200 animate-slide-up">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-sm">{credential.name || domain}</h3>
          <p className="text-xs text-muted-foreground">{credential.username}</p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
            <DropdownMenuItem onClick={handleCopyUsername} className="cursor-pointer">
              <Copy className="mr-2 h-4 w-4" />
              <span>Copy Username</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyPassword} className="cursor-pointer">
              <Copy className="mr-2 h-4 w-4" />
              <span>Copy Password</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleAutofill} className="cursor-pointer">
              <span>Autofill</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-destructive">
              <Trash className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="mt-2 flex">
        <div className="bg-secondary/40 dark:bg-secondary/20 rounded flex-1 px-2 py-1 font-mono text-xs flex items-center justify-between">
          <span>{showPassword ? credential.password : '•'.repeat(credential.password.length)}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 ml-1" 
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </Button>
        </div>
        
        <Button 
          variant="default" 
          size="sm" 
          className="ml-2 text-xs h-[28px]" 
          onClick={handleAutofill}
        >
          Autofill
        </Button>
      </div>
    </div>
  );
};

export default LoginItem;
