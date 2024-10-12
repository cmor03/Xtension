console.log("Content script loaded");

function getPageContent() {
  return document.documentElement.outerHTML;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in content script:", request);
  if (request.action === "getPageContent") {
    const content = getPageContent();
    console.log("Sending page content:", content.substring(0, 100) + "...");
    sendResponse({ content: content });
  }
  return true;
});

chrome.runtime.sendMessage({ action: "contentScriptInjected" });

// Initial content grab when the script loads
const initialContent = getPageContent();
chrome.runtime.sendMessage({ action: "STORE_WEBPAGE_CONTENT", content: initialContent });
