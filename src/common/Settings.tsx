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
import {
  ArrowBackIcon,
  RepeatIcon,
  EditIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";
import { useAppState } from "../state/store";
import ModelDropdown from "./ModelDropdown";
import { callRPC } from "../helpers/rpc/pageRPC";
import CustomKnowledgeBase from "./CustomKnowledgeBase";

type SettingsProps = {
  setInSettingsView: React.Dispatch<React.SetStateAction<boolean>>;
};

const Settings = ({ setInSettingsView }: SettingsProps) => {
  const [showCKB, setShowCKB] = useState(false);
  const state = useAppState((state) => ({
    selectedModel: state.settings.selectedModel,
    updateSettings: state.settings.actions.update,
    voiceMode: state.settings.voiceMode,
    openAIKey: state.settings.openAIKey,
  }));
  const toast = useToast();

  if (!state.openAIKey) return null;

  const isVisionModel = state.selectedModel === "gpt-4-vision-preview";

  const closeSetting = () => setInSettingsView(false);
  const openCKB = () => setShowCKB(true);
  const backToSettings = () => setShowCKB(false);

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
          onClick={() => (showCKB ? backToSettings() : closeSetting())}
          aria-label="go back"
        />
        <Breadcrumb separator={<ChevronRightIcon color="gray.500" />}>
          <BreadcrumbItem>
            <BreadcrumbLink href="#" onClick={backToSettings}>
              Settings
            </BreadcrumbLink>
          </BreadcrumbItem>
          {showCKB && (
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink href="#">Knowledge</BreadcrumbLink>
            </BreadcrumbItem>
          )}
        </Breadcrumb>
      </HStack>
      {showCKB ? (
        <CustomKnowledgeBase />
      ) : (
        <FormControl
          as={VStack}
          divider={<StackDivider borderColor="gray.200" />}
          spacing={4}
          align="stretch"
        >
          <Flex alignItems="center">
            <Box>
              <FormLabel mb="0">OpenAI API Key</FormLabel>
              <FormHelperText>
                The API key is stored locally on your device
              </FormHelperText>
            </Box>
            <Spacer />
            <Button
              onClick={() => state.updateSettings({ openAIKey: "" })}
              rightIcon={<RepeatIcon />}
            >
              Reset
            </Button>
          </Flex>

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
                Most of WebWand&rsquo;s capabilities are based on the GPT-4
                Vision mode. Non-vision models are available for research
                purposes.
              </AlertDescription>
            </Alert>
          )}

          <Flex alignItems="center">
            <FormLabel mb="0">Turn On Voice Mode</FormLabel>
            <Spacer />
            <Switch
              isChecked={state.voiceMode}
              onChange={(e) => {
                const isEnabled = e.target.checked;
                handleVoiceMode(isEnabled);
                state.updateSettings({ voiceMode: isEnabled });
              }}
            />
          </Flex>
          <Flex alignItems="center">
            <FormLabel mb="0">Custom Knowledge Base</FormLabel>
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
