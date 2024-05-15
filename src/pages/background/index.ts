import { findActiveTab } from "@root/src/helpers/browserUtils";
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

chrome.runtime.onMessage.addListener(async (message) => {
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
  } else if (message.action === "updateHistory") {
    // Forward message to content script
    const tab = await findActiveTab();
    if (tab?.id !== undefined) {
      console.log("sending updateHistory message to content script");
      chrome.tabs.sendMessage(tab.id, {
        type: "updateHistory",
        status: message.status,
        history: message.history,
      });
    }
  } else if (message.action === "sendScreenshot") {
    const imageDataBase64 = message.imgData.split(",")[1] || message.imgData;
    const tab = await findActiveTab();
    if (tab?.id !== undefined) {
      console.log("sending sendScreenshot message to content script");
      chrome.tabs.sendMessage(tab.id, {
        type: "sendScreenshot",
        status: message.status,
        imgData: imageDataBase64,
      });
    }
  } else {
    // Broadcast to other parts of the extension
    chrome.runtime.sendMessage(message);
  }
});
