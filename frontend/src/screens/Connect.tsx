import { useState, useCallback } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  useAppSetCurrentScreen,
  useAppSetIsLoggedIn,
  useAppSetUser,
} from "@/hooks/useApp";
import { Screen, User } from "../types";

const REPLEX_API_URL =
  "https://d41388c1-73da-437f-b0b7-62f215a91554-00-3577uk1dqrjza.picard.replit.dev";

export default function ConnectScreen() {
  const setCurrentScreen = useAppSetCurrentScreen();
  const setUser = useAppSetUser();
  const setIsLoggedIn = useAppSetIsLoggedIn();
  const [connectionCode, setConnectionCode] = useState("");

  const handleLogin = useCallback(async () => {
    try {
      const response = await fetch(
        `${REPLEX_API_URL}/getUser?connection_code=${connectionCode}`
      );
      if (!response.ok) {
        throw new Error("Failed to authenticate");
      }
      const userData = await response.json();
      const user: User = {
        name: userData.userName,
        id: userData.userId,
      };
      setUser(user);
      setIsLoggedIn(true);
      setCurrentScreen(Screen.Home);
    } catch (error) {
      console.error("Authentication error:", error);
    }
  }, [connectionCode, setCurrentScreen, setIsLoggedIn, setUser]);

  return (
    <Card className="w-full max-w-md mx-auto border-none">
      <CardContent>
        <div className="flex flex-col items-center justify-center space-y-6 p-4">
          <p className="text-lg font-bold">
            Enter your Repl-Ex connection code to create or access a Bitcoin
            wallet
          </p>
          <Input
            type="text"
            placeholder="Enter connection code"
            value={connectionCode}
            onChange={(e) => setConnectionCode(e.target.value)}
          />
          <Button onClick={handleLogin} disabled={!connectionCode}>
            Connect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
