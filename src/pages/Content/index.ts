// The content script runs inside each page this extension is enabled on
// Do NOT export anything other than types from this file.

import getAnnotatedDOM, { getUniqueElementSelectorId } from './getAnnotatedDOM';
import { copyToClipboard } from './copyToClipboard';
import attachFile from './attachFile';
import drawLabels from './drawLabels';
import ripple from './ripple';

const rpcMethods = {
  getAnnotatedDOM,
  getUniqueElementSelectorId,
  ripple,
  copyToClipboard,
  attachFile,
  drawLabels,
} as const;

export type RPCMethods = typeof rpcMethods;
export type MethodName = keyof RPCMethods;
export type Payload<T extends MethodName> = Parameters<RPCMethods[T]>;
// export type MethodRT<T extends MethodName> = ReturnType<RPCMethods[T]>;
export type MethodRT = {
  [K in MethodName]: ReturnType<RPCMethods[MethodName]>;
}[MethodName];
export type RPCMessage = {
  [K in MethodName]: {
    type: K;
    payload: Parameters<RPCMethods[K]>;
  };
}[MethodName];

const isKnownMethodName = (type: string) => {
  return type in rpcMethods;
};

// This function should run in the content script
const watchForRPCRequests = () => {
  chrome.runtime.onMessage.addListener(
    (message: RPCMessage, sender, sendResponse): true | undefined => {
      if (!isKnownMethodName(message.type)) {
        return;
      }
      // @ts-expect-error - we know that the payload type is valid
      const resp = rpcMethods[message.type](...message.payload);
      if (resp instanceof Promise) {
        resp.then((resolvedResp) => {
          sendResponse(resolvedResp);
        });
        return true;
      } else {
        sendResponse(resp);
      }
    }
  );
};

watchForRPCRequests();
