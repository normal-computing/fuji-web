// This file will be inject dynamically into the page as a content script running in the context of the page
// see Background/index.ts for how this is done

import { debugMode } from "@src/constants";
import { generateSimplifiedDom } from "@src/helpers/simplifyDom";
import getAnnotatedDOM from "../getAnnotatedDOM";
import { rpcMethods } from "../domOperations";

async function getSimplifiedDomFromPage() {
  const fullDom = getAnnotatedDOM();
  if (!fullDom || typeof fullDom !== "string") return null;

  const dom = new DOMParser().parseFromString(fullDom, "text/html");

  // Mount the DOM to the document in an iframe so we can use getComputedStyle

  const interactiveElements: HTMLElement[] = [];

  const simplifiedDom = generateSimplifiedDom(
    dom.documentElement,
    interactiveElements,
  ) as HTMLElement;

  if (!simplifiedDom) {
    return null;
  }
  return simplifiedDom.outerHTML;
}

if (debugMode) {
  console.log("debug mode enabled");
  // @ts-expect-error - this is for debugging only
  window.WW_RPC_METHODS = {
    getSimplifiedDomFromPage,
    ...rpcMethods,
  };
}
