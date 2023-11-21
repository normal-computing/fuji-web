// The content script runs inside each page this extension is enabled on
// Do NOT export anything other than types from this file.

import getAnnotatedDOM, { getUniqueElementSelectorId } from './getAnnotatedDOM';
import { copyToClipboard } from './copyToClipboard';
import attachFile from './attachFile';
import { drawLabels, removeLabels } from './drawLabels';
import ripple from './ripple';
import { getDataFromRenderedMarkdown } from './reverseMarkdown';

export const rpcMethods = {
  getAnnotatedDOM,
  getUniqueElementSelectorId,
  ripple,
  copyToClipboard,
  attachFile,
  drawLabels,
  removeLabels,
  getDataFromRenderedMarkdown,
} as const;

export type RPCMethods = typeof rpcMethods;
type MethodName = keyof RPCMethods;

type RPCMessage = {
  [K in MethodName]: {
    method: K;
    payload: Parameters<RPCMethods[K]>;
  };
}[MethodName];

// This function should run in the content script
const watchForRPCRequests = () => {
  chrome.runtime.onMessage.addListener(
    (message: RPCMessage, sender, sendResponse): true | undefined => {
      const { method, payload } = message;
      if (method in rpcMethods) {
        // @ts-expect-error - we know this is valid (see pageRPC)
        const resp = rpcMethods[method as keyof RPCMethods](...payload);
        if (resp instanceof Promise) {
          resp.then((resolvedResp) => {
            sendResponse(resolvedResp);
          });
          return true;
        } else {
          sendResponse(resp);
        }
      }
    }
  );
};

watchForRPCRequests();
