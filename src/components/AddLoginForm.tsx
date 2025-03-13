
import React, { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import PasswordGenerator from './PasswordGenerator';
import { generateId } from '@/utils/storage';

interface AddLoginFormProps {
  onSubmit: (credential: {
    id: string;
    url: string;
    username: string;
    password: string;
    name: string;
    createdAt: number;
  }) => void;
  onCancel: () => void;
  initialUrl?: string;
}

const AddLoginForm: React.FC<AddLoginFormProps> = ({ onSubmit, onCancel, initialUrl = '' }) => {
  const { toast } = useToast();
  const [url, setUrl] = useState(initialUrl);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);

  useEffect(() => {
    // Try to extract a site name from the URL
    if (url && !name) {
      try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;
        
        // Remove www. and get the domain name
        const siteName = hostname.replace(/^www\./, '').split('.')[0];
        
        if (siteName) {
          // Capitalize first letter
          setName(siteName.charAt(0).toUpperCase() + siteName.slice(1));
        }
      } catch (e) {
        // Invalid URL, do nothing
      }
    }
  }, [url, name]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url || !username || !password) {
      toast({
        title: "Missing Fields",
        description: "Please fill out all required fields.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      // If it's not a valid URL, prepend https://
      if (!/^https?:\/\//.test(url)) {
        setUrl(`https://${url}`);
      }
    }
    
    onSubmit({
      id: generateId(),
      url,
      username,
      password,
      name: name || 'Unnamed Site',
      createdAt: Date.now(),
    });
    
    toast({
      title: "Login Saved",
      description: "Your login details have been securely saved.",
      duration: 3000,
    });
  };

  const handleSelectPassword = (generatedPassword: string) => {
    setPassword(generatedPassword);
    setShowGenerator(false);
    toast({
      title: "Password Generated",
      description: "A secure password has been generated.",
      duration: 2000,
    });
  };

  return (
    <div className="animate-slide-up">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="url" className="text-sm">Website URL</Label>
          <Input
            id="url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="bg-white/50 dark:bg-gray-900/50 subtle-ring-focus"
            placeholder="https://example.com"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm">Name</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-white/50 dark:bg-gray-900/50 subtle-ring-focus"
            placeholder="Site name (optional)"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm">Username / Email</Label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-white/50 dark:bg-gray-900/50 subtle-ring-focus"
            placeholder="username@example.com"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password" className="flex justify-between items-center">
            <span className="text-sm">Password</span>
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-xs text-primary"
              onClick={() => setShowGenerator(!showGenerator)}
            >
              {showGenerator ? "Hide Generator" : "Generate Password"}
            </Button>
          </Label>
          
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/50 dark:bg-gray-900/50 subtle-ring-focus pr-10"
              placeholder="••••••••••••"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-7 w-7"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        {showGenerator && (
          <div className="pt-2">
            <PasswordGenerator onSelectPassword={handleSelectPassword} />
          </div>
        )}
        
        <div className="pt-4 flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            className="flex-1"
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddLoginForm;
