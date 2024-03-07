import { RepeatIcon, SettingsIcon, UnlockIcon } from "@chakra-ui/icons";
import {
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import React from "react";
import { useAppState } from "../state/store";
import { debugMode } from "../constants";
import { findActiveTab } from "../helpers/browserUtils";

const OptionsDropdown = () => {
  const { openAIKey, updateSettings } = useAppState((state) => ({
    openAIKey: state.settings.openAIKey,
    updateSettings: state.settings.actions.update,
  }));

  if (!openAIKey) return null;

  const injectFunctions = async () => {
    console.log("injecting functions");
    const tab = await findActiveTab();
    if (!tab) {
      console.log("no active tab found");
      return;
    }
    chrome.runtime.sendMessage({
      action: "injectFunctions",
      tabId: tab.id,
    });
  };

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label="Options"
        icon={<SettingsIcon />}
        variant="outline"
      />
      <MenuList>
        <MenuItem
          icon={<RepeatIcon />}
          onClick={() => {
            updateSettings({ openAIKey: "" });
          }}
        >
          Reset API Key
        </MenuItem>
        {debugMode && (
          <MenuItem icon={<UnlockIcon />} onClick={injectFunctions}>
            Inject Global Functions (debug only)
          </MenuItem>
        )}
      </MenuList>
    </Menu>
  );
};

export default OptionsDropdown;
