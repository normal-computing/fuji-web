import reloadOnUpdate from "virtual:reload-on-update-in-background-script";
import "webextension-polyfill";

reloadOnUpdate("pages/background");

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate("pages/content/style.scss");

console.log("background loaded");

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "injectFunctions") {
    if (message.tabId == null) {
      console.log("no active tab found");
    } else {
      chrome.scripting.executeScript({
        target: { tabId: message.tabId },
        files: ["assets/js/mainWorld.js"],
        world: "MAIN",
      });
    }
    return true;
  } else if (message.type === "POST_TASK_STATUS") {
    sendStatusToPython(message.value);
  } else if (message.type === "POST_TASK_HISTORY") {
    sendTaskHistoryToPython(message.value);
  } else {
    // Broadcast to other parts of the extension
    chrome.runtime.sendMessage(message);
  }
});

function sendStatusToPython(status: string) {
  fetch("http://localhost:5000/status", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: status }),
  })
    .then((response) => response.json())
    .then((data) => console.log("From Python server:", data))
    .catch((error) =>
      console.error("Error updating status to Python server:", error),
    );
}

function sendTaskHistoryToPython(history) {
  fetch("http://localhost:5000/history", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ history: history }),
  })
    .then((response) => response.json())
    .then((data) => console.log("From Python server:", data))
    .catch((error) =>
      console.error("Error sending history to Python server:", error),
    );
}
