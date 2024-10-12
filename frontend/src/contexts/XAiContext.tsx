import React, { createContext, useReducer, ReactNode, useEffect } from "react";
import XAiApi from "../api/XAiApi";
import { XAI_ACTION_TYPE } from "@/types";

interface XAiState {
  apiKey: string | null;
  api: XAiApi | null;
}

type XAiAction =
  | { type: XAI_ACTION_TYPE.SET_API_KEY; payload: string | null }
  | { type: XAI_ACTION_TYPE.INIT; payload: XAiState };

interface XAiContextValue {
  state: XAiState;
  dispatch: React.Dispatch<XAiAction>;
}

const defaultState: XAiState = {
  apiKey: null,
  api: null,
};

function xAiReducer(state: XAiState, action: XAiAction): XAiState {
  switch (action.type) {
    case XAI_ACTION_TYPE.SET_API_KEY:
      return { ...state, apiKey: action.payload };
    case XAI_ACTION_TYPE.INIT:
      return action.payload;
    default:
      return state;
  }
}

export const XAiContext = createContext<XAiContextValue>({
  state: defaultState,
  dispatch: () => {},
});

export const XAiProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(xAiReducer, defaultState);

  useEffect(() => {
    if (state.apiKey) {
      const api = new XAiApi(state.apiKey);
      dispatch({
        type: XAI_ACTION_TYPE.INIT,
        payload: { apiKey: state.apiKey, api },
      });
    } else {
      dispatch({
        type: XAI_ACTION_TYPE.INIT,
        payload: { apiKey: null, api: null },
      });
    }
  }, [state.apiKey]);

  return (
    <XAiContext.Provider value={{ state, dispatch }}>
      {children}
    </XAiContext.Provider>
  );
};
