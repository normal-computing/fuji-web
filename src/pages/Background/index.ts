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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "openNewTab") {
    chrome.tabs.create({ url: message.url }, (tab) => {
      // You can send back a response if needed
      sendResponse({ status: "Tab opened", tabId: tab.id });
    });

    // Return true to indicate you wish to send a response asynchronously
    return true;
  }
});
