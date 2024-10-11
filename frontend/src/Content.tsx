import { useAppActiveTab, useAppIsLoggedIn } from "./hooks/useApp";
import { Tab } from "./types";
import Layout from "./components/Layout";
import Header from "./components/Header";
import HomeScreen from "./screens/Home";
import SettingsScreen from "./screens/Settings";
import ConnectScreen from "./screens/Connect";

function Content() {
  const isLoggedIn = useAppIsLoggedIn();
  const activeTab = useAppActiveTab();

  if (!isLoggedIn) {
    return (
      <Layout>
        <Header />
        <main className="flex-grow p-6">
          <div className="max-w-4xl mx-auto">
            <ConnectScreen />
          </div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header />
      <main className="flex-grow p-6">
        <div className="max-w-4xl mx-auto">
          {activeTab === Tab.Wallet ? <HomeScreen /> : <SettingsScreen />}
        </div>
      </main>
    </Layout>
  );
}

export default Content;
