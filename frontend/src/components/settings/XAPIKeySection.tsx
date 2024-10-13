import { useCallback, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Separator } from "@radix-ui/react-separator";
import { XAPICredentials } from "@/types";
import { useXAPICredentials, useXSetAPICredentials } from "@/hooks/useX";

export default function XAPIKeySection() {
  const xAPICredentials = useXAPICredentials();
  const setXAPICredentials = useXSetAPICredentials();
  const [newCredentials, setNewCredentials] = useState<XAPICredentials>({
    apiKey: "",
    apiKeySecret: "",
    bearerToken: "",
    accessToken: "",
    accessTokenSecret: "",
  });

  const handleSaveCredentials = useCallback(() => {
    setXAPICredentials(newCredentials);
  }, [setXAPICredentials, newCredentials]);

  const handleRemoveCredentials = useCallback(() => {
    setXAPICredentials(null);
    setNewCredentials({
      apiKey: "",
      apiKeySecret: "",
      bearerToken: "",
      accessToken: "",
      accessTokenSecret: "",
    });
  }, [setXAPICredentials]);

  const handleInputChange = useCallback((field: keyof XAPICredentials, value: string) => {
    setNewCredentials(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    <>
      <div className="flex flex-col space-y-1">
        <span className="text-xl font-semibold">X API Credentials</span>
        <p className="text-sm text-muted-foreground">
          Enter your X API credentials to enable X-powered features
        </p>
        <div className="bg-secondary rounded-lg p-3">
          {xAPICredentials ? (
            <div className="flex justify-between items-center">
              <span className="text-sm">API Credentials are set</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveCredentials}
                className="ml-2"
              >
                Remove Credentials
              </Button>
            </div>
          ) : (
            <div className="flex flex-col space-y-2">
              <Input
                type="password"
                placeholder="API Key"
                value={newCredentials.apiKey}
                onChange={(e) => handleInputChange("apiKey", e.target.value)}
                className="w-full"
              />
              <Input
                type="password"
                placeholder="API Key Secret"
                value={newCredentials.apiKeySecret}
                onChange={(e) => handleInputChange("apiKeySecret", e.target.value)}
                className="w-full"
              />
              <Input
                type="password"
                placeholder="Bearer Token"
                value={newCredentials.bearerToken}
                onChange={(e) => handleInputChange("bearerToken", e.target.value)}
                className="w-full"
              />
              <Input
                type="password"
                placeholder="Access Token"
                value={newCredentials.accessToken}
                onChange={(e) => handleInputChange("accessToken", e.target.value)}
                className="w-full"
              />
              <Input
                type="password"
                placeholder="Access Token Secret"
                value={newCredentials.accessTokenSecret}
                onChange={(e) => handleInputChange("accessTokenSecret", e.target.value)}
                className="w-full"
              />
              <Button
                onClick={handleSaveCredentials}
                disabled={!Object.values(newCredentials).every(Boolean)}
                className="w-full"
              >
                Save API Credentials
              </Button>
            </div>
          )}
        </div>
      </div>
      <Separator />
    </>
  );
}
