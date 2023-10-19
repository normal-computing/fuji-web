// The content script runs inside each page this extension is enabled on
// Do NOT export anything other than types from this file.

import getAnnotatedDOM, { getUniqueElementSelectorId } from './getAnnotatedDOM';
import { copyToClipboard } from './copyToClipboard';
import attachFile from './attachFile';

import ripple from './ripple';

const rpcMethods = {
  getAnnotatedDOM,
  getUniqueElementSelectorId,
  ripple,
  copyToClipboard,
  attachFile,
} as const;

export type RPCMethods = typeof rpcMethods;
export type MethodName = keyof RPCMethods;

const isKnownMethodName = (type: string): type is MethodName => {
  return type in rpcMethods;
};

// This function should run in the content script
const watchForRPCRequests = () => {
  chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse): true | undefined => {
      const type = message.type;
      console.log(message);
      if (isKnownMethodName(type)) {
        // @ts-expect-error we need to type payload
        const resp = rpcMethods[type](...message.payload);
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
