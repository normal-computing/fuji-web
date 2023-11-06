import { DomActions } from '../../helpers/domActions';
import { WEB_WAND_LABEL_ATTRIBUTE_NAME } from '../../constants';

function getSelector(selectorName: string): string {
  return `[${WEB_WAND_LABEL_ATTRIBUTE_NAME}="${selectorName}"]`;
}

export type Action = {
  type: 'click' | 'input' | 'scroll' | 'finish';
  text?: string;
  label?: string;
  value?: string;
};

export default async function performAction(tabId: number, action: Action) {
  const domActions = new DomActions(tabId);
  if (action.type === 'click') {
    let selectorName = '';
    let success = false;
    if (action.label) {
      selectorName = action.label;
      success = await domActions.clickWithSelector({
        selector: getSelector(selectorName),
      });
    }
    if (!success && action.text) {
      selectorName = action.text;
      success = await domActions.clickWithSelector({
        selector: getSelector(selectorName),
      });
    }
  }
}
