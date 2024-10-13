import React, { createContext, useReducer, ReactNode, useEffect } from 'react';
import XApi from '@/api/XApi';
import { X_ACTION_TYPE, XAPICredentials } from '@/types';

interface XState {
  apiCredentials: XAPICredentials | null;
  api: XApi | null;
}

type XAction =
  | { type: X_ACTION_TYPE.SET_X_CREDENTIALS; payload: XAPICredentials | null }
  | { type: X_ACTION_TYPE.INIT; payload: XState };

interface XContextType {
  state: XState;
  dispatch: React.Dispatch<XAction>;
}

const defaultState: XState = {
  apiCredentials: null,
  api: null,
};

const makeInitialState = (): XState => {
  return defaultState;
};

function xReducer(state: XState, action: XAction): XState {
  const newState = (() => {
    switch (action.type) {
      case X_ACTION_TYPE.SET_X_CREDENTIALS:
        return { ...state, apiCredentials: action.payload };
      case X_ACTION_TYPE.INIT:
        return action.payload;
      default:
        return state;
    }
  })();

  if (JSON.stringify(newState) !== JSON.stringify(state)) {
    chrome.storage.local.set({ xState: newState });
    console.log("X state saved to Chrome storage:", newState);
  }
  return newState;
}

export const XContext = createContext<XContextType>({
  state: defaultState,
  dispatch: () => {},
});

export const XProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(xReducer, makeInitialState());

  useEffect(() => {
    chrome.storage.local.get(["xState"], (result) => {
      if (result.xState) {
        dispatch({ type: X_ACTION_TYPE.INIT, payload: result.xState });
      }
    });
  }, []);

  useEffect(() => {
    if (state.apiCredentials) {
      const api = new XApi(state.apiCredentials);
      dispatch({
        type: X_ACTION_TYPE.INIT,
        payload: { apiCredentials: state.apiCredentials, api },
      });
    } else {
      dispatch({
        type: X_ACTION_TYPE.INIT,
        payload: { apiCredentials: null, api: null },
      });
    }
  }, [state.apiCredentials]);

  return (
    <XContext.Provider value={{ state, dispatch }}>
      {children}
    </XContext.Provider>
  );
};
