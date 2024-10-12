console.log("Content script loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in content script:", request);
  if (request.action === "getPageContent") {
    const content = document.documentElement.outerHTML;
    console.log("Sending page content:", content.substring(0, 100) + "...");
    sendResponse({ content: content });
  }
  return true;
});

chrome.runtime.sendMessage({ action: "contentScriptInjected" });
