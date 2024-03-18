import { Select, Box } from "@chakra-ui/react";
import { useAppState } from "../state/store";

const ModelDropdown = () => {
  const { selectedModel, updateSettings } = useAppState((state) => ({
    selectedModel: state.settings.selectedModel,
    updateSettings: state.settings.actions.update,
  }));

  const { openAIKey } = useAppState((state) => ({
    openAIKey: state.settings.openAIKey,
  }));

  if (!openAIKey) return null;

  return (
    <Box w="50%">
      <Select
        id="model-select"
        value={selectedModel || ""}
        onChange={(e) => updateSettings({ selectedModel: e.target.value })}
      >
        <option value="gpt-3.5-turbo-16k">GPT-3.5 Turbo (16k)</option>
        <option value="gpt-4">GPT-4</option>
        <option value="gpt-4-vision-preview">GPT-4 Vision Preview</option>
      </Select>
    </Box>
  );
};

export default ModelDropdown;
