console.log("Content script loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in content script:", request);

  if (request.action === "getPageContent") {
    const content = document.documentElement.outerHTML;
    sendResponse({ content: content });
  }

  if (request.action === "clickStartBuilding") {
    const startBuildingButton = document.querySelector('button[data-testid="start-building-button"]');
    if (startBuildingButton) {
      startBuildingButton.click();
      sendResponse({ status: "Button clicked" });
    } else {
      sendResponse({ status: "Button not found" });
    }
  }

  return true; // Indicates that the response will be sent asynchronously
});

// Notify background script that content script has been injected
chrome.runtime.sendMessage({ action: "contentScriptInjected" });
