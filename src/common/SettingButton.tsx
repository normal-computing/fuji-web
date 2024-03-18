import React from "react";
import { SettingsIcon } from "@chakra-ui/icons";
import { IconButton } from "@chakra-ui/react";
import { useAppState } from "../state/store";

const SettingButton = () => {
  const updateSettings = useAppState((state) => state.settings.actions.update);

  const openSetting = () => {
    updateSettings({ inSetting: true });
  };

  return (
    <IconButton
      icon={<SettingsIcon />}
      onClick={openSetting}
      aria-label="open settings"
    />
  );
};

export default SettingButton;
