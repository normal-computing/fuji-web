import { Box, ChakraProvider, Heading, HStack } from "@chakra-ui/react";
import React from "react";
import { useAppState } from "../state/store";
import SetAPIKey from "./SetAPIKey";
import TaskUI from "./TaskUI";
import SettingButton from "./SettingButton";
import Settings from "./Settings";

const App = () => {
  const openAIKey = useAppState((state) => state.settings.openAIKey);
  const inSetting = useAppState((state) => state.settings.inSetting);

  return (
    <ChakraProvider>
      <Box p="8" fontSize="lg" w="full">
        <HStack mb={4} alignItems="center">
          <Heading as="h1" size="lg" flex={1}>
            WebWand 🪄
          </Heading>
          <SettingButton />
        </HStack>
        {openAIKey ? inSetting ? <Settings /> : <TaskUI /> : <SetAPIKey />}
      </Box>
    </ChakraProvider>
  );
};

export default App;
