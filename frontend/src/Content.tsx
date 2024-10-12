import { useAppActiveTab } from "./hooks/useApp";
import { Tab } from "./types";
import Layout from "./components/Layout";
import Header from "./components/Header";
import HomeScreen from "./screens/Home";
import SettingsScreen from "./screens/Settings";

function Content() {
  const activeTab = useAppActiveTab();

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
