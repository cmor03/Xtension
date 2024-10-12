import "./App.css";
import { WalletProvider } from "./contexts/WalletContext";
import { AppProvider } from "./contexts/AppContext";
import Content from "./Content";
import { XAiProvider } from "./contexts/XAiContext";

function App() {
  return (
    <AppProvider>
      <WalletProvider>
        <XAiProvider>
          <Content />
        </XAiProvider>
      </WalletProvider>
    </AppProvider>
  );
}

export default App;
