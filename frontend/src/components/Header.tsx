import { useState, useContext } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tab, Screen } from "../types";
import {
  useAppActiveTab,
  useAppSetActiveTab,
  useAppSetCurrentScreen,
  useAppUser,
} from "../hooks/useApp";
import { WalletContext } from "../contexts/WalletContext";
import { useXAiApi } from "../hooks/useXAi";

export default function Header() {
  const activeTab = useAppActiveTab();
  const setActiveTab = useAppSetActiveTab();
  const setCurrentScreen = useAppSetCurrentScreen();
  const [isOpen, setIsOpen] = useState(false);
  const { state: walletState } = useContext(WalletContext);
  const user = useAppUser();
  const xAiApi = useXAiApi();
  console.log("user", user);

  const handleGrokChatClick = () => {
    if (xAiApi) {
      setActiveTab(Tab.GrokChat);
      setCurrentScreen(Screen.GrokChat);
      setIsOpen(false);
    }
  };

  const handleXSearchClick = () => {
    setActiveTab(Tab.XSearch);
    setCurrentScreen(Screen.XSearch);
    setIsOpen(false);
  };

  return (
    <header className="flex justify-between items-center py-2 px-4 border-b relative">
      <h1
        className="text-lg font-bold cursor-pointer hover:underline"
        onClick={() => {
          setActiveTab(Tab.Wallet);
          setCurrentScreen(Screen.Home);
        }}
      >
        repl-x
      </h1>
      {user && (
        <p className="text-xs text-muted-foreground">{user.name}@repl-x.com</p>
      )}
      <div className="flex items-center">
        <div
          className={`w-2 h-2 rounded-full mr-2 ${
            walletState.isOpen ? "bg-green-500" : "bg-red-500"
          }`}
          title={walletState.isOpen ? "Wallet open" : "Wallet not open"}
        ></div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Open menu"
              className="z-10"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="z-50">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-2 mt-4">
              <Button
                variant={activeTab === Tab.GrokChat ? "default" : "ghost"}
                className="justify-start"
                onClick={handleGrokChatClick}
                disabled={!xAiApi}
              >
                GrokChat {!xAiApi && "(API key not set)"}
              </Button>
              <Button
                variant={activeTab === Tab.XSearch ? "default" : "ghost"}
                className="justify-start"
                onClick={handleXSearchClick}
              >
                X Search
              </Button>
              <Button
                variant={activeTab === Tab.Wallet ? "default" : "ghost"}
                className="justify-start"
                onClick={() => {
                  setActiveTab(Tab.Wallet);
                  setCurrentScreen(Screen.Home);
                  setIsOpen(false);
                }}
              >
                Wallet
              </Button>
              <Button
                variant={activeTab === "settings" ? "default" : "ghost"}
                className="justify-start"
                onClick={() => {
                  setActiveTab(Tab.Settings);
                  setIsOpen(false);
                }}
              >
                Settings
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
