import { sleep } from "./utils";
import { callRPCWithTab } from "./rpc/pageRPC";
import mergeImages from "@src/shared/images/mergeScreenshots";
import { type LabelData } from "../pages/content/drawLabels";
import { type Knowledge } from "./knowledge";

export default async function buildAnnotatedScreenshots(
  tabId: number,
  knowledge: Knowledge,
): Promise<[string, LabelData[]]> {
  const imgDataRaw = await chrome.tabs.captureVisibleTab({
    format: "png",
  });
  const labelData = await callRPCWithTab(tabId, "drawLabels", [knowledge]);
  await sleep(300);
  const imgDataAnnotated = await chrome.tabs.captureVisibleTab({
    format: "png",
  });
  const imgData = await mergeImages([
    { src: imgDataRaw, caption: "Clean Screenshot" },
    { src: imgDataAnnotated, caption: "Annotated Screenshot" },
  ]);
  await sleep(300);
  await callRPCWithTab(tabId, "removeLabels", []);

  return [imgData, labelData];
}
