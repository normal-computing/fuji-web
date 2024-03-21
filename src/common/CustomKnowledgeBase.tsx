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
import { type DomainRules, type Rule } from "../helpers/knowledge/type";
import { useAppState } from "../state/store";
import NewKnowledgeForm from "./NewKnowledgeForm";

type DomainKnowledgeProps = {
  domainRules: DomainRules;
  onRemove: () => void;
};

const DomainKnowledge = ({ domainRules, onRemove }: DomainKnowledgeProps) => {
  const getJson = (domainRules: Rule): string => {
    return JSON.stringify(domainRules, null, 2);
  };

  return (
    <>
      <Heading as="h4" size="md">
        {domainRules.domain}
      </Heading>
      <Accordion allowToggle>
        {domainRules.rules.map((rule, ruleIndex) => (
          <AccordionItem key={ruleIndex} backgroundColor="white">
            <Heading as="h4" size="xs">
              <AccordionButton>
                <Box>Rule {ruleIndex + 1}</Box>
                <AccordionIcon />
              </AccordionButton>
            </Heading>
            <AccordionPanel>
              <pre style={{ overflowX: "auto" }}>{getJson(rule)}</pre>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
      <Button colorScheme="red" onClick={onRemove} mt={4}>
        Remove
      </Button>
    </>
  );
};

const CustomKnowledgeBase = () => {
  const domainRules = useAppState((state) => state.settings.domainRules);
  const updateSettings = useAppState((state) => state.settings.actions.update);

  const removeDomainRule = (domainIndex: number) => {
    const updatedDomainRules = domainRules.filter(
      (_, index) => index !== domainIndex,
    );
    updateSettings({ domainRules: updatedDomainRules });
  };

  return (
    <VStack spacing={4}>
      {domainRules.length > 0 ? (
        domainRules.map((rules, index) => (
          <Box key={index} w="full" p={4} borderWidth="1px" borderRadius="lg">
            <DomainKnowledge
              domainRules={rules}
              onRemove={() => removeDomainRule(index)}
            />
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
