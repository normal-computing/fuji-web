import OpenAI from "openai";
import { attachDebugger, detachAllDebuggers } from "../helpers/chromeDebugger";
import {
  disableIncompatibleExtensions,
  reenableExtensions,
} from "../helpers/disableExtensions";
import {
  ParsedResponse,
  ParsedResponseSuccess,
  parseResponse,
} from "../helpers/parseResponse";
import {
  determineNextAction,
  determineNextActionWithVision,
  type NextAction,
} from "../helpers/determineNextAction";
import { callRPCWithTab } from "../helpers/rpc/pageRPC";
import { getSimplifiedDom } from "../helpers/simplifyDom";
import { sleep, truthyFilter } from "../helpers/utils";
import performAction, { Action } from "../helpers/rpc/performAction";
import { findActiveTab } from "../helpers/browserUtils";
import { MyStateCreator, useAppState } from "./store";
import buildAnnotatedScreenshots from "../helpers/buildAnnotatedScreenshots";
import { voiceControl } from "../helpers/voiceControl";
import { fetchKnowledge } from "../helpers/knowledge";

export type TaskHistoryEntry = {
  prompt: string;
  response: string;
  action: ParsedResponse;
  usage: OpenAI.CompletionUsage | undefined;
};

export type CurrentTaskSlice = {
  tabId: number;
  instructions: string | null;
  history: TaskHistoryEntry[];
  status: "idle" | "running" | "success" | "error" | "interrupted";
  actionStatus:
    | "idle"
    | "attaching-debugger"
    | "pulling-dom"
    | "transforming-dom"
    | "performing-query"
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
  };
};
export const createCurrentTaskSlice: MyStateCreator<CurrentTaskSlice> = (
  set,
  get,
) => ({
  tabId: -1,
  instructions: null,
  history: [],
  status: "idle",
  actionStatus: "idle",
  actions: {
    runTask: async (onError) => {
      const wasStopped = () => get().currentTask.status !== "running";
      const setActionStatus = (status: CurrentTaskSlice["actionStatus"]) => {
        set((state) => {
          state.currentTask.actionStatus = status;
        });
      };

      const instructions = get().ui.instructions;
      if (instructions) {
        voiceControl.speak("The current task is to " + instructions);
      }

      if (!instructions || get().currentTask.status === "running") return;

      set((state) => {
        state.currentTask.instructions = instructions;
        state.currentTask.history = [];
        state.currentTask.status = "running";
        state.currentTask.actionStatus = "attaching-debugger";
      });

      try {
        await disableIncompatibleExtensions();

        // eslint-disable-next-line no-constant-condition
        while (true) {
          // get latest tab info, since button clicking might have changed it
          const activeTab = await findActiveTab();
          const tabId = activeTab?.id || -1;
          if (!activeTab || !tabId) {
            throw new Error("No active tab found");
          }
          await attachDebugger(tabId);
          set((state) => {
            state.currentTask.tabId = tabId;
          });
          if (wasStopped()) break;

          const previousActions = get()
            .currentTask.history.map((entry) => entry.action)
            .filter(truthyFilter);

          setActionStatus("performing-query");

          let query: NextAction | null = null;

          const isVisionModel =
            useAppState.getState().settings.selectedModel ===
            "gpt-4-vision-preview";
          const viewportPercentage = await callRPCWithTab(
            tabId,
            "getViewportPercentage",
            [],
          );

          if (isVisionModel) {
            const knowledge = await fetchKnowledge(
              new URL(activeTab.url ?? ""),
            );
            const [imgData, labelData] = await buildAnnotatedScreenshots(
              tabId,
              knowledge,
            );
            if (wasStopped()) break;
            query = await determineNextActionWithVision(
              instructions,
              knowledge,
              previousActions.filter(
                (pa) => !("error" in pa),
              ) as ParsedResponseSuccess[],
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
            query = await determineNextAction(
              instructions,
              previousActions.filter(
                (pa) => !("error" in pa),
              ) as ParsedResponseSuccess[],
              pageDOM.outerHTML,
              3,
              onError,
            );
          }

          if (query == null) {
            set((state) => {
              state.currentTask.status = "error";
            });
            break;
          }

          if (wasStopped()) break;

          setActionStatus("performing-action");
          const action = parseResponse(query.response, isVisionModel);
          if ("thought" in action) {
            voiceControl.speak(action.thought);
          }

          set((state) => {
            query &&
              state.currentTask.history.push({
                prompt: query.prompt,
                response: query.response,
                action,
                usage: query.usage,
              });
          });
          if ("error" in action) {
            onError(action.error);
            break;
          }
          if (
            action === null ||
            action.parsedAction.name === "finish" ||
            action.parsedAction.name === "fail"
          ) {
            break;
          }
          await performAction(tabId, action.parsedAction as Action);

          if (wasStopped()) break;

          // While testing let's automatically stop after 50 actions to avoid
          // infinite loops
          if (get().currentTask.history.length >= 50) {
            break;
          }

          setActionStatus("waiting");
          // sleep 2 seconds. This is pretty arbitrary; we should figure out a better way to determine when the page has settled.
          await sleep(2000);
        }
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
      const knowledge = await fetchKnowledge(new URL(activeTab.url ?? ""));
      const [imgData, labelData] = await buildAnnotatedScreenshots(
        tabId,
        knowledge,
      );
      console.log(labelData);
      openBase64InNewTab(imgData, "image/png");
    },
    prepareLabels: async () => {
      const activeTab = await findActiveTab();
      const tabId = activeTab?.id || -1;
      if (!activeTab || !tabId) {
        throw new Error("No active tab found");
      }
      const knowledge = await fetchKnowledge(new URL(activeTab.url ?? ""));
      await callRPCWithTab(tabId, "drawLabels", [knowledge]);
      await sleep(800);
      await callRPCWithTab(tabId, "removeLabels", []);
    },
    performActionString: async (actionString: string) => {
      const action = parseResponse(
        actionString,
        useAppState.getState().settings.selectedModel ===
          "gpt-4-vision-preview",
      );
      if ("error" in action) {
        throw action.error;
      }
      if (
        action === null ||
        action.parsedAction.name === "finish" ||
        action.parsedAction.name === "fail"
      ) {
        return;
      }
      await performAction(
        get().currentTask.tabId,
        action.parsedAction as Action,
      );
    },
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
