import {
  Link,
  Box,
  ChakraProvider,
  Heading,
  HStack,
  IconButton,
  Icon,
} from "@chakra-ui/react";
import { SettingsIcon } from "@chakra-ui/icons";
import { FaDiscord, FaGithub } from "react-icons/fa6";
import { useState } from "react";
import { useAppState } from "../state/store";
import SetAPIKey from "./settings/SetAPIKey";
import TaskUI from "./TaskUI";
import Settings from "./Settings";
import ApprovalDialog from "./ApprovalDialog";

const App = () => {
  const hasAPIKey = useAppState(
    (state) => state.settings.anthropicKey || state.settings.openAIKey,
  );
  const [inSettingsView, setInSettingsView] = useState(false);

  return (
    <ChakraProvider>
      <ApprovalDialog />
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
