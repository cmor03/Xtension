import { useState, useCallback } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useAppSetUser, useAppUser } from "@/hooks/useApp";
import { X } from "lucide-react";
import { connectUser } from "@/utils/auth";
import { Separator } from "@radix-ui/react-separator";

export default function ReplitAccountSection() {
  const setUser = useAppSetUser();
  const currentUser = useAppUser();
  const [connectionCode, setConnectionCode] = useState("");

  const handleConnect = useCallback(async () => {
    try {
      const user = await connectUser(connectionCode);
      setUser(user);
    } catch (error) {
      console.error("Authentication error:", error);
    }
  }, [connectionCode, setUser]);

  const handleDisconnect = useCallback(() => {
    setUser(null);
  }, [setUser]);

  return (
    <>
      <div className="flex flex-col space-y-1">
        <span className="text-xl font-semibold">Replit Account</span>
        {!currentUser && (
          <p className="text-sm text-muted-foreground">
            Link your Replit account with{" "}
            <a
              href="https://replex.replit.app"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Replex-Auth
            </a>{" "}
            to create a Lightning Address
          </p>
        )}
        <div className="bg-secondary rounded-lg p-3">
          {currentUser ? (
            <>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                    {currentUser.name} / {currentUser.id}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDisconnect}
                  className="ml-2"
                  aria-label="Disconnect"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col space-y-2">
              <Input
                type="text"
                placeholder="Enter connection code"
                value={connectionCode}
                onChange={(e) => setConnectionCode(e.target.value)}
                className="w-full"
              />
              <Button
                onClick={handleConnect}
                disabled={!connectionCode}
                className="w-full"
              >
                Connect
              </Button>
            </div>
          )}
        </div>
      </div>
      <Separator />
    </>
  );
}
