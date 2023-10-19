import { sleep } from './utils';
import type { RPCMethods, MethodName } from '../pages/Content';

type Payload<T extends MethodName> = Parameters<RPCMethods[T]>;
type MethodRT<T extends MethodName> = ReturnType<RPCMethods[T]>;

// Call this function from the content script
export const callRPC = async <T extends MethodName>(
  type: MethodName,
  payload?: Payload<T>,
  maxTries = 1
): Promise<MethodRT<T>> => {
  let queryOptions = { active: true, currentWindow: true };
  let activeTab = (await chrome.tabs.query(queryOptions))[0];

  // If the active tab is a chrome-extension:// page, then we need to get some random other tab for testing
  if (activeTab.url?.startsWith('chrome')) {
    queryOptions = { active: false, currentWindow: true };
    activeTab = (await chrome.tabs.query(queryOptions))[0];
  }

  if (!activeTab?.id) throw new Error('No active tab found');

  let err: any;
  for (let i = 0; i < maxTries; i++) {
    try {
      const response = await chrome.tabs.sendMessage(activeTab.id, {
        type,
        payload: payload || [],
      });
      return response;
    } catch (e) {
      if (i === maxTries - 1) {
        // Last try, throw the error
        err = e;
      } else {
        // Content script may not have loaded, retry
        console.error(e);
        await sleep(1000);
      }
    }
  }
  throw err;
};
