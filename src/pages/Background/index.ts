// WARNING: background page does not have access to the DOM.
// Be careful not to import dependencies that use DOM methods.
// Do NOT export anything other than types from this file.

import { debugMode } from '../../constants';
import { sleep } from '../../helpers/utils';
import { DomActions } from '../../helpers/domActions';
import { callRPCWithTab } from '../../helpers/pageRPC';
import { getPrompt } from './prompt';
import { attachDebugger } from '../../helpers/chromeDebugger';

const GPT4_BUTTON_SELECTOR = '[data-testid="gpt-4"]';
const SHARED_CHAT =
  'https://chat.openai.com/share/4116307f-6853-4fc5-8840-2698a06f8963';
const SHARED_CHAT_SELECTOR = `[to="${SHARED_CHAT}/continue"]`;
const FINAL_MESSAGE_SELECTOR =
  '.final-completion[data-testid*="conversation-turn-"]';

async function createChatGPTTab() {
  const tab = await chrome.tabs.create({
    url: SHARED_CHAT,
  });
  if (tab && tab.id != null) {
    console.log(tab);
    await attachDebugger(tab.id);
    const domActions = new DomActions(tab.id);
    // wait for the page to load
    await domActions.waitTillHTMLRendered();
    // this is a shared chat, we expect to find a "Continue this conversation" button
    await domActions.waitForElement(SHARED_CHAT_SELECTOR);
    await domActions.clickWithSelector({ selector: SHARED_CHAT_SELECTOR });
    // wait for the actual Chat Screen page to load
    await sleep(1500);
    await domActions.waitTillHTMLRendered();
    // get rid of the new user popup if it shows up
    await domActions.clickWithSelector({
      selector: "[role='dialog'] button.btn",
    });
    // make sure we are on GPT-4 mode
    // await domActions.waitForElement(GPT4_BUTTON_SELECTOR, 500, 10000);
    // await domActions.clickWithSelector({ selector: GPT4_BUTTON_SELECTOR });
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

async function takeScreenshot(tabId: number): Promise<string | null> {
  await attachDebugger(tabId);
  await callRPCWithTab(tabId, {
    type: 'drawLabels',
    payload: [],
  });
  const screenshotData = (await chrome.debugger.sendCommand(
    { tabId: tabId },
    'Page.captureScreenshot',
    {
      format: 'png', // or 'jpeg'
    }
  )) as any;
  await callRPCWithTab(tabId, {
    type: 'removeLabels',
    payload: [],
  });
  return screenshotData.data;
}

chrome.runtime.onMessage.addListener(async (request, sender) => {
  console.log(
    sender.tab
      ? 'from a content script:' + sender.tab.url
      : 'from the extension',
    request
  );
  if (request.action == 'runTask') {
    const tab = await findActiveTab();
    if (!tab || tab.id == null) {
      return;
    }

    const imageData = await takeScreenshot(tab.id);
    await sleep(200);
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
        value: getPrompt(request.task),
        shiftEnter: true,
      });
      await domActions.waitForElement('[data-testid="send-button"]:enabled');
      await domActions.clickWithSelector({
        selector: '[data-testid="send-button"]:enabled',
      });
      await sleep(500);
      // make sure the .final-completion element is rendered
      await domActions.waitForElement(FINAL_MESSAGE_SELECTOR);
      // at this point ChatGPT should be streaming the latest message, wait for it to finish
      // TODO: investigate if there's a better way to do this
      await domActions.waitTillElementRendered(
        `document.querySelector('${FINAL_MESSAGE_SELECTOR}')`
      );
      const message = await callRPCWithTab(chatGPTTabId, {
        type: 'getDataFromRenderedMarkdown',
        payload: [FINAL_MESSAGE_SELECTOR],
      });
      // TODO: make this more robust
      if (message && typeof message === 'object' && message.codeBlocks) {
        const codeBlock = message.codeBlocks[0] || '{}';
        try {
          const action = JSON.parse(codeBlock);
          // TODO: handle actions
          if (action.action === 'click') {
            // await chrome.tabs.update(tab.id, {
            //   active: true,
            // });
            // const domActionsOnOldTab = new DomActions(tab.id);
            // // click on the element
            // await domActionsOnOldTab.clickWithSelector({
            //   selector: action.selector,
            // });
          }
        } catch (e) {
          console.log('bad action format');
          console.log(e);
        }
      }
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
