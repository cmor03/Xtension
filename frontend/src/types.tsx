export enum Screen {
  Home = "home",
  Send = "send",
  Receive = "receive",
  GrokChat = "grokchat",
  Agent = "agent",
}

export enum Tab {
  Wallet = "wallet",
  Settings = "settings",
  GrokChat = "grokchat",
  Agent = "agent",
}

export interface User {
  id: string;
  name: string;
}

export enum APP_ACTION_TYPE {
  SET_ACTIVE_TAB = "SET_ACTIVE_TAB",
  SET_CURRENT_SCREEN = "SET_CURRENT_SCREEN",
  SET_LOGGED_IN = "SET_LOGGED_IN",
  SET_USER = "SET_USER",
  SET_XAI_API_KEY = "SET_XAI_API_KEY",
  SET_X_API_KEY = "SET_X_API_KEY",
}

export enum WALLET_ACTION_TYPE {
  SET_WALLET = "SET_WALLET",
  SET_OPEN = "SET_OPEN",
  SET_ERROR = "SET_ERROR",
}

export enum XAI_ACTION_TYPE {
  INIT = "INIT",
  SET_API_KEY = "SET_API_KEY",
}
