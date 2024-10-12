import React, {
  createContext,
  useReducer,
  useEffect,
  useState,
  useCallback,
  useContext,
} from "react";
import { FedimintWallet } from "@fedimint/core-web";
import { WALLET_ACTION_TYPE } from "@/types";
import { AppContext } from "./AppContext";

export interface WalletState {
  wallet: FedimintWallet | undefined;
  isOpen: boolean;
  error: string | null;
}

export type WalletAction =
  | { type: WALLET_ACTION_TYPE.SET_WALLET; payload: FedimintWallet }
  | { type: WALLET_ACTION_TYPE.SET_OPEN }
  | { type: WALLET_ACTION_TYPE.SET_ERROR; payload: string };

export interface WalletContextValue {
  state: WalletState;
  dispatch: React.Dispatch<WalletAction>;
}

const initialState: WalletState = {
  wallet: undefined,
  isOpen: false,
  error: null,
};

function walletReducer(state: WalletState, action: WalletAction): WalletState {
  switch (action.type) {
    case WALLET_ACTION_TYPE.SET_WALLET:
      return { ...state, wallet: action.payload };
    case WALLET_ACTION_TYPE.SET_OPEN:
      return { ...state, isOpen: true };
    case WALLET_ACTION_TYPE.SET_ERROR:
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
  const [isOpen, setIsOpen] = useState(false);
  const { state: appState } = useContext(AppContext);

  const checkIsOpen = useCallback(() => {
    if (state.wallet && isOpen !== state.wallet.isOpen()) {
      setIsOpen(state.wallet.isOpen());
    }
  }, [state.wallet, isOpen]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeWallet = async () => {
      if (state.wallet) {
        return;
      }
      console.log("Initializing wallet");

      try {
        const wallet = new FedimintWallet();
        await wallet.open();

        dispatch({ type: WALLET_ACTION_TYPE.SET_WALLET, payload: wallet });
        dispatch({ type: WALLET_ACTION_TYPE.SET_OPEN });
        console.log("Wallet initialized and connected to federation");

        // Set up balance subscription
        unsubscribe = wallet.balance.subscribeBalance((balance) => {
          checkIsOpen();
          console.log("Current balance:", balance);
        });
      } catch (err) {
        console.error("Error initializing wallet:", err);
        dispatch({
          type: WALLET_ACTION_TYPE.SET_ERROR,
          payload:
            err instanceof Error ? err.message : "An unknown error occurred",
        });
      }
    };

    initializeWallet();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [appState.isLoggedIn, state.wallet, checkIsOpen]);

  if (!state.wallet) {
    // Render a loading state or null while the wallet is being initialized
    return null;
  }

  const contextValue = {
    state,
    dispatch,
    isOpen,
    checkIsOpen,
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};
