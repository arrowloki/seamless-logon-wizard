
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import LoginItem from './LoginItem';
import { LoginCredential } from '@/utils/storage';

interface SiteListProps {
  credentials: LoginCredential[];
  onAutofill: (credential: LoginCredential) => void;
  onDelete: (id: string) => void;
}

const SiteList: React.FC<SiteListProps> = ({ credentials, onAutofill, onDelete }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCredentials, setFilteredCredentials] = useState<LoginCredential[]>(credentials);
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCredentials(credentials);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredCredentials(
        credentials.filter(cred => 
          cred.name.toLowerCase().includes(query) || 
          cred.url.toLowerCase().includes(query) || 
          cred.username.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, credentials]);
  
  return (
    <div className="flex flex-col h-full">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="bg-white/50 dark:bg-gray-900/50 pl-9 subtle-ring-focus"
          placeholder="Search passwords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {filteredCredentials.length > 0 ? (
        <div className="space-y-3 overflow-y-auto flex-1 pr-1">
          {filteredCredentials.map((credential, index) => (
            <LoginItem
              key={credential.id}
              credential={credential}
              onAutofill={onAutofill}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-4 bg-secondary/30 rounded-lg">
            <p className="text-muted-foreground">
              {credentials.length === 0 
                ? "No saved passwords yet" 
                : "No matches found"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteList;
