import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import BalanceDisplay from "../components/BalanceDisplay";
import ActionButtons from "../components/ActionButtons";
import SendScreen from "./Send";
import ReceiveScreen from "./Receive";
import { Screen } from "../types";
import { useAppCurrentScreen, useAppSetCurrentScreen } from "@/hooks/useApp";
import { useWalletInstance } from "@/hooks/useWallet";

const useIsOpen = () => {
  const wallet = useWalletInstance();
  const [open, setIsOpen] = useState(false);

  const checkIsOpen = useCallback(() => {
    if (open !== wallet.isOpen()) {
      setIsOpen(wallet.isOpen());
    }
  }, [open, wallet]);

  useEffect(() => {
    checkIsOpen();
  }, [checkIsOpen]);

  return { open, checkIsOpen };
};

const useBalance = (checkIsOpen: () => void) => {
  const wallet = useWalletInstance();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const unsubscribe = wallet.balance.subscribeBalance((newBalance) => {
      checkIsOpen();
      setBalance(newBalance);
    });

    return () => {
      unsubscribe();
    };
  }, [checkIsOpen, wallet]);

  return balance;
};

export default function HomeScreen() {
  const currentScreen = useAppCurrentScreen();
  const setCurrentScreen = useAppSetCurrentScreen();
  const { checkIsOpen } = useIsOpen();
  const balance = useBalance(checkIsOpen);

  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.Send:
        return <SendScreen onComplete={() => setCurrentScreen(Screen.Home)} />;
      case Screen.Receive:
        return (
          <ReceiveScreen onComplete={() => setCurrentScreen(Screen.Home)} />
        );
      default:
        return (
          <>
            <BalanceDisplay balance={balance} />
            <ActionButtons
              onSendClick={() => setCurrentScreen(Screen.Send)}
              onReceiveClick={() => setCurrentScreen(Screen.Receive)}
            />
          </>
        );
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-none">
      <CardContent>{renderScreen()}</CardContent>
    </Card>
  );
}
