export enum Screen {
  Home = "home",
  Send = "send",
  Receive = "receive",
  GrokChat = "grokchat",
  XSearch = "XSearch",
}

export enum Tab {
  Wallet = "wallet",
  Settings = "settings",
  GrokChat = "grokchat",
  XSearch = "XSearch",
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
  SET_WEBPAGE_CONTENT = "SET_WEBPAGE_CONTENT",
  SET_X_API_KEY = "SET_X_API_KEY",
  SET_X_API_CREDENTIALS = "SET_X_API_CREDENTIALS",
}

export enum WALLET_ACTION_TYPE {
  SET_WALLET = "SET_WALLET",
  SET_OPEN = "SET_OPEN",
  SET_ERROR = "SET_ERROR",
}

export enum XAI_ACTION_TYPE {
  INIT = "INIT",
  SET_API_KEY = "SET_API_KEY",
  SET_X_API_KEY = "SET_X_API_KEY",
}

export enum X_ACTION_TYPE {
  SET_X_CREDENTIALS = 'SET_X_CREDENTIALS',
  INIT = "INIT",
}

export interface SetXAIAPIKeyAction {
  type: APP_ACTION_TYPE.SET_XAI_API_KEY;
  payload: string | null;
}

export interface SetXAPIKeyAction {
  type: APP_ACTION_TYPE.SET_X_API_KEY;
  payload: string | null;
}

export type AppAction =
  | { type: APP_ACTION_TYPE.SET_ACTIVE_TAB; payload: Tab }
  | { type: APP_ACTION_TYPE.SET_CURRENT_SCREEN; payload: Screen }
  | { type: APP_ACTION_TYPE.SET_LOGGED_IN; payload: boolean }
  | { type: APP_ACTION_TYPE.SET_USER; payload: User | null }
  | SetXAIAPIKeyAction
  | SetXAPIKeyAction
  | { type: APP_ACTION_TYPE.SET_WEBPAGE_CONTENT; payload: string | null };

export interface XAPICredentials {
  apiKey: string;
  apiKeySecret: string;
  bearerToken: string;
  accessToken: string;
  accessTokenSecret: string;
}
