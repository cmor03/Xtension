console.log("Background script loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in background script:", request);
  
  if (request.action === "buildWithAgent") {
    console.log("Creating new tab for Replit");
    chrome.tabs.create(
      { url: `https://replit.com/new/nix?tab=ai&prompt=${request.prompt}` },
      (tab) => {
        if (tab.id) {
          console.log("Tab created with ID:", tab.id);
          chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
            console.log("Tab updated event:", tabId, info.status);
            if (tabId === tab.id && info.status === "complete") {
              console.log("Sending clickStartBuilding message to tab:", tabId);
              chrome.tabs.sendMessage(
                tabId,
                { action: "clickStartBuilding" },
                (response) => {
                  if (chrome.runtime.lastError) {
                    console.error(
                      "Error sending message:",
                      chrome.runtime.lastError
                    );
                  } else {
                    console.log(
                      "Message sent successfully, response:",
                      response
                    );
                  }
                }
              );
              chrome.tabs.onUpdated.removeListener(listener);
            }
          });
        } else {
          console.error("Failed to create tab");
        }
      }
    );
  }

  if (request.action === "contentScriptInjected") {
    console.log("Content script has been injected");
  }

  if (request.action === "STORE_WEBPAGE_CONTENT") {
    console.log("Content received from content script:", request.content);
    chrome.storage.local.set({ webpageContent: request.content }, function() {
      console.log("Webpage content saved to storage.");
      chrome.runtime.sendMessage({ action: "UPDATE_WEBPAGE_CONTENT", content: request.content });
    });
    sendResponse({ status: "Content saved" });
    return true;
  }
  
  if (request.action === "getPageContent") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        console.error("Error querying tabs:", chrome.runtime.lastError);
        sendResponse({ error: chrome.runtime.lastError.message });
        return;
      }
      
      const activeTab = tabs[0];
      if (!activeTab || !activeTab.id) {
        console.error("No active tab found");
        sendResponse({ error: "No active tab found" });
        return;
      }

      chrome.tabs.sendMessage(activeTab.id, { action: "getPageContent" }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error sending message to content script:", chrome.runtime.lastError);
          sendResponse({ error: chrome.runtime.lastError.message });
        } else if (response && response.content) {
          console.log("Webpage content received:", response.content.substring(0, 100) + "...");
          chrome.storage.local.set({ webpageContent: response.content }, function() {
            console.log("Webpage content saved to storage.");
            chrome.runtime.sendMessage({ action: "UPDATE_WEBPAGE_CONTENT", content: response.content });
          });
          sendResponse({ content: response.content });
        } else {
          console.log("Failed to receive content");
          sendResponse({ error: "Failed to receive content" });
        }
      });
    });
    return true; // Indicates that the response will be sent asynchronously
  }

  return true; // Indicates that the response will be sent asynchronously
});
