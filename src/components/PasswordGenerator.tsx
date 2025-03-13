
import React, { useState, useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Copy, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { generatePassword } from "@/utils/storage";

interface PasswordGeneratorProps {
  onSelectPassword?: (password: string) => void;
}

const PasswordGenerator: React.FC<PasswordGeneratorProps> = ({ onSelectPassword }) => {
  const { toast } = useToast();
  const [length, setLength] = useState(16);
  const [useUppercase, setUseUppercase] = useState(true);
  const [useLowercase, setUseLowercase] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [password, setPassword] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    generateNewPassword();
  }, [length, useUppercase, useLowercase, useNumbers, useSymbols]);

  const generateNewPassword = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newPassword = generatePassword({
        passwordLength: length,
        useUppercase,
        useLowercase,
        useNumbers,
        useSymbols
      });
      setPassword(newPassword);
      setIsGenerating(false);
    }, 50);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    toast({
      title: "Copied!",
      description: "Password copied to clipboard",
      duration: 2000,
    });
  };

  const handleUse = () => {
    if (onSelectPassword) {
      onSelectPassword(password);
    }
  };

  return (
    <div className="p-4 bg-white/50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800 animate-scale-in">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-sm">Password Generator</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2"
            onClick={generateNewPassword}
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
            <span className="text-xs">Regenerate</span>
          </Button>
        </div>

        <div className="relative">
          <div className="bg-secondary/70 dark:bg-secondary/30 py-2 px-3 rounded font-mono text-sm break-all pr-10 min-h-[40px]">
            {password}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-1 top-1"
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="length">Length: {length}</Label>
          </div>
          <Slider 
            id="length"
            value={[length]} 
            min={8} 
            max={64} 
            step={1} 
            onValueChange={(value) => setLength(value[0])}
            className="py-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center space-x-2">
            <Switch 
              id="uppercase" 
              checked={useUppercase}
              onCheckedChange={setUseUppercase}
            />
            <Label htmlFor="uppercase" className="text-sm">Uppercase (A-Z)</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="lowercase" 
              checked={useLowercase}
              onCheckedChange={setUseLowercase}
            />
            <Label htmlFor="lowercase" className="text-sm">Lowercase (a-z)</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="numbers" 
              checked={useNumbers}
              onCheckedChange={setUseNumbers}
            />
            <Label htmlFor="numbers" className="text-sm">Numbers (0-9)</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="symbols" 
              checked={useSymbols}
              onCheckedChange={setUseSymbols}
            />
            <Label htmlFor="symbols" className="text-sm">Symbols (!@#$)</Label>
          </div>
        </div>

        {onSelectPassword && (
          <Button 
            onClick={handleUse}
            className="w-full mt-2"
          >
            Use This Password
          </Button>
        )}
      </div>
    </div>
  );
};

export default PasswordGenerator;
