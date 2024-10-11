import React, { createContext, useReducer, useEffect } from "react";
import { FedimintWallet } from "@fedimint/core-web";

export interface WalletState {
  wallet: FedimintWallet | null;
  isInitialized: boolean;
  error: string | null;
}

export type WalletAction =
  | { type: "SET_WALLET"; payload: FedimintWallet }
  | { type: "SET_INITIALIZED" }
  | { type: "SET_ERROR"; payload: string };

export interface WalletContextValue {
  state: WalletState;
  dispatch: React.Dispatch<WalletAction>;
}

const initialState: WalletState = {
  wallet: null,
  isInitialized: false,
  error: null,
};

function walletReducer(state: WalletState, action: WalletAction): WalletState {
  switch (action.type) {
    case "SET_WALLET":
      return { ...state, wallet: action.payload };
    case "SET_INITIALIZED":
      return { ...state, isInitialized: true };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

export const WalletContext = createContext<WalletContextValue>({
  state: initialState,
  dispatch: () => {},
});

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(walletReducer, initialState);

  useEffect(() => {
    const initializeWallet = async () => {
      try {
        const FEDI_TESTNET_INVITE_CODE =
          "fed11qgqrgvnhwden5te0v9k8q6rp9ekh2arfdeukuet595cr2ttpd3jhq6rzve6zuer9wchxvetyd938gcewvdhk6tcqqysptkuvknc7erjgf4em3zfh90kffqf9srujn6q53d6r056e4apze5cw27h75";
        const newWallet = new FedimintWallet();

        if (!newWallet.isOpen()) {
          await newWallet.joinFederation(FEDI_TESTNET_INVITE_CODE);
        }

        dispatch({ type: "SET_WALLET", payload: newWallet });
        dispatch({ type: "SET_INITIALIZED" });
      } catch (err) {
        dispatch({
          type: "SET_ERROR",
          payload:
            err instanceof Error ? err.message : "An unknown error occurred",
        });
      }
    };

    initializeWallet();
  }, []);

  return (
    <WalletContext.Provider value={{ state, dispatch }}>
      {children}
    </WalletContext.Provider>
  );
};
