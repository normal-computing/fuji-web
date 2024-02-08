import { DomActions } from './domActions';
import {
  WEB_WAND_LABEL_ATTRIBUTE_NAME,
  VISIBLE_TEXT_ATTRIBUTE_NAME,
} from '../constants';

function getSelector(selectorName: string): string {
  return `[${WEB_WAND_LABEL_ATTRIBUTE_NAME}="${selectorName}"]`;
}

function getFallbackSelector(selectorName: string): string {
  return `[${VISIBLE_TEXT_ATTRIBUTE_NAME}="${selectorName}"]`;
}

export type Action = {
  name: 'click' | 'setValue' | 'scroll' | 'finish';
  args: {
    text?: string;
    label?: string;
    value?: string;
  };
};

async function clickWithSelector(
  domActions: DomActions,
  selectorName: string
): Promise<boolean> {
  console.log('clickWithSelector', selectorName);
  // start with ID
  let success = await domActions.clickWithSelector({
    selector: `#${selectorName}`,
  });
  if (success) return true;
  success = await domActions.clickWithSelector({
    selector: getSelector(selectorName),
  });
  if (success) return true;
  return await domActions.clickWithSelector({
    selector: getFallbackSelector(selectorName),
  });
}

async function setValueWithSelector(
  domActions: DomActions,
  selectorName: string,
  value: string
): Promise<boolean> {
  console.log('setValueWithSelector', selectorName);
  // start with ID
  let success = await domActions.setValueWithSelector({
    selector: `#${selectorName}`,
    value,
  });
  if (success) return true;
  success = await domActions.setValueWithSelector({
    selector: getSelector(selectorName),
    value,
  });
  if (success) return true;
  return await domActions.setValueWithSelector({
    selector: getFallbackSelector(selectorName),
    value,
  });
}

export default async function performAction(tabId: number, action: Action) {
  console.log('performAction', tabId, action);
  const domActions = new DomActions(tabId);
  if (action.name === 'click') {
    let selectorName = '';
    let success = false;
    if (action.args.label) {
      selectorName = action.args.label;
      success = await clickWithSelector(domActions, selectorName);
    }
    if (!success && action.args.text) {
      selectorName = action.args.text;
      success = await clickWithSelector(domActions, selectorName);
    }
    if (!success) {
      console.error('Unable to find element with selector: ', selectorName);
    }
  } else if (action.name === 'setValue') {
    let selectorName = '';
    let success = false;
    if (action.args.label) {
      selectorName = action.args.label;
      success = await setValueWithSelector(
        domActions,
        selectorName,
        action.args.value || ''
      );
    }
    if (!success && action.args.text) {
      selectorName = action.args.text;
      success = await setValueWithSelector(
        domActions,
        selectorName,
        action.args.value || ''
      );
    }
    if (!success) {
      console.error('Unable to find element with selector: ', selectorName);
    }
  } else if (action.name === 'scroll') {
    if (action.args.value === 'up') {
      await domActions.scrollUp();
    } else {
      await domActions.scrollDown();
    }
  }
}
