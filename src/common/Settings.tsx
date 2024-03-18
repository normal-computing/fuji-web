import {
  Heading,
  IconButton,
  HStack,
  FormControl,
  FormLabel,
  FormHelperText,
  Switch,
  Button,
  VStack,
  Box,
  StackDivider,
  Flex,
  Spacer,
} from "@chakra-ui/react";
import { ArrowBackIcon, RepeatIcon } from "@chakra-ui/icons";
import { useAppState } from "../state/store";
import ModelDropdown from "./ModelDropdown";

const Settings = () => {
  const state = useAppState((state) => ({
    updateSettings: state.settings.actions.update,
    voiceMode: state.settings.voiceMode,
    openAIKey: state.settings.openAIKey,
  }));

  if (!state.openAIKey) return null;

  const closeSetting = () => {
    state.updateSettings({ inSetting: false });
  };

  return (
    <>
      <HStack mb={4} alignItems="center">
        <IconButton
          variant="outline"
          icon={<ArrowBackIcon />}
          onClick={closeSetting}
          aria-label="close settings"
        />
        <Heading as="h3" size="lg">
          Settings
        </Heading>
      </HStack>
      <FormControl
        as={VStack}
        divider={<StackDivider borderColor="gray.200" />}
        spacing={4}
        align="stretch"
      >
        <Flex alignItems="center">
          <Box>
            <FormLabel htmlFor="reset-key" mb="0">
              OpenAI API Key
            </FormLabel>
            <FormHelperText>
              The API key is stored locally on your device
            </FormHelperText>
          </Box>
          <Spacer />
          <Button
            id="reset-key"
            onClick={() => state.updateSettings({ openAIKey: "" })}
            rightIcon={<RepeatIcon />}
          >
            Reset
          </Button>
        </Flex>

        <Flex alignItems="center">
          <FormLabel htmlFor="model-select" mb="0">
            Select Model
          </FormLabel>
          <Spacer />
          <ModelDropdown />
        </Flex>

        <Flex alignItems="center">
          <FormLabel htmlFor="voice-mode" mb="0">
            Turn On Voice Mode
          </FormLabel>
          <Spacer />
          <Switch
            id="voice-mode"
            isChecked={state.voiceMode}
            onChange={(e) =>
              state.updateSettings({ voiceMode: e.target.checked })
            }
          />
        </Flex>
      </FormControl>
    </>
  );
};

export default Settings;
