chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getPageContent") {
    const content = document.documentElement.outerHTML;
    sendResponse({ content: content });
  }
  return true; // Indicates that the response will be sent asynchronously
});
