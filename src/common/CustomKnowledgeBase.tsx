// CustomKnowledgeBase.tsx
import React, { useState } from "react";
import {
  Switch,
  Button,
  Text,
  VStack,
  Input,
  FormControl,
  Textarea,
  FormLabel,
  useToast,
  useDisclosure,

  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Flex,
  Heading,
  Box,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Badge} from "@chakra-ui/react";
import { type DomainRules, type Rule } from "../helpers/knowledge/type";
import { useAppState } from "../state/store";

type DomainKnowledgeProps = {
  domainRules: DomainRules;
};

const DomainKnowledge = ({ domainRules }: DomainKnowledgeProps) => {
  console.log(domainRules.rules.length);
  return (
    <>
      <Heading as="h4" size="md">
        {domainRules.domain}
      </Heading>
      <Accordion allowToggle>
        {domainRules.rules.map((rule, ruleIndex) => (
          <AccordionItem key={ruleIndex}>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  Rule {ruleIndex + 1}
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Text mb={2}>Regexes:</Text>
              {rule.regexes.map((regex, regexIndex) => (
                <Badge key={regexIndex} mr={2}>
                  {regex}
                </Badge>
              ))}
              <Box mt={4}>
                <Text fontWeight="bold">Knowledge:</Text>
                {rule.knowledge.notes.map((note, noteIndex) => (
                  <Text key={noteIndex} ml={4}>
                    - {note}
                  </Text>
                ))}
                {rule.knowledge.annotationRules && (
                  <Box mt={2}>
                    <Text fontWeight="bold">Annotation Rules:</Text>
                    {rule.knowledge.annotationRules.map(
                      (annotationRule, annotationIndex) => (
                        <Box key={annotationIndex} ml={4} mt={1}>
                          <Text>Selector: {annotationRule.selector}</Text>
                          {annotationRule.useAttributeAsName && (
                            <Text>
                              Use Attribute As Name:{" "}
                              {annotationRule.useAttributeAsName}
                            </Text>
                          )}
                          <Text>
                            Allow Invisible:{" "}
                            {annotationRule.allowInvisible ? "Yes" : "No"}
                          </Text>
                          <Text>
                            Allow Covered:{" "}
                            {annotationRule.allowCovered ? "Yes" : "No"}
                          </Text>
                          <Text>
                            Allow Aria Hidden:{" "}
                            {annotationRule.allowAriaHidden ? "Yes" : "No"}
                          </Text>
                        </Box>
                      ),
                    )}
                  </Box>
                )}
              </Box>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  );
};

const NewKnowledgeForm = () => {
  const [newDomain, setNewDomain] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newRegexes, setNewRegexes] = useState("");
  const [newSelector, setNewSelector] = useState("");
  const [newAttribute, setNewAttribute] = useState("");
  const [allowInvisible, setAllowInvisible] = useState(false);
  const [allowCovered, setAllowCovered] = useState(false);
  const [allowAriaHidden, setAllowAriaHidden] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const updateSettings = useAppState((state) => state.settings.actions.update);
  const toast = useToast();
  const domainRules = useAppState((state) => state.settings.domainRules);

  const addDomainRules = () => {
    if (!newDomain) {
      toast({
        title: "Domain is required",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    const newRule: Rule = {
      regexes: [newRegexes],
      knowledge: {
        notes: [newNote],
        annotationRules: [
          {
            selector: newSelector,
            useAttributeAsName: newAttribute,
            allowInvisible,
            allowCovered,
            allowAriaHidden,
          },
        ],
      },
    };
    const newDomainRules: DomainRules = {
      domain: newDomain,
      rules: [newRule],
    };
    updateSettings({ domainRules: [...domainRules, newDomainRules] });
    setNewDomain(""); // Reset new domain input
    setNewNote("");
    setNewRegexes("");
    setNewSelector("");
    setNewAttribute("");
    setAllowInvisible(false);
    setAllowCovered(false);
    setAllowAriaHidden(false);
  };

  return (
    <>
      <Button onClick={onOpen}>Add Domain Knowledge</Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>New Domain Knowledge</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isRequired>
              <FormLabel>Domain</FormLabel>
              <Input
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="Enter domain name"
              />
            </FormControl>

            <Heading mt={4} as="h4" size="md">
              {" "}
              Rules{" "}
            </Heading>

            <FormControl isRequired>
              <FormLabel>regexes</FormLabel>
              <Input
                value={newRegexes}
                onChange={(e) => setNewRegexes(e.target.value)}
                placeholder="Enter regexes"
              />
            </FormControl>

            <Heading mt={4} as="h5" size="sm">
              {" "}
              Knowledge{" "}
            </Heading>

            <FormControl isRequired>
              <FormLabel>Notes</FormLabel>
              <Textarea
                resize="none"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Enter notes"
              />
            </FormControl>

            <Heading mt={4} as="h6" size="xs">
              {" "}
              annotationRules{" "}
            </Heading>

            <FormControl>
              <FormLabel>selector</FormLabel>
              <Input
                resize="none"
                value={newSelector}
                onChange={(e) => setNewSelector(e.target.value)}
                placeholder="Enter selector"
              />
            </FormControl>
            <FormControl>
              <FormLabel>useAttributeAsName</FormLabel>
              <Input
                resize="none"
                value={newAttribute}
                onChange={(e) => setNewAttribute(e.target.value)}
                placeholder="Enter attribute"
              />
            </FormControl>
            <FormControl>
              <Flex alignItems="center">
                <FormLabel>allowInvisible</FormLabel>
                <Switch
                  isChecked={allowInvisible}
                  onChange={() => setAllowInvisible(!allowInvisible)}
                />
              </Flex>
            </FormControl>
            <FormControl>
              <Flex alignItems="center">
                <FormLabel>allowCovered</FormLabel>
                <Switch
                  isChecked={allowCovered}
                  onChange={() => setAllowCovered(!allowCovered)}
                />
              </Flex>
            </FormControl>
            <FormControl>
              <Flex alignItems="center">
                <FormLabel>allowAriaHidden</FormLabel>
                <Switch
                  isChecked={allowAriaHidden}
                  onChange={() => setAllowAriaHidden(!allowAriaHidden)}
                />
              </Flex>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={addDomainRules}>
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

const CustomKnowledgeBase = () => {
  const domainRules = useAppState((state) => state.settings.domainRules);

  return (
    <VStack spacing={4}>
      {domainRules.length > 0 ? (
        domainRules.map((rules, index) => (
          <Box key={index} w="full" p={4} borderWidth="1px" borderRadius="lg">
            <DomainKnowledge domainRules={rules} />
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
