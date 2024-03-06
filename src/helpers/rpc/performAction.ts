import { DomActions } from "./domActions";
import {
  WEB_WAND_LABEL_ATTRIBUTE_NAME,
  VISIBLE_TEXT_ATTRIBUTE_NAME,
} from "../../constants";

function getLabel(selectorName: string): string {
  return `[${WEB_WAND_LABEL_ATTRIBUTE_NAME}="${selectorName}"]`;
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
  selectorName: string,
): Promise<boolean> {
  console.log("clickWithElementId", selectorName);
  return await domActions.clickWithElementId({
    elementId: parseInt(selectorName),
  });
}

async function clickWithLabel(
  domActions: DomActions,
  selectorName: string,
): Promise<boolean> {
  console.log("clickWithLabel", selectorName);
  let success = false;
  try {
    success = await domActions.clickWithSelector({
      selector: `#${selectorName}`,
    });
  } catch (e) {
    // `#${selectorName}` might not be valid
  }
  if (success) return true;
  success = await domActions.clickWithSelector({
    selector: getLabel(selectorName),
  });
  if (success) return true;
  return await domActions.clickWithSelector({
    selector: getFallbackSelector(selectorName),
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
  selectorName: string,
  value: string,
): Promise<boolean> {
  console.log("setValueWithElementId", selectorName);
  return await domActions.setValueWithElementId({
    elementId: parseInt(selectorName),
    value,
  });
}

async function setValueWithLabel(
  domActions: DomActions,
  selectorName: string,
  value: string,
): Promise<boolean> {
  console.log("setValueWithLabel", selectorName);
  let success = false;
  try {
    success = await domActions.setValueWithSelector({
      selector: `#${selectorName}`,
      value,
    });
  } catch (e) {
    // `#${selectorName}` might not be valid
  }
  if (success) return true;
  success = await domActions.setValueWithSelector({
    selector: getLabel(selectorName),
    value,
  });
  if (success) return true;
  return await domActions.setValueWithSelector({
    selector: getFallbackSelector(selectorName),
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
  const selectorName = action.args.elementId;
  if (action.name === "click") {
    const success = await clickWithElementId(domActions, selectorName);
    if (!success) {
      console.error("Unable to find element with selector: ", selectorName);
    }
  } else if (action.name === "setValue") {
    const success = await setValueWithElementId(
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

export async function performActionWithLabel(
  domActions: DomActions,
  action: ActionWithLabel,
) {
  const selectorName = action.args.label;
  if (action.name === "click") {
    const success = await clickWithLabel(domActions, selectorName);
    if (!success) {
      console.error("Unable to find element with selector: ", selectorName);
    }
  } else if (action.name === "setValue") {
    const success = await setValueWithLabel(
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

export default async function performAction(tabId: number, action: Action) {
  console.log("performAction", tabId, action);
  const domActions = new DomActions(tabId);
  if ("selector" in action.args) {
    await performActionWithSelector(domActions, action as ActionWithSelector);
  } else if ("elementId" in action.args) {
    await performActionWithElementId(domActions, action as ActionWithElementId);
  } else if ("label" in action.args) {
    await performActionWithLabel(domActions, action as ActionWithLabel);
  } else {
    console.error("Invalid action arguments", action);
  }
}
