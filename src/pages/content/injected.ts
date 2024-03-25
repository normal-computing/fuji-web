// The content script runs inside each page this extension is enabled on

import { initializeRPC } from "./domOperations";
import { injectIframe } from "./permission";

initializeRPC();
injectIframe();
