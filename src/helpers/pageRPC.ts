import { sleep } from './utils';
import type { MethodRT, RPCMessage } from '../pages/Content';

// Call these functions to execute code in the content script

export const callRPC = async (
  message: RPCMessage,
  maxTries = 1
): Promise<MethodRT> => {
  let queryOptions = { active: true, currentWindow: true };
  let activeTab = (await chrome.tabs.query(queryOptions))[0];

  // If the active tab is a chrome-extension:// page, then we need to get some random other tab for testing
  if (activeTab.url?.startsWith('chrome')) {
    queryOptions = { active: false, currentWindow: true };
    activeTab = (await chrome.tabs.query(queryOptions))[0];
  }

  if (!activeTab?.id) throw new Error('No active tab found');
  return callRPCWithTab(activeTab.id, message, maxTries);
};

export const callRPCWithTab = async (
  tabId: number,
  message: RPCMessage,
  maxTries = 1
): Promise<MethodRT> => {
  let err: any;
  for (let i = 0; i < maxTries; i++) {
    try {
      const response = await chrome.tabs.sendMessage(tabId, {
        type: message.type,
        payload: message.payload || [],
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
