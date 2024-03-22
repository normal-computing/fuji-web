import React from "react";
import {
  Button,
  Text,
  VStack,
  Heading,
  Box,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import { useAppState } from "../state/store";
import NewKnowledgeForm from "./NewKnowledgeForm";

type HostKnowledgeProps = {
  host: string;
};

const HostKnowledge = ({ host }: HostKnowledgeProps) => {
  const hostData = useAppState((state) => state.settings.hostData);
  const updateSettings = useAppState((state) => state.settings.actions.update);

  const getJson = (): string => {
    return JSON.stringify(hostData[host], null, 2);
  };

  const handleRemove = () => {
    const newHostData = { ...hostData };
    delete newHostData[host];
    updateSettings({ hostData: newHostData });
  };

  return (
    <>
      <Heading as="h4" size="md">
        {host}
      </Heading>
      <Accordion allowToggle>
        {hostData[host].rules?.map((rule, ruleIndex) => (
          <AccordionItem key={ruleIndex} backgroundColor="white">
            <Heading as="h4" size="xs">
              <AccordionButton>
                <Box>Rule {ruleIndex + 1}</Box>
                <AccordionIcon />
              </AccordionButton>
            </Heading>
            <AccordionPanel>
              <pre style={{ overflowX: "auto" }}>{getJson()}</pre>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
      <Button colorScheme="red" onClick={handleRemove}>
        Remove
      </Button>
    </>
  );
};

const CustomKnowledgeBase = () => {
  const hostData = useAppState((state) => state.settings.hostData);

  return (
    <VStack spacing={4}>
      {Object.keys(hostData).length > 0 ? (
        Object.keys(hostData).map((host) => (
          <Box key={host} w="full" p={4} borderWidth="1px" borderRadius="lg">
            <HostKnowledge host={host} />
          </Box>
        ))
      ) : (
        <Text>No knowledge found. Please add your first knowledge.</Text>
      )}
      <NewKnowledgeForm />
    </VStack>
  );
};

export default CustomKnowledgeBase;
