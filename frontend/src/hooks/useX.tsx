import { useContext } from "react";
import { XContext } from "@/contexts/XContext";
import XApi from "@/api/XApi";
import { X_ACTION_TYPE } from "@/types";

export interface XAPICredentials {
  apiKey: string;
  apiKeySecret: string;
  bearerToken: string;
  accessToken: string;
  accessTokenSecret: string;
}

export const useX = () => {
  const context = useContext(XContext);
  if (context === undefined) {
    throw new Error("useX must be used within an XProvider");
  }
  return context;
};

export const useXDispatch = () => {
  const { dispatch } = useX();
  return dispatch;
};

export const useXAPICredentials = (): XAPICredentials | null => {
  const { state } = useX();
  return state.apiCredentials;
};

export const useXSetAPICredentials = (): React.Dispatch<XAPICredentials | null> => {
  const dispatch = useXDispatch();
  return (payload: XAPICredentials | null) =>
    dispatch({ type: X_ACTION_TYPE.SET_X_CREDENTIALS, payload });
};

export const useXApi = (): XApi | null => {
  const { state } = useX();
  return state.api;
};

export const useXApiKey = (): string | null => {
  const credentials = useXAPICredentials();
  return credentials?.apiKey || null;
};

export const useXApiKeySecret = (): string | null => {
  const credentials = useXAPICredentials();
  return credentials?.apiKeySecret || null;
};

export const useXBearerToken = (): string | null => {
  const credentials = useXAPICredentials();
  return credentials?.bearerToken || null;
};

export const useXAccessToken = (): string | null => {
  const credentials = useXAPICredentials();
  return credentials?.accessToken || null;
};

export const useXAccessTokenSecret = (): string | null => {
  const credentials = useXAPICredentials();
  return credentials?.accessTokenSecret || null;
};