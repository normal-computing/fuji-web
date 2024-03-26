import { type Data } from "../helpers/knowledge/index";
import { MyStateCreator } from "./store";

export type SettingsSlice = {
  openAIKey: string | null;
  selectedModel: string;
  voiceMode: boolean;
  customKnowledgeBase: Data;
  actions: {
    update: (values: Partial<SettingsSlice>) => void;
  };
};
export const createSettingsSlice: MyStateCreator<SettingsSlice> = (set) => ({
  openAIKey: null,
  selectedModel: "gpt-4-vision-preview",
  voiceMode: false,
  customKnowledgeBase: {},
  actions: {
    update: (values) => {
      set((state) => {
        state.settings = { ...state.settings, ...values };
      });
    },
  },
});
