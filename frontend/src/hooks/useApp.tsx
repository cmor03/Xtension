import { useContext } from "react";
import { AppAction, AppContext, AppContextValue } from "../contexts/AppContext";
import { Tab, Screen, APP_ACTION_TYPE } from "@/types";

export const useApp = (): AppContextValue => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

export const useAppDispatch = (): React.Dispatch<AppAction> => {
  const { dispatch } = useApp();
  return dispatch;
};

export const useAppSetActiveTab = (): React.Dispatch<Tab> => {
  const dispatch = useAppDispatch();
  return (payload: Tab) =>
    dispatch({ type: APP_ACTION_TYPE.SET_ACTIVE_TAB, payload });
};

export const useAppSetCurrentScreen = (): React.Dispatch<Screen> => {
  const dispatch = useAppDispatch();
  return (payload: Screen) =>
    dispatch({ type: APP_ACTION_TYPE.SET_CURRENT_SCREEN, payload });
};

export const useAppActiveTab = (): Tab => {
  const { state } = useApp();
  return state.activeTab;
};

export const useAppCurrentScreen = (): Screen => {
  const { state } = useApp();
  return state.currentScreen;
};
