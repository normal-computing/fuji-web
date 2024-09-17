import { Select } from "@chakra-ui/react";
import { useAppState } from "../../state/store";
import { AgentMode } from "../../helpers/aiSdkUtils";
import { enumValues } from "../../helpers/utils";

const DisplayName = {
  //   [AgentMode.Vision]: "Pure Vision",
  [AgentMode.VisionEnhanced]: "Vision Enhanced",
  [AgentMode.Text]: "Text",
};

const AgentModeDrop = () => {
  const { agentMode, updateSettings } = useAppState((state) => ({
    agentMode: state.settings.agentMode,
    updateSettings: state.settings.actions.update,
  }));

  return (
    <Select
      id="agent-mode-select"
      value={agentMode || ""}
      onChange={(e) =>
        updateSettings({ agentMode: e.target.value as AgentMode })
      }
    >
      {enumValues(AgentMode).map((mode) => (
        <option key={mode} value={mode}>
          {DisplayName[mode]}
        </option>
      ))}
    </Select>
  );
};

export default AgentModeDrop;
