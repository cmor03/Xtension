import { FedimintWallet } from "@fedimint/core-web";

const FEDI_TESTNET_INVITE_CODE =
  "fed11qgqrgvnhwden5te0v9k8q6rp9ekh2arfdeukuet595cr2ttpd3jhq6rzve6zuer9wchxvetyd938gcewvdhk6tcqqysptkuvknc7erjgf4em3zfh90kffqf9srujn6q53d6r056e4apze5cw27h75";

const wallet = new FedimintWallet();

// Initialize the wallet and connect to the federation
const initializeWallet = async () => {
  try {
    if (!wallet.isOpen()) {
      await wallet.joinFederation(FEDI_TESTNET_INVITE_CODE);
    }
    console.log("Wallet initialized and connected to federation");
  } catch (error) {
    console.error("Error initializing wallet:", error);
  }
};

initializeWallet();
declare global {
  interface Window {
    wallet: typeof wallet;
  }
}

(window as Window).wallet = wallet;

export default wallet;
