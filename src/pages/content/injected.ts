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

document.addEventListener("GetTaskStatus", function () {
  chrome.runtime.sendMessage({ type: "GET_TASK_STATUS" });
});

document.addEventListener("GetTaskHistory", function () {
  chrome.runtime.sendMessage({ type: "GET_TASK_HISTORY" });
});
