import "./App.css";
import HomeScreen from "./screens/Home";
import SettingsScreen from "./screens/Settings";
import Header from "./components/Header";
import { Tab } from "./types";
import { WalletProvider } from "./contexts/WalletContext";
import { AppProvider } from "./contexts/AppContext";
import Layout from "./components/Layout";
import { useAppActiveTab } from "./hooks/useApp";

function AppContent() {
  const activeTab = useAppActiveTab();

  return (
    <Layout>
      <Header />
      <div className="flex-grow flex items-center">
        {activeTab === Tab.Wallet ? <HomeScreen /> : <SettingsScreen />}
      </div>
    </Layout>
  );
}

function App() {
  return (
    <WalletProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </WalletProvider>
  );
}

export default App;
