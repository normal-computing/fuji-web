import { Select } from "@chakra-ui/react";
import { useAppState } from "../../state/store";
import {
  SupportedModels,
  DisplayName,
  isValidModelSettings,
} from "../../helpers/aiSdkUtils";
import { enumValues } from "../../helpers/utils";

const ModelDropdown = () => {
  const { selectedModel, agentMode, updateSettings } = useAppState((state) => ({
    selectedModel: state.settings.selectedModel,
    agentMode: state.settings.agentMode,
    updateSettings: state.settings.actions.update,
  }));

  const { openAIKey, anthropicKey, geminiKey } = useAppState((state) => ({
    openAIKey: state.settings.openAIKey,
    anthropicKey: state.settings.anthropicKey,
    geminiKey: state.settings.geminiKey,
  }));

  return (
    <Select
      id="model-select"
      value={selectedModel || ""}
      onChange={(e) =>
        updateSettings({ selectedModel: e.target.value as SupportedModels })
      }
    >
      {enumValues(SupportedModels).map((model) => (
        <option
          key={model}
          value={model}
          disabled={
            !isValidModelSettings(
              model,
              agentMode,
              openAIKey,
              anthropicKey,
              geminiKey,
            )
          }
        >
          {DisplayName[model]}
        </option>
      ))}
    </Select>
  );
};

export default ModelDropdown;
