import { TAXY_ELEMENT_SELECTOR } from "../../constants";
import { callRPCWithTab } from "./pageRPC";
import { scrollScriptString } from "./runtimeFunctionStrings";
import { sleep, waitFor, waitTillStable } from "../utils";

const DEFAULT_INTERVAL = 500;
const DEFAULT_TIMEOUT = 10000; // 10 seconds

export class DomActions {
  static delayBetweenClicks = 500; // Set this value to control the delay between clicks
  static delayBetweenKeystrokes = 10; // Set this value to control typing speed

  tabId: number;

  constructor(tabId: number) {
    this.tabId = tabId;
  }

  // TODO: investigate whether it's possible to type this
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async sendCommand(method: string, params?: any): Promise<any> {
    return chrome.debugger.sendCommand({ tabId: this.tabId }, method, params);
  }

  private async getObjectIdBySelector(
    selector: string,
  ): Promise<string | undefined> {
    const document = await this.sendCommand("DOM.getDocument");
    const { nodeId } = await this.sendCommand("DOM.querySelector", {
      nodeId: document.root.nodeId,
      selector,
    });
    if (!nodeId) {
      return;
    }
    // get object id
    const result = await this.sendCommand("DOM.resolveNode", {
      nodeId,
    });
    const objectId = result.object.objectId;
    return objectId;
  }

  private async getTaxySelector(originalId: number) {
    const uniqueId = await callRPCWithTab(
      this.tabId,
      "getUniqueElementSelectorId",
      [originalId],
    );
    return `[${TAXY_ELEMENT_SELECTOR}="${uniqueId}"]`;
  }

  private async getObjectId(originalId: number) {
    return this.getObjectIdBySelector(await this.getTaxySelector(originalId));
  }

  private async scrollIntoView(objectId: string) {
    await this.sendCommand("Runtime.callFunctionOn", {
      objectId,
      functionDeclaration: scrollScriptString,
    });
    await sleep(1000);
  }

  private async getCenterCoordinates(objectId: string) {
    const { model } = await this.sendCommand("DOM.getBoxModel", {
      objectId,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [x1, y1, _x2, _y2, x3, y3] = model.border;
    const centerX = (x1 + x3) / 2;
    const centerY = (y1 + y3) / 2;
    return { x: centerX, y: centerY };
  }

  private async clickAtPosition(
    x: number,
    y: number,
    clickCount = 1,
  ): Promise<void> {
    await callRPCWithTab(this.tabId, "ripple", [x, y]);
    await this.sendCommand("Input.dispatchMouseEvent", {
      type: "mousePressed",
      x,
      y,
      button: "left",
      clickCount,
    });
    await sleep(20);
    await this.sendCommand("Input.dispatchMouseEvent", {
      type: "mouseReleased",
      x,
      y,
      button: "left",
      clickCount,
    });
    await sleep(DomActions.delayBetweenClicks);
  }

  private async selectAllText() {
    const metaModifier = await this.getMetaModifier();
    // send command to select all
    await this.sendCommand("Input.dispatchKeyEvent", {
      type: "keyDown",
      modifiers: metaModifier,
      text: "A",
      commands: ["selectAll"],
    });
    await sleep(200);
  }

  private async getMetaModifier(): Promise<number> {
    const platformInfo = await chrome.runtime.getPlatformInfo();
    switch (platformInfo.os) {
      case "mac": // macOS
        return 4; // Meta (Command) key
      default:
        return 2; // Control key
    }
  }

  private async typeText(text: string, shiftEnter = false): Promise<void> {
    const enterModifier = shiftEnter ? 8 : 0;
    for (const char of text) {
      // handle enter
      if (char === "\n") {
        await this.sendCommand("Input.dispatchKeyEvent", {
          type: "rawKeyDown",
          modifiers: enterModifier,
          windowsVirtualKeyCode: 13,
          unmodifiedText: "\r",
          text: "\r",
        });
        await this.sendCommand("Input.dispatchKeyEvent", {
          type: "char",
          modifiers: enterModifier,
          windowsVirtualKeyCode: 13,
          unmodifiedText: "\r",
          text: "\r",
        });
        await this.sendCommand("Input.dispatchKeyEvent", {
          type: "keyUp",
          modifiers: enterModifier,
          windowsVirtualKeyCode: 13,
          unmodifiedText: "\r",
          text: "\r",
        });
        continue;
      }
      await this.sendCommand("Input.dispatchKeyEvent", {
        type: "keyDown",
        text: char,
      });
      await sleep(DomActions.delayBetweenKeystrokes / 2);
      await this.sendCommand("Input.dispatchKeyEvent", {
        type: "keyUp",
        text: char,
      });
      await sleep(DomActions.delayBetweenKeystrokes / 2);
    }
  }

  private async blurFocusedElement() {
    const blurFocusedElementScript = `
      if (document.activeElement) {
        document.activeElement.blur();
      }
    `;
    await this.sendCommand("Runtime.evaluate", {
      expression: blurFocusedElementScript,
    });
  }

  public async waitForElement(
    selector: string,
    interval = DEFAULT_INTERVAL,
    timeout = DEFAULT_TIMEOUT,
  ): Promise<number | undefined> {
    let result: number | undefined;
    waitFor(
      async () => {
        const document = await this.sendCommand("DOM.getDocument");
        const { nodeId } = await this.sendCommand("DOM.querySelector", {
          nodeId: document.root.nodeId,
          selector,
        });
        if (nodeId) {
          result = nodeId;
        }
        return !!nodeId;
      },
      interval,
      timeout / interval,
    );
    return result;
  }

  // Note: if element is not in the DOM, it is "stable" at 0 length
  // so always check if it exists first (e.g. with waitForElement)
  public async waitTillElementRendered(
    selectorExpression: string,
    interval = DEFAULT_INTERVAL,
    timeout = DEFAULT_TIMEOUT,
  ): Promise<void> {
    return waitTillStable(
      async () => {
        const { result } = await this.sendCommand("Runtime.evaluate", {
          expression: `${selectorExpression}?.innerHTML?.length`,
        });
        return result.value || 0;
      },
      interval,
      timeout,
    );
  }

  public async waitTillHTMLRendered(
    interval = DEFAULT_INTERVAL,
    timeout = DEFAULT_TIMEOUT,
  ): Promise<void> {
    return waitTillStable(
      async () => {
        const { result } = await this.sendCommand("Runtime.evaluate", {
          expression: "document.documentElement.innerHTML.length",
        });
        return result.value;
      },
      interval,
      timeout,
    );
  }

  public async attachFile(payload: { data: string; selector?: string }) {
    return callRPCWithTab(this.tabId, "attachFile", [
      payload.data,
      payload.selector || 'input[type="file"]',
    ]);
  }

  public async scrollUp() {
    await this.sendCommand("Runtime.evaluate", {
      expression:
        'window.scrollBy({left: 0, top: -window.innerHeight/1.5, behavior: "smooth"})',
    });
    await sleep(300);
  }

  public async scrollDown() {
    await this.sendCommand("Runtime.evaluate", {
      expression:
        'window.scrollBy({left: 0, top: window.innerHeight/1.5, behavior: "smooth"})',
    });
    await sleep(300);
  }

  public async scrollToTop() {
    await this.sendCommand("Runtime.evaluate", {
      expression: "window.scroll({left: 0, top: 0})",
    });
    await sleep(300);
  }

  public async scrollToBottom() {
    await this.sendCommand("Runtime.evaluate", {
      expression: "window.scroll({left: 0, top: document.body.offsetHeight})",
    });
    await sleep(300);
  }

  public async setValueWithElementId(payload: {
    elementId: number;
    value: string;
    shiftEnter?: boolean;
  }): Promise<boolean> {
    const selector = await this.getTaxySelector(payload.elementId);
    return this.setValueWithSelector({
      selector,
      value: payload.value,
      shiftEnter: payload.shiftEnter,
    });
  }

  public async setValueWithSelector(payload: {
    selector: string;
    value: string;
    shiftEnter?: boolean;
  }): Promise<boolean> {
    const objectId = await this.getObjectIdBySelector(payload.selector);
    if (!objectId) {
      return false;
    }
    // await this.scrollIntoView(objectId);
    const { x, y } = await this.getCenterCoordinates(objectId);

    await this.clickAtPosition(x, y);
    await this.selectAllText();
    await this.typeText(payload.value, payload.shiftEnter ?? false);
    // blur the element
    // await this.blurFocusedElement();
    return true;
  }

  public async clickWithElementId(payload: { elementId: number }) {
    const selector = await this.getTaxySelector(payload.elementId);
    return this.clickWithSelector({ selector });
  }

  public async clickWithSelector(payload: {
    selector: string;
  }): Promise<boolean> {
    const objectId = await this.getObjectIdBySelector(payload.selector);
    if (!objectId) {
      return false;
    }
    // await this.scrollIntoView(objectId);
    const { x, y } = await this.getCenterCoordinates(objectId);
    await this.clickAtPosition(x, y);
    return true;
  }
}
