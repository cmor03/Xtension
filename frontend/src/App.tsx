import "./App.css";
import { WalletProvider } from "./contexts/WalletContext";
import { AppProvider } from "./contexts/AppContext";
import Content from "./Content";
import { XAiProvider } from "./contexts/XAiContext";
import { XProvider } from './contexts/XContext';

function App() {
  return (
    <AppProvider>
      <WalletProvider>
        <XAiProvider>
          <XProvider>
            <Content />
          </XProvider>
        </XAiProvider>
      </WalletProvider>
    </AppProvider>
  );
}

export default App;
