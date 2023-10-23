// WARNING: background page does not have access to the DOM.
// Be careful not to import dependencies that use DOM methods.
// Do NOT export anything other than types from this file.

import { sleep } from '../../helpers/utils';
import { DomActions } from '../../helpers/domActions';
import { callRPCWithTab } from '../../helpers/pageRPC';

console.log('This is the background page.');

async function createChatGPTTab() {
  const tab = await chrome.tabs.create({ url: 'https://chat.openai.com/' });
  if (tab && tab.id != null) {
    await chrome.tabs.update(tab.id, { pinned: true });
    await chrome.debugger.attach({ tabId: tab.id }, '1.3');
    console.log(tab);
    // wait for the page to load
    // TODO: replace this with a more robust method
    await sleep(6000);
    // make sure we are on GPT-4 mode
    const domActions = new DomActions(tab.id);
    await domActions.clickWithSelector({ selector: '[data-testid="gpt-4"]' });
    await sleep(2000);
    // get rid of the new user popup
    await domActions.clickWithSelector({
      selector: "[role='dialog'] button.btn",
    });
  } else {
    throw new Error('Could create one tab');
  }
  return tab.id;
}

async function takeScreenshot(): Promise<string | null> {
  const currentWindow = await chrome.windows.getCurrent();
  if (!currentWindow || !currentWindow.id) {
    throw new Error('Could not find window');
  }
  const tabs = await chrome.tabs.query({
    active: true,
    windowId: currentWindow.id,
  });
  const tab = tabs[0];
  if (tab && tab.id != null) {
    await chrome.debugger.attach({ tabId: tab.id }, '1.3');
    await callRPCWithTab(tab.id, {
      type: 'drawLabels',
      payload: [],
    });
    const screenshotData = (await chrome.debugger.sendCommand(
      { tabId: tab.id },
      'Page.captureScreenshot',
      {
        format: 'png', // or 'jpeg'
      }
    )) as any;
    await callRPCWithTab(tab.id, {
      type: 'removeLabels',
      payload: [],
    });
    return screenshotData.data;
  }
  return null;
}

chrome.runtime.onMessage.addListener(async (request, sender) => {
  console.log(
    sender.tab
      ? 'from a content script:' + sender.tab.url
      : 'from the extension',
    request
  );
  if (request.action == 'navigate') {
    const imageData = await takeScreenshot();
    console.log('imageDat', imageData);
    await sleep(500);
    if (imageData) {
      const chatGPTTabId = await createChatGPTTab();
      console.log(chatGPTTabId);
      await sleep(1000);
      callRPCWithTab(chatGPTTabId, {
        type: 'attachFile',
        payload: [imageData],
      });
    }
  }

  return true;
});
