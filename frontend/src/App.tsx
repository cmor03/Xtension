import { useState } from "react";
import "./App.css";
import HomeScreen from "./screens/Home";
import SettingsScreen from "./screens/Settings";
import Header from "./components/Header";
import { Tab, Screen } from "./types";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-w-[300px] min-h-[400px] flex flex-col">{children}</div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Wallet);
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.Home);
  return (
    <Layout>
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setActiveScreen={setCurrentScreen}
      />
      <div className="flex-grow flex items-center">
        {activeTab === Tab.Wallet ? (
          <HomeScreen
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen}
          />
        ) : (
          <SettingsScreen />
        )}
      </div>
    </Layout>
  );
}

export default App;
