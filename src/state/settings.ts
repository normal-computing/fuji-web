import { type Data } from "../helpers/knowledge/index";
import { MyStateCreator } from "./store";
import {
  SupportedModels,
  findBestMatchingModel,
  AgentMode,
} from "../helpers/aiSdkUtils";

export type SettingsSlice = {
  openAIKey: string | undefined;
  anthropicKey: string | undefined;
  openAIBaseUrl: string | undefined;
  anthropicBaseUrl: string | undefined;
  selectedModel: SupportedModels;
  agentMode: AgentMode;
  voiceMode: boolean;
  customKnowledgeBase: Data;
  actions: {
    update: (values: Partial<SettingsSlice>) => void;
  };
};
export const createSettingsSlice: MyStateCreator<SettingsSlice> = (set) => ({
  openAIKey: undefined,
  anthropicKey: undefined,
  openAIBaseUrl: undefined,
  anthropicBaseUrl: undefined,
  agentMode: AgentMode.VisionEnhanced,
  selectedModel: SupportedModels.Gpt4Turbo,
  voiceMode: false,
  customKnowledgeBase: {},
  actions: {
    update: (values) => {
      set((state) => {
        const newSettings: SettingsSlice = { ...state.settings, ...values };
        newSettings.selectedModel = findBestMatchingModel(
          newSettings.selectedModel,
          newSettings.agentMode,
          newSettings.openAIKey,
          newSettings.anthropicKey,
        );
        // voice model current relies on OpenAI API key
        if (!newSettings.openAIKey) {
          newSettings.voiceMode = false;
        }
        state.settings = newSettings;
      });
    },
  },
});
