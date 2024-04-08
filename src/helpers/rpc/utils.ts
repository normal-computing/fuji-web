import { DomActions } from "./domActions";

export async function waitTillHTMLRendered(
  tabId: number,
  interval = undefined,
  timeout = undefined,
) {
  const domActions = new DomActions(tabId);
  return await domActions.waitTillHTMLRendered(interval, timeout);
}
