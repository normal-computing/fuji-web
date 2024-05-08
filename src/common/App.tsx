import {
  Link,
  Box,
  ChakraProvider,
  Heading,
  HStack,
  IconButton,
  Icon,
  useToast,
} from "@chakra-ui/react";
import { SettingsIcon } from "@chakra-ui/icons";
import { FaDiscord, FaGithub } from "react-icons/fa6";
import { useState, useEffect, useCallback } from "react";
import { useAppState } from "../state/store";
import SetAPIKey from "./SetAPIKey";
import TaskUI from "./TaskUI";
import Settings from "./Settings";

const App = () => {
  const hasAPIKey = useAppState(
    (state) => state.settings.anthropicKey || state.settings.openAIKey,
  );
  const { updateSettings } = useAppState((state) => ({
    updateSettings: state.settings.actions.update,
  }));
  const taskState = useAppState((state) => ({
    taskHistory: state.currentTask.history,
    taskStatus: state.currentTask.status,
    runTask: state.currentTask.actions.runTask,
    instructions: state.ui.instructions,
    setInstructions: state.ui.actions.setInstructions,
  }));
  const [inSettingsView, setInSettingsView] = useState(false);

  const toast = useToast();
  const toastError = useCallback(
    (message: string) => {
      toast({
        title: "Error",
        description: message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
    [toast],
  );

  useEffect(() => {
    console.log("triggered");
    const handleMessage = (message: { type: string; value: string }) => {
      switch (message.type) {
        case "API_KEY":
          updateSettings({ openAIKey: message.value });
          break;
        case "SET_TASK":
          taskState.setInstructions(message.value);
          break;
        case "RUN_TASK":
          console.log("Run task command received");
          taskState.runTask(toastError);
          break;
        case "TASK_STATUS":
          chrome.runtime.sendMessage({
            type: "TASK_STATUS",
            value: taskState.taskStatus,
          });
          break;
        default:
          console.log("Unhandled message type:", message.type);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  return (
    <ChakraProvider>
      <Box p="8" pb="24" fontSize="lg" w="full">
        <HStack mb={4} alignItems="center">
          <Heading as="h1" size="lg" flex={1}>
            Fuji 🗻
          </Heading>
          {hasAPIKey && (
            <IconButton
              icon={<SettingsIcon />}
              onClick={() => setInSettingsView(true)}
              aria-label="open settings"
            />
          )}
        </HStack>
        {hasAPIKey ? (
          inSettingsView ? (
            <Settings setInSettingsView={setInSettingsView} />
          ) : (
            <TaskUI />
          )
        ) : (
          <SetAPIKey asInitializerView />
        )}
      </Box>
      <Box
        px="8"
        pos="fixed"
        w="100%"
        bottom={0}
        zIndex={2}
        as="footer"
        backdropFilter="auto"
        backdropBlur="6px"
        backgroundColor="rgba(255, 255, 255, 0.6)"
      >
        <HStack
          columnGap="1.5rem"
          rowGap="0.5rem"
          fontSize="md"
          borderTop="1px dashed gray"
          py="3"
          justify="center"
          shouldWrapChildren
          wrap="wrap"
        >
          <Link
            href="https://github.com/normal-computing/fuji-web#readme"
            isExternal
          >
            About this project
          </Link>
          <Link href="https://forms.gle/isLeGyUvoKGiqT8W8" isExternal>
            Leave Feedback
          </Link>
          <Link href="https://github.com/normal-computing/fuji-web" isExternal>
            GitHub <Icon verticalAlign="text-bottom" as={FaGithub} />
          </Link>
          <Link href="https://discord.gg/yfMjZ8udb5" isExternal>
            Join Our Discord <Icon verticalAlign="text-bottom" as={FaDiscord} />
          </Link>
        </HStack>
      </Box>
    </ChakraProvider>
  );
};

export default App;
