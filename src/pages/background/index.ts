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
  } else if (message.action === "updateTaskStatus") {
    // Forward message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs.length > 0 && tabs[0].id !== undefined) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: "updateStatus",
          status: message.status,
        });
      }
    });
  } else if (message.action === "updateHistory") {
    console.log("bg broadcasting updateHistory to content script");
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs.length > 0 && tabs[0].id !== undefined) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: "updateHistory",
          history: message.history,
        });
      }
    });
  } else if (message.action === "sendScreenshot") {
    console.log("bg broadcasting sendScreenshot to content script");
    const imageDataBase64 = message.imgData.split(",")[1] || message.imgData;
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs.length > 0 && tabs[0].id !== undefined) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: "sendScreenshot",
          imgData: imageDataBase64,
        });
      }
    });
  } else {
    // Broadcast to other parts of the extension
    chrome.runtime.sendMessage(message);
  }
});
