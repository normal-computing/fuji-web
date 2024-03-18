import { MyStateCreator } from "./store";

export type SettingsSlice = {
  openAIKey: string | null;
  selectedModel: string;
  inSetting: boolean;
  voiceMode: boolean;
  actions: {
    update: (values: Partial<SettingsSlice>) => void;
  };
};
export const createSettingsSlice: MyStateCreator<SettingsSlice> = (set) => ({
  openAIKey: null,
  selectedModel: "gpt-4-vision-preview",
  inSetting: false,
  voiceMode: false,
  actions: {
    update: (values) => {
      set((state) => {
        state.settings = { ...state.settings, ...values };
      });
    },
  },
});
