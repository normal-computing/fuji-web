import OpenAI from "openai";
import { attachDebugger, detachAllDebuggers } from "../helpers/chromeDebugger";
import {
  disableIncompatibleExtensions,
  reenableExtensions,
} from "../helpers/disableExtensions";
import { determineNextAction } from "../helpers/dom-agent/determineNextAction";
import {
  determineNextActionWithVision,
  type QueryResult,
} from "../helpers/vision-agent/determineNextAction";
import { determineNavigateAction } from "../helpers/vision-agent/determineNavigateAction";
import {
  type Action,
  parseResponse,
} from "../helpers/vision-agent/parseResponse";
import { callRPCWithTab } from "../helpers/rpc/pageRPC";
import { getSimplifiedDom } from "../helpers/simplifyDom";
import { sleep, truthyFilter, waitFor } from "../helpers/utils";
import {
  operateTool,
  operateToolWithSimpliedDom,
} from "../helpers/rpc/performAction";
import { waitTillHTMLRendered } from "../helpers/rpc/utils";
import { findActiveTab } from "../helpers/browserUtils";
import { MyStateCreator } from "./store";
import buildAnnotatedScreenshots from "../helpers/buildAnnotatedScreenshots";
import { voiceControl } from "../helpers/voiceControl";
import { fetchKnowledge, type Knowledge } from "../helpers/knowledge";
import { hasVisionSupport } from "../helpers/aiSdkUtils";

export type TaskHistoryEntry = {
  prompt: string;
  response: string;
  action: Action;
  usage: OpenAI.CompletionUsage | undefined;
};

export type CurrentTaskSlice = {
  tabId: number;
  isListening: boolean;
  history: TaskHistoryEntry[];
  status: "idle" | "running" | "success" | "error" | "interrupted";
  knowledgeInUse: Knowledge | null;
  actionStatus:
    | "idle"
    | "attaching-debugger"
    | "pulling-dom"
    | "annotating-page"
    | "fetching-knoweldge"
    | "generating-action"
    | "performing-action"
    | "waiting";
  actions: {
    runTask: (onError: (error: string) => void) => Promise<void>;
    interrupt: () => void;
    attachDebugger: () => Promise<void>;
    detachDebugger: () => Promise<void>;
    showImagePrompt: () => Promise<void>;
    prepareLabels: () => Promise<void>;
    performActionString: (actionString: string) => Promise<void>;
    startListening: () => void;
    stopListening: () => void;
  };
};
export const createCurrentTaskSlice: MyStateCreator<CurrentTaskSlice> = (
  set,
  get,
) => ({
  tabId: -1,
  isListening: false,
  history: [],
  status: "idle",
  actionStatus: "idle",
  knowledgeInUse: null,
  actions: {
    runTask: async (onError) => {
      const voiceMode = get().settings.voiceMode;

      const wasStopped = () => get().currentTask.status !== "running";
      const setActionStatus = (status: CurrentTaskSlice["actionStatus"]) => {
        set((state) => {
          state.currentTask.actionStatus = status;
        });
      };

      const instructions = get().ui.instructions;
      if (voiceMode && instructions) {
        voiceControl.speak("The current task is to " + instructions, onError);
      }

      if (!instructions || get().currentTask.status === "running") return;

      set((state) => {
        state.currentTask.history = [];
        state.currentTask.status = "running";
        state.currentTask.actionStatus = "attaching-debugger";
      });

      try {
        await disableIncompatibleExtensions();

        // eslint-disable-next-line no-constant-condition
        while (true) {
          if (wasStopped()) break;

          // always get latest tab info, since actions such as button clicking might have changed it
          let activeTab = await findActiveTab();
          const tabId = activeTab?.id || -1;
          if (!activeTab || !tabId) {
            throw new Error("No active tab found");
          }
          if (activeTab.status === "loading") {
            // wait for tab to be loaded
            await waitFor(
              async () => {
                // findActiveTab give a new reference to activeTab every time
                activeTab = await findActiveTab();
                return activeTab?.status === "complete";
              },
              200, // check every 200ms
              100, // wait for up to 20 seconds (100*200ms)
              false, // assume page fully loaded on timeout
            );
          }

          const isVisionModel = hasVisionSupport(get().settings.selectedModel);

          const performAction = async (
            query: QueryResult,
          ): Promise<boolean> => {
            if (query == null) {
              set((state) => {
                state.currentTask.status = "error";
              });
              return false;
            }

            setActionStatus("performing-action");
            if (voiceMode) {
              if ("speak" in query.action && query.action.speak) {
                voiceControl.speak(query.action.speak, onError);
              } else if ("thought" in query.action && query.action.thought) {
                voiceControl.speak(query.action.thought, onError);
              }
            }

            set((state) => {
              query &&
                state.currentTask.history.push({
                  prompt: query.prompt,
                  response: query.rawResponse,
                  action: query.action,
                  usage: query.usage,
                });
            });
            if (
              query.action.operation === null ||
              query.action.operation.name === "finish" ||
              query.action.operation.name === "fail"
            ) {
              return false;
            }
            if (isVisionModel) {
              await operateTool(tabId, query.action.operation);
            } else {
              await operateToolWithSimpliedDom(tabId, query.action.operation);
            }
            return true;
          };

          let query: QueryResult | null = null;

          // check if the tab does not allow attaching debugger, e.g. chrome:// pages
          if (activeTab.url?.startsWith("chrome")) {
            setActionStatus("generating-action");
            query = await determineNavigateAction(instructions);

            if (wasStopped()) break;

            const shouldContinue = await performAction(query);
            if (shouldContinue) {
              // if navigation was successful, continue the task on the new page
              setActionStatus("waiting");
              continue;
            } else {
              break;
            }
          }
          await attachDebugger(tabId);
          await waitTillHTMLRendered(tabId);

          set((state) => {
            state.currentTask.tabId = tabId;
          });

          const previousActions = get()
            .currentTask.history.map((entry) => entry.action)
            .filter(truthyFilter);

          if (isVisionModel) {
            setActionStatus("fetching-knoweldge");
            const url = new URL(activeTab.url ?? "");
            const customKnowledgeBase = get().settings.customKnowledgeBase;
            const knowledge = await fetchKnowledge(url, customKnowledgeBase);
            set((state) => {
              state.currentTask.knowledgeInUse = knowledge;
            });

            setActionStatus("annotating-page");
            const [imgData, labelData] = await buildAnnotatedScreenshots(
              tabId,
              knowledge,
            );
            const viewportPercentage = await callRPCWithTab(
              tabId,
              "getViewportPercentage",
              [],
            );
            if (wasStopped()) break;
            setActionStatus("generating-action");
            query = await determineNextActionWithVision(
              instructions,
              url,
              knowledge,
              previousActions,
              imgData,
              labelData,
              viewportPercentage,
              3,
              onError,
            );
          } else {
            setActionStatus("pulling-dom");
            const pageDOM = await getSimplifiedDom();
            if (!pageDOM) {
              set((state) => {
                state.currentTask.status = "error";
              });
              break;
            }

            if (wasStopped()) break;
            setActionStatus("generating-action");
            query = await determineNextAction(
              instructions,
              previousActions,
              pageDOM.outerHTML,
              3,
              onError,
            );
          }

          if (wasStopped()) break;

          const shouldContinue = await performAction(query);

          if (wasStopped() || !shouldContinue) break;

          // While testing let's automatically stop after 50 actions to avoid
          // infinite loops
          if (get().currentTask.history.length >= 50) {
            break;
          }

          setActionStatus("waiting");
        } // end of while loop
        set((state) => {
          state.currentTask.status = "success";
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        console.error(e);
        onError(e.message);
        set((state) => {
          state.currentTask.status = "error";
        });
      } finally {
        await detachAllDebuggers();
        await reenableExtensions();
      }
    },
    interrupt: () => {
      set((state) => {
        state.currentTask.status = "interrupted";
      });
    },
    // for debugging
    attachDebugger: async () => {
      const activeTab = await findActiveTab();
      if (!activeTab?.id) throw new Error("No active tab found");
      const tabId = activeTab.id;
      set((state) => {
        state.currentTask.tabId = tabId;
      });
      await attachDebugger(tabId);
    },
    detachDebugger: async () => {
      await detachAllDebuggers();
    },
    showImagePrompt: async () => {
      const activeTab = await findActiveTab();
      const tabId = activeTab?.id || -1;
      if (!activeTab || !tabId) {
        throw new Error("No active tab found");
      }
      const customKnowledgeBase = get().settings.customKnowledgeBase;
      const knowledge = await fetchKnowledge(
        new URL(activeTab.url ?? ""),
        customKnowledgeBase,
      );
      const [imgData, labelData] = await buildAnnotatedScreenshots(
        tabId,
        knowledge,
      );
      console.log(labelData);
      openBase64InNewTab(imgData, "image/webp");
    },
    prepareLabels: async () => {
      const activeTab = await findActiveTab();
      const tabId = activeTab?.id || -1;
      if (!activeTab || !tabId) {
        throw new Error("No active tab found");
      }
      const customKnowledgeBase = get().settings.customKnowledgeBase;
      const knowledge = await fetchKnowledge(
        new URL(activeTab.url ?? ""),
        customKnowledgeBase,
      );
      await callRPCWithTab(tabId, "drawLabels", [knowledge]);
      await sleep(800);
      await callRPCWithTab(tabId, "removeLabels", []);
    },
    // currently only for debugging operation format used vision model
    performActionString: async (actionString: string) => {
      const parsedResponse = parseResponse(actionString);
      if (
        parsedResponse.operation.name === "finish" ||
        parsedResponse.operation.name === "fail"
      ) {
        return;
      }
      await operateTool(get().currentTask.tabId, parsedResponse.operation);
    },
    startListening: () =>
      set((state) => {
        state.currentTask.isListening = true;
        voiceControl.startListening();
      }),
    stopListening: () =>
      set((state) => {
        state.currentTask.isListening = false;
        voiceControl.stopListening();
      }),
  },
});

function openBase64InNewTab(base64Data: string, contentType: string) {
  // Remove the prefix (e.g., "data:image/png;base64,") from the base64 data
  const base64 = base64Data.split(";base64,").pop();
  if (!base64) {
    console.error("Invalid base64 data");
    return;
  }

  // Convert base64 to a Blob
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: contentType });

  // Create a URL for the Blob and open it in a new tab
  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, "_blank");
}
