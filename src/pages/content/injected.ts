// The content script runs inside each page this extension is enabled on

import { RunTask, SetAPIKey, SetTask } from "@root/src/constants";
import { initializeRPC } from "./domOperations";

initializeRPC();

document.addEventListener(SetAPIKey, function (event) {
  if (isCustomEvent(event)) {
    const customEvent = event as CustomEvent;
    chrome.runtime.sendMessage({
      type: "API_KEY",
      value: customEvent.detail.value,
    });
  }
});

document.addEventListener(SetTask, function (event) {
  if (isCustomEvent(event)) {
    const customEvent = event as CustomEvent;
    chrome.runtime.sendMessage({
      type: "SET_TASK",
      value: customEvent.detail.value,
    });
  }
});

document.addEventListener(RunTask, function () {
  chrome.runtime.sendMessage({ type: "RUN_TASK" });
});

// Listen for messages from the background script
chrome.runtime.onMessage.addListener(function (message) {
  switch (message.action) {
    case "updateHistory":
      console.log("sending status and history event");
      dispatchCustomEvent("TaskUpdate", {
        type: "history",
        status: message.status,
        data: message.history,
        errorMessage: message.error,
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

type CustomEventDetail = {
  type: string;
  status: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  errorMessage?: string;
};

function dispatchCustomEvent(eventType: string, detail: CustomEventDetail) {
  const event = new CustomEvent(eventType, { detail });
  document.dispatchEvent(event);
}

function isCustomEvent(event: Event): event is CustomEvent {
  return "detail" in event;
}
