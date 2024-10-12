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
  return true; // Indicates that the response will be sent asynchronously
});
