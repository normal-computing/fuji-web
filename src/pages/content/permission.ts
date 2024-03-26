export const injectMicrophonePermissionIframe = () => {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("hidden", "hidden");
  iframe.setAttribute("id", "permissionsIFrame");
  iframe.setAttribute("allow", "microphone");
  iframe.src = chrome.runtime.getURL("/src/pages/permission/index.html");
  document.body.appendChild(iframe);
};
