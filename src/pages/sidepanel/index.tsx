import { createRoot } from "react-dom/client";

import App from "@src/common/App";

import refreshOnUpdate from "virtual:reload-on-update-in-view";

refreshOnUpdate("pages/sidepanel");

function init() {
  const appContainer = document.querySelector("#app-container");
  if (!appContainer) {
    throw new Error("Can not find #app-container");
  }
  const root = createRoot(appContainer);
  root.render(<App />);
}

init();
