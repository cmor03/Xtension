import { useCallback } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Separator } from "@radix-ui/react-separator";
import { useAppXAPIKey, useAppSetXAPIKey } from "@/hooks/useApp";

export default function XAPIKeySection() {
  const xAPIKey = useAppXAPIKey();
  const setXAPIKey = useAppSetXAPIKey();

  const handleSaveKey = useCallback((newKey: string) => {
    setXAPIKey(newKey);
  }, [setXAPIKey]);

  const handleRemoveKey = useCallback(() => {
    setXAPIKey(null);
  }, [setXAPIKey]);

  return (
    <>
      <div className="flex flex-col space-y-1">
        <span className="text-xl font-semibold">X API Key</span>
        <p className="text-sm text-muted-foreground">
          Enter your X API key to enable X-powered features
        </p>
        <div className="bg-secondary rounded-lg p-3">
          {xAPIKey ? (
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
                placeholder="Enter X API Key"
                onChange={(e) => handleSaveKey(e.target.value)}
                className="w-full"
              />
              <Button
                onClick={() => handleSaveKey("")}
                disabled={!xAPIKey}
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
