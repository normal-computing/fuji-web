import { Select } from "@chakra-ui/react";
import { useAppState } from "../../state/store";
import {
  SupportedModels,
  DisplayName,
  isOpenAIModel,
  isAnthropicModel,
  AgentMode,
  hasVisionSupport,
} from "../../helpers/aiSdkUtils";
import { enumValues } from "../../helpers/utils";

const ModelDropdown = () => {
  const { selectedModel, agentMode, updateSettings } = useAppState((state) => ({
    selectedModel: state.settings.selectedModel,
    agentMode: state.settings.agentMode,
    updateSettings: state.settings.actions.update,
  }));

  const { openAIKey, anthropicKey } = useAppState((state) => ({
    openAIKey: state.settings.openAIKey,
    anthropicKey: state.settings.anthropicKey,
  }));

  const isModelSupported = (model: SupportedModels) => {
    if (agentMode === AgentMode.VisionEnhanced && !hasVisionSupport(model)) {
      return false;
    }
    if (isOpenAIModel(model)) {
      return !!openAIKey;
    }
    if (isAnthropicModel(model)) {
      return !!anthropicKey;
    }
    return false;
  };

  return (
    <Select
      id="model-select"
      value={selectedModel || ""}
      onChange={(e) =>
        updateSettings({ selectedModel: e.target.value as SupportedModels })
      }
    >
      {enumValues(SupportedModels).map((model) => (
        <option key={model} value={model} disabled={!isModelSupported(model)}>
          {DisplayName[model]}
        </option>
      ))}
    </Select>
  );
};

export default ModelDropdown;
