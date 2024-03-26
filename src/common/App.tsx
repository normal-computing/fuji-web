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
import { FaDiscord } from "react-icons/fa6";
import React, { useState } from "react";
import { useAppState } from "../state/store";
import SetAPIKey from "./SetAPIKey";
import TaskUI from "./TaskUI";
import Settings from "./Settings";

const App = () => {
  const openAIKey = useAppState((state) => state.settings.openAIKey);
  const [inSettingsView, setInSettingsView] = useState(false);

  return (
    <ChakraProvider>
      <Box p="8" pb="16" fontSize="lg" w="full">
        <HStack mb={4} alignItems="center">
          <Heading as="h1" size="lg" flex={1}>
            WebWand 🪄
          </Heading>
          <IconButton
            icon={<SettingsIcon />}
            onClick={() => setInSettingsView(true)}
            aria-label="open settings"
          />
        </HStack>
        {openAIKey ? (
          inSettingsView ? (
            <Settings setInSettingsView={setInSettingsView} />
          ) : (
            <TaskUI />
          )
        ) : (
          <SetAPIKey />
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
        backdropBlur="8px"
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
          <Link href="https://discord.gg/yfMjZ8udb5" isExternal>
            Join Our Discord <Icon verticalAlign="text-bottom" as={FaDiscord} />
          </Link>
          <Link href="https://forms.gle/isLeGyUvoKGiqT8W8" isExternal>
            Leave Feedbacks
          </Link>
        </HStack>
      </Box>
    </ChakraProvider>
  );
};

export default App;
