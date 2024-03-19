import {
  Box,
  ChakraProvider,
  Heading,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { SettingsIcon } from "@chakra-ui/icons";
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
      <Box p="8" fontSize="lg" w="full">
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
    </ChakraProvider>
  );
};

export default App;
