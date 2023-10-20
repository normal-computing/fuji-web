import { TAXY_ELEMENT_SELECTOR } from '../constants';
import { callRPC, callRPCWithTab } from './pageRPC';
import { scrollScriptString } from './runtimeFunctionStrings';
import { sleep } from './utils';

class DomActions {
  static delayBetweenClicks = 1000; // Set this value to control the delay between clicks
  static delayBetweenKeystrokes = 100; // Set this value to control typing speed

  tabId: number;

  constructor(tabId: number) {
    this.tabId = tabId;
  }

  async sendCommand(method: string, params?: any) {
    return chrome.debugger.sendCommand({ tabId: this.tabId }, method, params);
  }

  async getObjectIdBySelector(selector: string) {
    const document = (await this.sendCommand('DOM.getDocument')) as any;
    const { nodeId } = (await this.sendCommand('DOM.querySelector', {
      nodeId: document.root.nodeId,
      selector,
    })) as any;
    if (!nodeId) {
      throw new Error('Could not find node');
    }
    // get object id
    const result = (await this.sendCommand('DOM.resolveNode', {
      nodeId,
    })) as any;
    const objectId = result.object.objectId;
    if (!objectId) {
      throw new Error('Could not find object');
    }
    return objectId;
  }

  async getObjectId(originalId: number) {
    const uniqueId = await callRPC({
      type: 'getUniqueElementSelectorId',
      payload: [originalId],
    });
    return this.getObjectIdBySelector(
      `[${TAXY_ELEMENT_SELECTOR}="${uniqueId}"]`
    );
  }

  async scrollIntoView(objectId: string) {
    await this.sendCommand('Runtime.callFunctionOn', {
      objectId,
      functionDeclaration: scrollScriptString,
    });
    await sleep(1000);
  }

  async getCenterCoordinates(objectId: string) {
    const { model } = (await this.sendCommand('DOM.getBoxModel', {
      objectId,
    })) as any;
    const [x1, y1, x2, y2, x3, y3, x4, y4] = model.border;
    const centerX = (x1 + x3) / 2;
    const centerY = (y1 + y3) / 2;
    return { x: centerX, y: centerY };
  }

  async clickAtPosition(x: number, y: number, clickCount = 1): Promise<void> {
    callRPC({
      type: 'ripple',
      payload: [x, y],
    });
    await this.sendCommand('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x,
      y,
      button: 'left',
      clickCount,
    });
    await this.sendCommand('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x,
      y,
      button: 'left',
      clickCount,
    });
    await sleep(DomActions.delayBetweenClicks);
  }

  public async click(payload: { elementId: number }) {
    const objectId = await this.getObjectId(payload.elementId);
    await this.scrollIntoView(objectId);
    const { x, y } = await this.getCenterCoordinates(objectId);
    await this.clickAtPosition(x, y);
  }

  public async clickWithSelector(selector: string) {
    const objectId = await this.getObjectIdBySelector(selector);
    await this.scrollIntoView(objectId);
    const { x, y } = await this.getCenterCoordinates(objectId);
    await this.clickAtPosition(x, y);
  }

  async selectAllText(x: number, y: number) {
    await this.clickAtPosition(x, y, 3);
  }

  async typeText(text: string): Promise<void> {
    for (const char of text) {
      await this.sendCommand('Input.dispatchKeyEvent', {
        type: 'keyDown',
        text: char,
      });
      await sleep(DomActions.delayBetweenKeystrokes / 2);
      await this.sendCommand('Input.dispatchKeyEvent', {
        type: 'keyUp',
        text: char,
      });
      await sleep(DomActions.delayBetweenKeystrokes / 2);
    }
  }

  async blurFocusedElement() {
    const blurFocusedElementScript = `
      if (document.activeElement) {
        document.activeElement.blur();
      }
    `;
    await this.sendCommand('Runtime.evaluate', {
      expression: blurFocusedElementScript,
    });
  }

  public async setValue(payload: {
    elementId: number;
    value: string;
  }): Promise<void> {
    const objectId = await this.getObjectId(payload.elementId);
    await this.scrollIntoView(objectId);
    const { x, y } = await this.getCenterCoordinates(objectId);

    await this.selectAllText(x, y);
    await this.typeText(payload.value);
    // blur the element
    await this.blurFocusedElement();
  }

  public async attachFile(payload: { data: string; selector?: string }) {
    await callRPCWithTab(this.tabId, {
      type: 'attachFile',
      payload: [payload.data, payload.selector],
    });
  }
}

export type ActionName =
  | 'click'
  | 'setValue'
  | 'clickWithSelector'
  | 'attachFile';
export type ActionPayload<T extends ActionName> = Parameters<DomActions[T]>[0];

// Call this function from the content script
export const callDOMAction = async <T extends ActionName>(
  tabId: number,
  type: T,
  payload: ActionPayload<T>
): Promise<void> => {
  const domActions = new DomActions(tabId);
  // @ts-expect-error - we know that the type is valid
  await domActions[type](payload);
};
