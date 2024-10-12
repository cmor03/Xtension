import { useContext } from "react";
import { WalletContext, WalletContextValue } from "../contexts/WalletContext";
import { FedimintWallet } from "@fedimint/core-web";

export const useWallet = (): WalletContextValue => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

export const useWalletInstance = (): FedimintWallet => {
  const { state } = useWallet();
  if (!state.wallet) {
    throw new Error("Wallet not initialized");
  }
  return state.wallet;
};
