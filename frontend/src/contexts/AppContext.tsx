import React, { createContext, useReducer, ReactNode } from "react";
import { Tab, Screen, APP_ACTION_TYPE } from "../types";

interface AppState {
  activeTab: Tab;
  currentScreen: Screen;
}

export type AppAction =
  | { type: APP_ACTION_TYPE.SET_ACTIVE_TAB; payload: Tab }
  | { type: APP_ACTION_TYPE.SET_CURRENT_SCREEN; payload: Screen };

export interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const initialState: AppState = {
  activeTab: Tab.Wallet,
  currentScreen: Screen.Home,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case APP_ACTION_TYPE.SET_ACTIVE_TAB:
      return { ...state, activeTab: action.payload };
    case APP_ACTION_TYPE.SET_CURRENT_SCREEN:
      return { ...state, currentScreen: action.payload };
    default:
      return state;
  }
}

export const AppContext = createContext<AppContextValue>({
  state: initialState,
  dispatch: () => {},
});

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};
