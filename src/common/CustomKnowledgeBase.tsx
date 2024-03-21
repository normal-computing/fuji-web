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
  FormHelperText,
  Tooltip,
} from "@chakra-ui/react";
import { type DomainRules, type Rule } from "../helpers/knowledge/type";
import { useAppState } from "../state/store";

type DomainKnowledgeProps = {
  domainRules: DomainRules;
};

const DomainKnowledge = ({ domainRules }: DomainKnowledgeProps) => {
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
    </>
  );
};

const NewKnowledgeForm = () => {
  const [formState, setFormState] = useState({
    newDomain: "",
    newRegexes: "",
    newNote: "",
    newSelector: "",
    newAttribute: "",
    allowInvisible: false,
    allowCovered: false,
    allowAriaHidden: false,
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const updateSettings = useAppState((state) => state.settings.actions.update);
  const domainRules = useAppState((state) => state.settings.domainRules);
  const toast = useToast();

  const addDomainRules = () => {
    const {
      newDomain,
      newNote,
      newRegexes,
      newSelector,
      newAttribute,
      allowInvisible,
      allowCovered,
      allowAriaHidden,
    } = formState;
    if (!newDomain || !newRegexes) {
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

    // Reset form
    setFormState({
      newDomain: "",
      newNote: "",
      newRegexes: "",
      newSelector: "",
      newAttribute: "",
      allowInvisible: false,
      allowCovered: false,
      allowAriaHidden: false,
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
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
                name="newDomain"
                value={formState.newDomain}
                onChange={handleChange}
                placeholder="Enter domain name"
              />
              <FormHelperText>e.g. x.com, calendar.google.com</FormHelperText>
            </FormControl>

            <Heading mt={4} as="h4" size="md">
              Rules
            </Heading>
            <FormControl isRequired>
              <FormLabel>regexes</FormLabel>
              <Input
                name="newRegexes"
                value={formState.newRegexes}
                onChange={handleChange}
                placeholder="Enter regexes"
              />
              <FormHelperText>e.g. .*</FormHelperText>
            </FormControl>

            <Heading mt={4} as="h5" size="sm">
              Knowledge
            </Heading>
            <FormControl>
              <FormLabel>Notes</FormLabel>
              <Textarea
                name="newNote"
                resize="none"
                value={formState.newNote}
                onChange={handleChange}
                placeholder="Enter notes"
              />
              <FormHelperText>
                freeform tips about using the website
              </FormHelperText>
            </FormControl>

            <Heading mt={4} as="h6" size="xs">
              annotationRules
            </Heading>
            <FormControl>
              <FormLabel>selector</FormLabel>
              <Input
                name="newSelector"
                resize="none"
                value={formState.newSelector}
                onChange={handleChange}
                placeholder="Enter selector"
              />
            </FormControl>
            <FormControl>
              <FormLabel>useAttributeAsName</FormLabel>
              <Input
                name="newAttribute"
                resize="none"
                value={formState.newAttribute}
                onChange={handleChange}
                placeholder="Enter attribute"
              />
            </FormControl>
            <FormControl>
              <Flex alignItems="center">
                <Tooltip label="Allow invisible">
                  <FormLabel>allowInvisible</FormLabel>
                </Tooltip>
                <Switch
                  name="allowInvisible"
                  isChecked={formState.allowInvisible}
                  onChange={handleChange}
                />
              </Flex>
            </FormControl>
            <FormControl>
              <Flex alignItems="center">
                <Tooltip label="Allow covered">
                  <FormLabel>allowCovered</FormLabel>
                </Tooltip>
                <Switch
                  name="allowCovered"
                  isChecked={formState.allowCovered}
                  onChange={handleChange}
                />
              </Flex>
            </FormControl>
            <FormControl>
              <Flex alignItems="center">
                <Tooltip label="Allow aria hidden">
                  <FormLabel>allowAriaHidden</FormLabel>
                </Tooltip>
                <Switch
                  name="allowAriaHidden"
                  isChecked={formState.allowAriaHidden}
                  onChange={handleChange}
                />
              </Flex>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => {
                addDomainRules();
                // TODO: validate form entry before close
                onClose();
              }}
            >
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
