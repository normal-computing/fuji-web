// This file will be inject dynamically into the page as a content script running in the context of the page
// see Background/index.ts for how this is done

import { debugMode } from '../../constants';
import getAnnotatedDOM, { getUniqueElementSelectorId } from './getAnnotatedDOM';
import { copyToClipboard } from './copyToClipboard';
import attachFile from './attachFile';
import { drawLabels, removeLabels } from './drawLabels';
import ripple from './ripple';

if (debugMode) {
  console.log('debug mode enabled');
  // @ts-expect-error - this is for debugging only
  window.WW_RPC_METHODS = {
    getAnnotatedDOM,
    getUniqueElementSelectorId,
    ripple,
    copyToClipboard,
    attachFile,
    drawLabels,
    removeLabels,
  };
}
