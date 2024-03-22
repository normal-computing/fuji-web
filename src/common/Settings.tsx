import {
  Alert,
  AlertIcon,
  AlertDescription,
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
import React from "react";
import ModelDropdown from "./ModelDropdown";

interface SettingsProps {
  setInSettingsView: React.Dispatch<React.SetStateAction<boolean>>;
}

const Settings = ({ setInSettingsView }: SettingsProps) => {
  const state = useAppState((state) => ({
    selectedModel: state.settings.selectedModel,
    updateSettings: state.settings.actions.update,
    voiceMode: state.settings.voiceMode,
    openAIKey: state.settings.openAIKey,
  }));

  if (!state.openAIKey) return null;

  const isVisionModel = state.selectedModel === "gpt-4-vision-preview";

  const closeSetting = () => setInSettingsView(false);

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
          <Box w="50%">
            <ModelDropdown />
          </Box>
        </Flex>
        {!isVisionModel && (
          <Alert status="warning" borderRadius="lg">
            <AlertIcon />
            <AlertDescription fontSize="sm">
              Most of WebWand&rsquo;s capabilities are based on the GPT-4 Vision
              mode. Non-vision models are available for research purposes.
            </AlertDescription>
          </Alert>
        )}

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
