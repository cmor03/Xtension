import "./App.css";
import { WalletProvider } from "./contexts/WalletContext";
import { AppProvider } from "./contexts/AppContext";
import Content from "./Content";

function App() {
  return (
    <AppProvider>
      <WalletProvider>
        <Content />
      </WalletProvider>
    </AppProvider>
  );
}

export default App;
