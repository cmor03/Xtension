console.log("Content script loaded");

function clickButton() {
  console.log("Attempting to find the button...");
  const button = document.querySelector('button[data-cy="ai-prompt-submit"]');

  if (button) {
    console.log("Button found:", button);
    console.log("Button properties:", {
      disabled: button.disabled,
      visible: button.offsetParent !== null,
      dimensions: `${button.offsetWidth}x${button.offsetHeight}`,
      text: button.textContent,
    });

    console.log("Attempting to click the button...");
    button.click();

    console.log(
      "Click event dispatched. Checking if any click handlers prevented default action..."
    );

    // Check if the button's default action was prevented
    const clickEvent = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window,
    });
    const clickHandled = button.dispatchEvent(clickEvent);
    console.log("Click event handled without being prevented:", clickHandled);

    return true;
  }

  console.log("Button not found. DOM state:", document.body.innerHTML);
  return false;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in content script:", request);
  if (request.action === "clickStartBuilding") {
    console.log("Attempting to click 'Start Building' button after 1 second");

    setTimeout(() => {
      console.log("Timeout completed, calling clickButton()...");
      const result = clickButton();
      console.log("Click attempt result:", result);
      sendResponse({
        success: result,
        message: result
          ? "Button clicked successfully"
          : "Failed to click button",
      });
    }, 1000);

    return true;
  }
});
