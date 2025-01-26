import { type Data, type HITLRule } from "../helpers/knowledge/index";
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
  geminiKey: string | undefined;
  selectedModel: SupportedModels;
  agentMode: AgentMode;
  voiceMode: boolean;
  customKnowledgeBase: Data;
  hitlRules: HITLRule[];
  actions: {
    update: (values: Partial<SettingsSlice>) => void;
  };
};
export const createSettingsSlice: MyStateCreator<SettingsSlice> = (set) => ({
  openAIKey: undefined,
  anthropicKey: undefined,
  openAIBaseUrl: undefined,
  anthropicBaseUrl: undefined,
  geminiKey: undefined,
  agentMode: AgentMode.VisionEnhanced,
  selectedModel: SupportedModels.Gpt4Turbo,
  voiceMode: false,
  customKnowledgeBase: {},
  hitlRules: [],
  actions: {
    update: (values) => {
      set((state) => {
        const newSettings: SettingsSlice = { ...state.settings, ...values };
        newSettings.selectedModel = findBestMatchingModel(
          newSettings.selectedModel,
          newSettings.agentMode,
          newSettings.openAIKey,
          newSettings.anthropicKey,
          newSettings.geminiKey,
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
