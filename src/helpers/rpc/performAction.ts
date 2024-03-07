import { DomActions } from "./domActions";
import {
  WEB_WAND_LABEL_ATTRIBUTE_NAME,
  VISIBLE_TEXT_ATTRIBUTE_NAME,
} from "../../constants";

function getSelector(label: string): string {
  return `[${WEB_WAND_LABEL_ATTRIBUTE_NAME}="${label}"]`;
}

function getFallbackSelector(selectorName: string): string {
  return `[${VISIBLE_TEXT_ATTRIBUTE_NAME}="${selectorName}"]`;
}

export type ActionName = "click" | "setValue" | "scroll" | "finish";

export type ActionWithLabel = {
  name: ActionName;
  args: {
    label: string;
    value?: string;
  };
};

export type ActionWithElementId = {
  name: ActionName;
  args: {
    elementId: string;
    value?: string;
  };
};

export type ActionWithSelector = {
  name: ActionName;
  args: {
    selector: string;
    value?: string;
  };
};

export type Action = ActionWithLabel | ActionWithElementId | ActionWithSelector;

// Type guards
function isActionWithLabel(action: Action): action is ActionWithLabel {
  return "label" in action.args;
}

function isActionWithElementId(action: Action): action is ActionWithElementId {
  return "elementId" in action.args;
}

function isActionWithSelector(action: Action): action is ActionWithSelector {
  return "selector" in action.args;
}

async function clickWithSelector(
  domActions: DomActions,
  selector: string,
): Promise<boolean> {
  console.log("clickWithSelector", selector);
  return await domActions.clickWithSelector({
    selector,
  });
}

async function clickWithElementId(
  domActions: DomActions,
  elementId: string,
): Promise<boolean> {
  console.log("clickWithElementId", elementId);
  return await domActions.clickWithElementId({
    elementId: parseInt(elementId),
  });
}

async function clickWithLabel(
  domActions: DomActions,
  label: string,
): Promise<boolean> {
  console.log("clickWithLabel", label);
  let success = false;
  try {
    success = await domActions.clickWithSelector({
      selector: `#${label}`,
    });
  } catch (e) {
    // `#${selectorName}` might not be valid
  }
  if (success) return true;
  success = await domActions.clickWithSelector({
    selector: getSelector(label),
  });
  if (success) return true;
  return await domActions.clickWithSelector({
    selector: getFallbackSelector(label),
  });
}

async function setValueWithSelector(
  domActions: DomActions,
  selector: string,
  value: string,
): Promise<boolean> {
  console.log("setValueWithSelector", selector);
  return await domActions.setValueWithSelector({
    selector,
    value,
  });
}

async function setValueWithElementId(
  domActions: DomActions,
  elementId: string,
  value: string,
): Promise<boolean> {
  console.log("setValueWithElementId", elementId);
  return await domActions.setValueWithElementId({
    elementId: parseInt(elementId),
    value,
  });
}

async function setValueWithLabel(
  domActions: DomActions,
  label: string,
  value: string,
): Promise<boolean> {
  console.log("setValueWithLabel", label);
  let success = false;
  try {
    success = await domActions.setValueWithSelector({
      selector: `#${label}`,
      value,
    });
  } catch (e) {
    // `#${selectorName}` might not be valid
  }
  if (success) return true;
  success = await domActions.setValueWithSelector({
    selector: getSelector(label),
    value,
  });
  if (success) return true;
  return await domActions.setValueWithSelector({
    selector: getFallbackSelector(label),
    value,
  });
}

async function scroll(domActions: DomActions, action: Action) {
  if (action.args.value === "up") {
    await domActions.scrollUp();
  } else {
    await domActions.scrollDown();
  }
}

export async function performActionWithSelector(
  domActions: DomActions,
  action: ActionWithSelector,
) {
  const selectorName = action.args.selector;
  if (action.name === "click") {
    const success = await clickWithSelector(domActions, selectorName);
    if (!success) {
      console.error("Unable to find element with selector: ", selectorName);
    }
  } else if (action.name === "setValue") {
    const success = await setValueWithSelector(
      domActions,
      selectorName,
      action.args.value || "",
    );
    if (!success) {
      console.error("Unable to find element with selector: ", selectorName);
    }
  } else if (action.name === "scroll") {
    scroll(domActions, action);
  } else {
    console.log("other actions");
  }
}

export async function performActionWithElementId(
  domActions: DomActions,
  action: ActionWithElementId,
) {
  const elementId = action.args.elementId;
  if (action.name === "click") {
    const success = await clickWithElementId(domActions, elementId);
    if (!success) {
      console.error("Unable to find element with elementId: ", elementId);
    }
  } else if (action.name === "setValue") {
    const success = await setValueWithElementId(
      domActions,
      elementId,
      action.args.value || "",
    );
    if (!success) {
      console.error("Unable to find element with elementId: ", elementId);
    }
  } else if (action.name === "scroll") {
    scroll(domActions, action);
  } else {
    console.log("other actions");
  }
}

export async function performActionWithLabel(
  domActions: DomActions,
  action: ActionWithLabel,
) {
  const label = action.args.label;
  if (action.name === "click") {
    const success = await clickWithLabel(domActions, label);
    if (!success) {
      console.error("Unable to find element with label: ", label);
    }
  } else if (action.name === "setValue") {
    const success = await setValueWithLabel(
      domActions,
      label,
      action.args.value || "",
    );
    if (!success) {
      console.error("Unable to find element with label: ", label);
    }
  } else if (action.name === "scroll") {
    scroll(domActions, action);
  } else {
    console.log("other actions");
  }
}

export default async function performAction(tabId: number, action: Action) {
  console.log("performAction", tabId, action);
  const domActions = new DomActions(tabId);
  if (isActionWithSelector(action)) {
    await performActionWithSelector(domActions, action);
  } else if (isActionWithElementId(action)) {
    await performActionWithElementId(domActions, action);
  } else if (isActionWithLabel(action)) {
    await performActionWithLabel(domActions, action);
  } else {
    console.error("Invalid action arguments", action);
  }
}
