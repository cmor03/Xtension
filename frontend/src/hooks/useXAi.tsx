import { useContext } from "react";
import { XAiContext } from "../contexts/XAiContext";
import XAiApi from "../api/XAiApi";
import { XAI_ACTION_TYPE } from "@/types";

export const useXAi = () => {
  const context = useContext(XAiContext);
  if (context === undefined) {
    throw new Error("useXAi must be used within an XAiProvider");
  }
  return context;
};

export const useXAiDispatch = () => {
  const { dispatch } = useXAi();
  return dispatch;
};

export const useXAiApiKey = (): string | null => {
  const { state } = useXAi();
  return state.apiKey;
};

export const useXAiSetApiKey = (): React.Dispatch<string | null> => {
  const dispatch = useXAiDispatch();
  return (payload: string | null) =>
    dispatch({ type: XAI_ACTION_TYPE.SET_API_KEY, payload });
};

export const useXAiApi = (): XAiApi | null => {
  const { state } = useXAi();
  return state.api;
};
