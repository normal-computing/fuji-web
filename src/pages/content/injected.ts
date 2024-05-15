// The content script runs inside each page this extension is enabled on

import { initializeRPC } from "./domOperations";

initializeRPC();

document.addEventListener("SetAPIKey", function (event) {
  const customEvent = event as CustomEvent;
  chrome.runtime.sendMessage({
    type: "API_KEY",
    value: customEvent.detail.value,
  });
});

document.addEventListener("SetTask", function (event) {
  const customEvent = event as CustomEvent;
  chrome.runtime.sendMessage({
    type: "SET_TASK",
    value: customEvent.detail.value,
  });
});

document.addEventListener("RunTask", function () {
  chrome.runtime.sendMessage({ type: "RUN_TASK" });
});

// Listen for messages from the background script
chrome.runtime.onMessage.addListener(function (message) {
  switch (message.type) {
    case "updateHistory":
      console.log("sending status and history event");
      dispatchCustomEvent("TaskUpdate", {
        type: "history",
        status: message.status,
        data: message.history,
      });
      break;
    case "sendScreenshot":
      console.log("sending screenshot event");
      dispatchCustomEvent("TaskUpdate", {
        type: "screenshot",
        status: message.status,
        data: message.imgData,
      });
      break;
  }
});

function dispatchCustomEvent(eventType: string, detail) {
  const event = new CustomEvent(eventType, { detail });
  document.dispatchEvent(event);
}
