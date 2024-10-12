console.log("Content script loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in content script:", request);
  if (request.action === "getPageContent") {
    const content = document.documentElement.outerHTML;
    console.log("Sending page content:", content.substring(0, 100) + "...");
    sendResponse({ content: content });
  }
  return true; // Indicates that the response will be sent asynchronously
});

chrome.runtime.sendMessage({ action: "contentScriptInjected" });

// Initial content grab when the script loads
const initialContent = document.documentElement.outerHTML;
chrome.runtime.sendMessage({ action: "STORE_WEBPAGE_CONTENT", content: initialContent });
