import { Box, ChakraProvider, Heading, HStack } from '@chakra-ui/react';
import React from 'react';
import { useAppState } from '../state/store';
import ModelDropdown from './ModelDropdown';
import SetAPIKey from './SetAPIKey';
import TaskUI from './TaskUI';
import OptionsDropdown from './OptionsDropdown';
import logo from '../assets/img/icon-128.png';

const App = () => {
  const openAIKey = useAppState((state) => state.settings.openAIKey);

  return (
    <ChakraProvider>
      <Box p="8" fontSize="lg" w="full">
        <HStack mb={4} alignItems="center">
          <Heading as="h1" size="lg" flex={1}>
            WebWand 🪄
          </Heading>
          <HStack spacing={2}>
            <ModelDropdown />
            <OptionsDropdown />
          </HStack>
        </HStack>
        {openAIKey ? <TaskUI /> : <SetAPIKey />}
      </Box>
    </ChakraProvider>
  );
};

export default App;
