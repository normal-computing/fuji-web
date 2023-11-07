import { DomActions } from './domActions';
import { WEB_WAND_LABEL_ATTRIBUTE_NAME } from '../constants';

function getSelector(selectorName: string): string {
  return `[${WEB_WAND_LABEL_ATTRIBUTE_NAME}="${selectorName}"]`;
}

export type Action = {
  name: 'click' | 'setValue' | 'scroll' | 'finish';
  args: {
    text?: string;
    label?: string;
    value?: string;
  };
};

export default async function performAction(tabId: number, action: Action) {
  console.log('performAction', tabId, action);
  const domActions = new DomActions(tabId);
  if (action.name === 'click') {
    let selectorName = '';
    let success = false;
    if (action.args.label) {
      selectorName = action.args.label;
      success = await domActions.clickWithSelector({
        selector: getSelector(selectorName),
      });
    }
    if (!success && action.args.text) {
      selectorName = action.args.text;
      success = await domActions.clickWithSelector({
        selector: getSelector(selectorName),
      });
    }
  } else if (action.name === 'setValue') {
    let selectorName = '';
    let success = false;
    if (action.args.label) {
      selectorName = action.args.label;
      success = await domActions.setValueWithSelector({
        selector: getSelector(selectorName),
        value: action.args.value || '',
      });
    }
    if (!success && action.args.text) {
      selectorName = action.args.text;
      success = await domActions.setValueWithSelector({
        selector: getSelector(selectorName),
        value: action.args.value || '',
      });
    }
  } else if (action.name === 'scroll') {
    if (action.args.value === 'up') {
      await domActions.scrollUp();
    } else {
      await domActions.scrollDown();
    }
  }
}
