import { merge } from "lodash";
import { create, StateCreator } from "zustand";
import { immer } from "zustand/middleware/immer";
import { createJSONStorage, devtools, persist , subscribeWithSelector } from "zustand/middleware";
import { createCurrentTaskSlice, CurrentTaskSlice } from "./currentTask";
import { createUiSlice, UiSlice } from "./ui";
import { createSettingsSlice, SettingsSlice } from "./settings";
import { findBestMatchingModel } from "../helpers/aiSdkUtils";

export type StoreType = {
  currentTask: CurrentTaskSlice;
  ui: UiSlice;
  settings: SettingsSlice;
};

export type MyStateCreator<T> = StateCreator<
  StoreType,
  [["zustand/immer", never], ["zustand/subscribeWithSelector", never]],
  [],
  T
>;

export const useAppState = create<StoreType>()(
  subscribeWithSelector(
    persist(
      immer(
        devtools((...a) => ({
          currentTask: createCurrentTaskSlice(...a),
          ui: createUiSlice(...a),
          settings: createSettingsSlice(...a),
        })),
      ),
      {
        name: "app-state",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          // Stuff we want to persist
          ui: {
            instructions: state.ui.instructions,
          },
          settings: {
            openAIKey: state.settings.openAIKey,
            anthropicKey: state.settings.anthropicKey,
            openAIBaseUrl: state.settings.openAIBaseUrl,
            anthropicBaseUrl: state.settings.anthropicBaseUrl,
            selectedModel: state.settings.selectedModel,
            voiceMode: state.settings.voiceMode,
            customKnowledgeBase: state.settings.customKnowledgeBase,
          },
        }),
        merge: (persistedState, currentState) => {
          const result = merge(currentState, persistedState);
          result.settings.selectedModel = findBestMatchingModel(
            result.settings.selectedModel,
            result.settings.openAIKey,
            result.settings.anthropicKey,
          );
          return result;
        },
      },
    ),
  ),
);

useAppState.subscribe(
  (state) => state.currentTask.status,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (status, previousStatus) => {
    chrome.runtime.sendMessage({
      action: "updateHistory",
      status,
      history: useAppState.getState().currentTask.history,
    });
  },
  { fireImmediately: true },
);

// @ts-expect-error used for debugging
window.getState = useAppState.getState;
