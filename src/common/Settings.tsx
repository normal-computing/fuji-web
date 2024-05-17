import React, { useState } from "react";
import {
  Alert,
  AlertIcon,
  AlertDescription,
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
  useToast,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@chakra-ui/react";
import { ArrowBackIcon, EditIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { useAppState } from "../state/store";
import ModelDropdown from "./ModelDropdown";
import { callRPC } from "../helpers/rpc/pageRPC";
import CustomKnowledgeBase from "./CustomKnowledgeBase";
import SetAPIKey from "./SetAPIKey";
import { hasVisionSupport } from "../helpers/aiSdkUtils";
import { debugMode } from "../constants";

type SettingsProps = {
  setInSettingsView: React.Dispatch<React.SetStateAction<boolean>>;
};

const Settings = ({ setInSettingsView }: SettingsProps) => {
  const [view, setView] = useState<"settings" | "knowledge" | "api">(
    "settings",
  );
  const state = useAppState((state) => ({
    selectedModel: state.settings.selectedModel,
    updateSettings: state.settings.actions.update,
    voiceMode: state.settings.voiceMode,
    openAIKey: state.settings.openAIKey,
    anthropicKey: state.settings.anthropicKey,
  }));
  const toast = useToast();

  if (!state.openAIKey && !state.anthropicKey) return null;

  const isVisionModel = hasVisionSupport(state.selectedModel);

  const closeSetting = () => setInSettingsView(false);
  const openCKB = () => setView("knowledge");
  const backToSettings = () => setView("settings");

  async function checkMicrophonePermission(): Promise<PermissionState> {
    if (!navigator.permissions) {
      return "prompt";
    }
    try {
      const permission = await navigator.permissions.query({
        name: "microphone" as PermissionName,
      });
      return permission.state;
    } catch (error) {
      console.error("Error checking microphone permission:", error);
      return "denied";
    }
  }

  const handleVoiceMode = async (isEnabled: boolean) => {
    if (isEnabled) {
      const permissionState = await checkMicrophonePermission();
      if (permissionState === "denied") {
        toast({
          title: "Error",
          description:
            "Microphone access was previously blocked. Please enable it in your browser settings.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      } else if (permissionState === "prompt") {
        callRPC("injectMicrophonePermissionIframe", []).catch(console.error);
      } else if (permissionState === "granted") {
        console.log("Microphone permission granted");
      }
    }
  };

  return (
    <>
      <HStack mb={4} alignItems="center">
        <IconButton
          variant="outline"
          icon={<ArrowBackIcon />}
          onClick={() =>
            view === "settings" ? closeSetting() : backToSettings()
          }
          aria-label="go back"
        />
        <Breadcrumb separator={<ChevronRightIcon color="gray.500" />}>
          <BreadcrumbItem>
            <BreadcrumbLink href="#" onClick={backToSettings}>
              Settings
            </BreadcrumbLink>
          </BreadcrumbItem>
          {view === "knowledge" && (
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink href="#">Instructions</BreadcrumbLink>
            </BreadcrumbItem>
          )}
          {view === "api" && (
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink href="#">API</BreadcrumbLink>
            </BreadcrumbItem>
          )}
        </Breadcrumb>
      </HStack>
      {view === "knowledge" && <CustomKnowledgeBase />}
      {view === "api" && (
        <SetAPIKey
          asInitializerView={false}
          initialAnthropicKey={state.anthropicKey}
          initialOpenAIKey={state.openAIKey}
          onClose={backToSettings}
        />
      )}
      {view === "settings" && (
        <FormControl
          as={VStack}
          divider={<StackDivider borderColor="gray.200" />}
          spacing={4}
          align="stretch"
        >
          <Flex alignItems="center">
            <Box>
              <FormLabel mb="0">API Settings</FormLabel>
              <FormHelperText>
                The API key is stored locally on your device
              </FormHelperText>
            </Box>
            <Spacer />
            <Button onClick={() => setView("api")} rightIcon={<EditIcon />}>
              Edit
            </Button>
          </Flex>

          {debugMode && (
            <Button
              onClick={() => {
                state.updateSettings({
                  openAIKey: "",
                  anthropicKey: "",
                });
              }}
              colorScheme="red"
            >
              Clear API Keys
            </Button>
          )}

          <Flex alignItems="center">
            <FormLabel mb="0">Select Model</FormLabel>
            <Spacer />
            <Box w="50%">
              <ModelDropdown />
            </Box>
          </Flex>
          {!isVisionModel && (
            <Alert status="warning" borderRadius="lg">
              <AlertIcon />
              <AlertDescription fontSize="sm">
                Most of Fuji&rsquo;s capabilities are based on the GPT-4 Vision
                mode. Non-vision models are available for research purposes.
              </AlertDescription>
            </Alert>
          )}

          <Flex alignItems="center">
            <FormLabel mb="0">Turn On Voice Mode</FormLabel>
            <Spacer />
            <Switch
              id="voiceModeSwitch"
              isChecked={state.voiceMode}
              onChange={(e) => {
                const isEnabled = e.target.checked;
                if (isEnabled && !state.openAIKey) {
                  toast({
                    title: "Error",
                    description: "Voice Mode requires an OpenAI API key.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                  });
                  return;
                }
                handleVoiceMode(isEnabled);
                state.updateSettings({ voiceMode: isEnabled });
              }}
            />
          </Flex>
          <Flex alignItems="center">
            <FormLabel mb="0">Custom Instructions</FormLabel>
            <Spacer />
            <Button rightIcon={<EditIcon />} onClick={openCKB}>
              Edit
            </Button>
          </Flex>
        </FormControl>
      )}
    </>
  );
};

export default Settings;
