import OpenAI from "openai";
import { attachDebugger, detachDebugger } from "../helpers/chromeDebugger";
import {
  disableIncompatibleExtensions,
  reenableExtensions,
} from "../helpers/disableExtensions";
// import { DomActions } from '../helpers/rpc/domActions';
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
import performAction from "../helpers/rpc/performAction";
import { MyStateCreator, useAppState } from "./store";

async function findActiveTab() {
  const inspectedTabId = chrome?.devtools?.inspectedWindow?.tabId;
  if (inspectedTabId) {
    return await chrome.tabs.get(inspectedTabId);
  }
  const currentWindow = await chrome.windows.getCurrent();
  if (!currentWindow || !currentWindow.id) {
    throw new Error("Could not find window");
  }
  const tabs = await chrome.tabs.query({
    active: true,
    windowId: currentWindow.id,
  });
  const tab = tabs[0];
  if (tab && tab.id != null) {
    return tab;
  }
  return null;
}

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

      if (!instructions || get().currentTask.status === "running") return;

      set((state) => {
        state.currentTask.instructions = instructions;
        state.currentTask.history = [];
        state.currentTask.status = "running";
        state.currentTask.actionStatus = "attaching-debugger";
      });

      try {
        const activeTab = await findActiveTab();

        if (!activeTab?.id) throw new Error("No active tab found");
        const tabId = activeTab.id;
        set((state) => {
          state.currentTask.tabId = tabId;
        });

        await attachDebugger(tabId);
        await disableIncompatibleExtensions();
        // const domActions = new DomActions(tabId);

        // eslint-disable-next-line no-constant-condition
        while (true) {
          if (wasStopped()) break;

          const previousActions = get()
            .currentTask.history.map((entry) => entry.action)
            .filter(truthyFilter);

          setActionStatus("performing-query");

          let query: NextAction | null = null;

          if (
            useAppState.getState().settings.selectedModel ===
            "gpt-4-vision-preview"
          ) {
            await callRPCWithTab(tabId, "drawLabels", []);
            const imgData = await chrome.tabs.captureVisibleTab({
              format: "jpeg",
              quality: 85,
            });
            if (wasStopped()) break;
            await callRPCWithTab(tabId, "removeLabels", []);
            query = await determineNextActionWithVision(
              instructions,
              previousActions.filter(
                (pa) => !("error" in pa),
              ) as ParsedResponseSuccess[],
              imgData,
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
          const action = parseResponse(query.response);

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
          await performAction(tabId, action.parsedAction);

          // if (action.parsedAction.name === 'click') {
          //   await domActions.clickWithElementId(action.parsedAction.args);
          // } else if (action.parsedAction.name === 'setValue') {
          //   await domActions.setValueWithElementId(action.parsedAction.args);
          // }

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
        onError(e.message);
        set((state) => {
          state.currentTask.status = "error";
        });
      } finally {
        await detachDebugger(get().currentTask.tabId);
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
      await detachDebugger(get().currentTask.tabId);
    },
    prepareLabels: async () => {
      const tabId = get().currentTask.tabId;
      await callRPCWithTab(tabId, "drawLabels", []);
      await sleep(800);
      await callRPCWithTab(tabId, "removeLabels", []);
    },
    performActionString: async (actionString: string) => {
      const action = parseResponse(actionString);
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
      await performAction(get().currentTask.tabId, action.parsedAction);
    },
  },
});
