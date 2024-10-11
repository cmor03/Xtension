import { useContext } from "react";
import { WalletContext, WalletContextValue } from "../contexts/WalletContext";

export const useWallet = (): WalletContextValue => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
