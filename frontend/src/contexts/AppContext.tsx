import React, { createContext, useReducer, ReactNode, useEffect } from "react";
import { Tab, Screen, APP_ACTION_TYPE, User, XAPICredentials } from "../types";

interface AppState {
  activeTab: Tab;
  currentScreen: Screen;
  isLoggedIn: boolean;
  user: User | null;
  XAIAPIkey: string | null;
  XAPICredentials: XAPICredentials | null;
  webpageContent: string | null;
}

export type AppAction =
  | { type: APP_ACTION_TYPE.SET_ACTIVE_TAB; payload: Tab }
  | { type: APP_ACTION_TYPE.SET_CURRENT_SCREEN; payload: Screen }
  | { type: APP_ACTION_TYPE.SET_LOGGED_IN; payload: boolean }
  | { type: APP_ACTION_TYPE.SET_USER; payload: User | null }
  | { type: APP_ACTION_TYPE.SET_XAI_API_KEY; payload: string | null }
  | { type: APP_ACTION_TYPE.SET_X_API_CREDENTIALS; payload: XAPICredentials | null }
  | { type: APP_ACTION_TYPE.SET_WEBPAGE_CONTENT; payload: string | null }
  | { type: "INIT"; payload: AppState };

export interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const defaultState: AppState = {
  activeTab: Tab.Wallet,
  currentScreen: Screen.Home,
  isLoggedIn: false,
  user: null,
  XAIAPIkey: null,
  XAPICredentials: null,
  webpageContent: null,
};

const makeInitialState = (): AppState => {
  const storedState = localStorage.getItem("appState");
  if (storedState) {
    try {
      return JSON.parse(storedState);
    } catch (error) {
      console.error("Failed to parse stored state:", error);
    }
  }
  return defaultState;
};

function appReducer(state: AppState, action: AppAction): AppState {
  const newState = (() => {
    switch (action.type) {
      case APP_ACTION_TYPE.SET_ACTIVE_TAB:
        return { ...state, activeTab: action.payload };
      case APP_ACTION_TYPE.SET_CURRENT_SCREEN:
        return { ...state, currentScreen: action.payload };
      case APP_ACTION_TYPE.SET_LOGGED_IN:
        return { ...state, isLoggedIn: action.payload };
      case APP_ACTION_TYPE.SET_USER:
        return { ...state, user: action.payload };
      case APP_ACTION_TYPE.SET_XAI_API_KEY:
        return { ...state, XAIAPIkey: action.payload };
      case APP_ACTION_TYPE.SET_X_API_CREDENTIALS:
        return { ...state, XAPICredentials: action.payload };
      case APP_ACTION_TYPE.SET_WEBPAGE_CONTENT:
        return { ...state, webpageContent: action.payload };
      case "INIT":
        return action.payload;
      default:
        return state;
    }
  })();

  // Only save state if it has changed
  if (JSON.stringify(newState) !== JSON.stringify(state)) {
    chrome.storage.local.set({ appState: newState });
    console.log("App state saved to Chrome storage:", newState);
  }
  return newState;
}

export const AppContext = createContext<AppContextValue>({
  state: defaultState,
  dispatch: () => {},
});

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(appReducer, makeInitialState());

  useEffect(() => {
    chrome.storage.local.get(["appState", "webpageContent"], (result) => {
      if (result.appState) {
        dispatch({ type: "INIT", payload: result.appState });
      }
      if (result.webpageContent) {
        dispatch({ type: APP_ACTION_TYPE.SET_WEBPAGE_CONTENT, payload: result.webpageContent });
      }
    });

    const messageListener = (request: { action: string; content?: string }) => {
      if (request.action === "UPDATE_WEBPAGE_CONTENT" && request.content) {
        dispatch({ type: APP_ACTION_TYPE.SET_WEBPAGE_CONTENT, payload: request.content });
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  useEffect(() => {
    const saveState = async () => {
      await chrome.storage.local.set({ appState: state });
      console.log("App state saved to Chrome storage:", state);
    };
    saveState();
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};
