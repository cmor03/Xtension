import { useContext } from "react";
import { WalletContext, WalletContextValue } from "../contexts/WalletContext";
import { FedimintWallet } from "@fedimint/core-web";

export const useWallet = (): WalletContextValue => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  console.log("context", context);
  return context;
};

export const useWalletIsOpen = (): boolean => {
  const { state } = useWallet();
  return state.isOpen;
};

export const useWalletInstance = (): FedimintWallet => {
  const { state } = useWallet();
  if (!state.wallet) {
    throw new Error("Wallet not initialized");
  }
  return state.wallet;
};
