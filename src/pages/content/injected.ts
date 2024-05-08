// The content script runs inside each page this extension is enabled on

import { initializeRPC } from "./domOperations";

initializeRPC();

document.addEventListener("SetAPIKey", function (event) {
  chrome.runtime.sendMessage({ type: "API_KEY", value: event.detail.value });
});

document.addEventListener("SetTask", function (event) {
  chrome.runtime.sendMessage({
    type: "SET_TASK",
    value: event.detail.value,
  });
});

document.addEventListener("RunTask", function () {
  chrome.runtime.sendMessage({ type: "RUN_TASK" });
});

document.addEventListener("GetTaskStatus", function () {
  // Assuming taskStatus is globally accessible or retrievable
  chrome.runtime.sendMessage({ type: "GET_TASK_STATUS" });
});
