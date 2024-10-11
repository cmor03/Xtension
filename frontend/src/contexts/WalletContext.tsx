import React, {
  createContext,
  useReducer,
  useEffect,
  useState,
  useCallback,
} from "react";
import { FedimintWallet } from "@fedimint/core-web";
import { WALLET_ACTION_TYPE } from "@/types";

const FEDI_TESTNET_INVITE_CODE =
  "fed11qgqrgvnhwden5te0v9k8q6rp9ekh2arfdeukuet595cr2ttpd3jhq6rzve6zuer9wchxvetyd938gcewvdhk6tcqqysptkuvknc7erjgf4em3zfh90kffqf9srujn6q53d6r056e4apze5cw27h75";

export interface WalletState {
  wallet: FedimintWallet | null;
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
  wallet: null,
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

  const checkIsOpen = useCallback(() => {
    if (state.wallet && isOpen !== state.wallet.isOpen()) {
      setIsOpen(state.wallet.isOpen());
    }
  }, [state.wallet, isOpen]);

  useEffect(() => {
    const initializeWallet = async () => {
      try {
        const wallet = new FedimintWallet();
        await wallet.open();

        if (!wallet.isOpen()) {
          await wallet.joinFederation(FEDI_TESTNET_INVITE_CODE);
        }

        dispatch({ type: WALLET_ACTION_TYPE.SET_WALLET, payload: wallet });
        dispatch({ type: WALLET_ACTION_TYPE.SET_OPEN });
        console.log("Wallet initialized and connected to federation");

        // Set up balance subscription
        const unsubscribe = wallet.balance.subscribeBalance((balance) => {
          checkIsOpen();
          console.log("Current balance:", balance);
        });

        return () => {
          unsubscribe();
        };
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
  }, [checkIsOpen]);

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
