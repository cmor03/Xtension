import React, { useState } from 'react';
import { useXApi, useXAPICredentials, useXSetAPICredentials } from '../hooks/useX';
import { XAPICredentials } from '@/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const TwitterSearch: React.FC = () => {
  const xApi = useXApi();
  const xAPICredentials = useXAPICredentials();
  const setXAPICredentials = useXSetAPICredentials();
  const [newCredentials, setNewCredentials] = useState<XAPICredentials>({
    apiKey: '',
    apiKeySecret: '',
    bearerToken: '',
    accessToken: '',
    accessTokenSecret: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);

  const handleCredentialsChange = (field: keyof XAPICredentials) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCredentials({ ...newCredentials, [field]: e.target.value });
  };

  const handleSetCredentials = () => {
    setXAPICredentials(newCredentials);
  };

  const handleSearch = async () => {
    if (!xApi) {
      console.error('X API is not initialized');
      return;
    }

    try {
      const response = await xApi.searchTweets(searchQuery);
      setSearchResults(response);
    } catch (error) {
      console.error('Error searching tweets:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-hidden">
        <div className="h-full overflow-y-auto px-4">
          <h2 className="text-2xl font-bold mb-4">X Search</h2>
          {!xAPICredentials ? (
            <div className="space-y-2">
              <Input
                type="password"
                value={newCredentials.apiKey}
                onChange={handleCredentialsChange('apiKey')}
                placeholder="API Key"
                className="w-full"
              />
              <Input
                type="password"
                value={newCredentials.apiKeySecret}
                onChange={handleCredentialsChange('apiKeySecret')}
                placeholder="API Key Secret"
                className="w-full"
              />
              <Input
                type="password"
                value={newCredentials.bearerToken}
                onChange={handleCredentialsChange('bearerToken')}
                placeholder="Bearer Token"
                className="w-full"
              />
              <Input
                type="password"
                value={newCredentials.accessToken}
                onChange={handleCredentialsChange('accessToken')}
                placeholder="Access Token"
                className="w-full"
              />
              <Input
                type="password"
                value={newCredentials.accessTokenSecret}
                onChange={handleCredentialsChange('accessTokenSecret')}
                placeholder="Access Token Secret"
                className="w-full"
              />
              <Button onClick={handleSetCredentials} className="w-full">Set Credentials</Button>
            </div>
          ) : (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">API Credentials are set</p>
              <Button onClick={() => setXAPICredentials(null)} variant="outline" className="mt-2">Clear Credentials</Button>
            </div>
          )}
          <div className="mt-4">
            <div className="flex space-x-2">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter search query"
                className="flex-grow"
              />
              <Button onClick={handleSearch} disabled={!xAPICredentials}>Search Tweets</Button>
            </div>
          </div>
          {searchResults && (
            <div className="mt-4">
              <h3 className="text-xl font-semibold mb-2">Search Results:</h3>
              <div className="bg-gray-100 p-4 rounded-lg">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    pre: ({ ...props }) => (
                      <pre className="bg-gray-800 text-white p-2 rounded" {...props} />
                    ),
                    code: ({ inline, ...props }) =>
                      inline ? (
                        <code className="bg-gray-200 text-red-500 px-1 rounded" {...props} />
                      ) : (
                        <code {...props} />
                      ),
                  }}
                >
                  {`\`\`\`json\n${JSON.stringify(searchResults, null, 2)}\n\`\`\``}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TwitterSearch;
