import getAnnotatedDOM, {
  getUniqueElementSelectorId,
} from '../pages/Content/getAnnotatedDOM';
import { copyToClipboard } from '../pages/Content/copyToClipboard';

import ripple from '../pages/Content/ripple';
import { sleep } from './utils';

export const rpcMethods = {
  getAnnotatedDOM,
  getUniqueElementSelectorId,
  ripple,
  copyToClipboard,
  submitScreenshot,
} as const;

export type RPCMethods = typeof rpcMethods;
type MethodName = keyof RPCMethods;
type Payload<T extends MethodName> = Parameters<RPCMethods[T]>;
type MethodRT<T extends MethodName> = ReturnType<RPCMethods[T]>;

function base64ToBlob(base64: string, mimeType = '') {
  const byteCharacters = atob(base64);
  const byteNumbers = Array.from(byteCharacters, (char) => char.charCodeAt(0));
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

export function submitScreenshot(data: string) {
  console.log('screenshot');
  const screenshotBlob = base64ToBlob(data, 'image/png');
  // Create a virtual input element
  const input = document.createElement('input');
  input.type = 'file';
  input.style.display = 'none';

  // Append to the document
  document.body.appendChild(input);

  // Simulate file input for the screenshot blob
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(new File([screenshotBlob], 'screenshot.png'));
  input.files = dataTransfer.files;

  // Find the actual file input on the page and set its files property
  const actualFileInput = document.querySelector(
    'input[type="file"]'
  ) as HTMLInputElement;
  console.log(actualFileInput);
  if (!actualFileInput) {
    console.log('could not find file input');
    return;
  }
  actualFileInput.files = input.files;
  console.log(actualFileInput.files);

  actualFileInput.dispatchEvent(
    new Event('input', { bubbles: true, composed: true })
  );
  actualFileInput.dispatchEvent(new Event('change', { bubbles: true }));

  // Clean up
  document.body.removeChild(input);
}

// Call this function from the content script
export const callRPC = async <T extends MethodName>(
  type: keyof typeof rpcMethods,
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

const isKnownMethodName = (type: string): type is MethodName => {
  return type in rpcMethods;
};

// This function should run in the content script
export const watchForRPCRequests = () => {
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
