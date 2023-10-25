// WARNING: background page does not have access to the DOM.
// Be careful not to import dependencies that use DOM methods.
// Do NOT export anything other than types from this file.

import { debugMode } from '../../constants';
import { sleep } from '../../helpers/utils';
import { DomActions } from '../../helpers/domActions';
import { callRPCWithTab } from '../../helpers/pageRPC';

async function createChatGPTTab() {
  const tab = await chrome.tabs.create({ url: 'https://chat.openai.com/' });
  if (tab && tab.id != null) {
    await chrome.tabs.update(tab.id, { pinned: true });
    await chrome.debugger.attach({ tabId: tab.id }, '1.3');
    console.log(tab);
    const domActions = new DomActions(tab.id);
    // wait for the page to load
    // TODO: set a timeout and handle it as error, instead of waiting forever
    await domActions.waitTillHTMLRendered();
    // get rid of the new user popup if it shows up
    await domActions.clickWithSelector({
      selector: "[role='dialog'] button.btn",
    });
    // make sure we are on GPT-4 mode
    await domActions.clickWithSelector({ selector: '[data-testid="gpt-4"]' });
  } else {
    throw new Error('Could not create new tab for ChatGPT');
  }
  return tab.id;
}

async function findActiveTab() {
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
    return tab;
  }
  return null;
}

async function takeScreenshot(): Promise<string | null> {
  const tab = await findActiveTab();
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
      await sleep(500);
      const domActions = new DomActions(chatGPTTabId);
      await domActions.attachFile({
        data: imageData,
        selector: 'input[type="file"]',
      });
      await domActions.setValueWithSelector({
        selector: '#prompt-textarea',
        value: request.task, // TODO: add a prompt
      });
      await domActions.waitForElement('[data-testid="send-button"]:enabled');
      console.log('good to send!!');
    }
  }
  if (debugMode) {
    if (request.action == 'injectFunctions') {
      const tab = await findActiveTab();
      if (tab && tab.id) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['mainWorld.bundle.js'],
          world: 'MAIN',
        });
      }
    }
  }

  return true;
});
