import { useCallback } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Separator } from "@radix-ui/react-separator";
import { useXAiApiKey, useXAiSetApiKey } from "@/hooks/useXAi";

export default function XAiAPIKeySection() {
  const xAiAPIKey = useXAiApiKey();
  const setXAiAPIKey = useXAiSetApiKey();

  const handleSaveKey = useCallback(
    (newKey: string) => {
      setXAiAPIKey(newKey);
    },
    [setXAiAPIKey]
  );

  const handleRemoveKey = useCallback(() => {
    setXAiAPIKey(null);
  }, [setXAiAPIKey]);

  return (
    <>
      <div className="flex flex-col space-y-1">
        <span className="text-xl font-semibold">X AI API Key</span>
        <p className="text-sm text-muted-foreground">
          Enter your X AI API key to enable AI-powered features
        </p>
        <div className="bg-secondary rounded-lg p-3">
          {xAiAPIKey ? (
            <div className="flex justify-between items-center">
              <span className="text-sm">API Key is set</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveKey}
                className="ml-2"
              >
                Remove Key
              </Button>
            </div>
          ) : (
            <div className="flex flex-col space-y-2">
              <Input
                type="password"
                placeholder="Enter X AI API Key"
                onChange={(e) => handleSaveKey(e.target.value)}
                className="w-full"
              />
              <Button
                onClick={() => handleSaveKey("")}
                disabled={!xAiAPIKey}
                className="w-full"
              >
                Save API Key
              </Button>
            </div>
          )}
        </div>
      </div>
      <Separator />
    </>
  );
}
