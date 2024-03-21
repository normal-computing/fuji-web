import React, { useState, useEffect } from "react";
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
  Select,
} from "@chakra-ui/react";
import { type DomainRules, type Rule } from "../helpers/knowledge/type";
import { useAppState } from "../state/store";
import { findActiveTab } from "../helpers/browserUtils";

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
    newRegexType: "all",
    customRegex: "",
    newNote: "",
    newSelector: "",
    newAttribute: "",
    allowInvisible: false,
    allowCovered: false,
    allowAriaHidden: false,
  });
  const [defaultDomain, setDefaultDomain] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const updateSettings = useAppState((state) => state.settings.actions.update);
  const domainRules = useAppState((state) => state.settings.domainRules);
  const toast = useToast();

  const addDomainRules = () => {
    const {
      newDomain,
      newNote,
      newRegexType,
      customRegex,
      newSelector,
      newAttribute,
      allowInvisible,
      allowCovered,
      allowAriaHidden,
    } = formState;
    let regexes: string[];
    switch (newRegexType) {
      case "all":
        regexes = [".*"];
        break;
      case "one":
        regexes = [`^https?://${newDomain.replace(/\./g, "\\.")}$`];
        break;
      case "custom":
        regexes = [customRegex];
        break;
      default:
        regexes = [];
    }
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
      regexes,
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
      newDomain: defaultDomain,
      newNote: "",
      newRegexes: "",
      newRegexType: "Any URL on this domain",
      customRegex: "",
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

  const handleOpenNewKnowledgeForm = async () => {
    const tab = await findActiveTab();
    if (tab && tab.url) {
      const url = new URL(tab.url);
      const domain = url.hostname.replace(/^www\./, "");
      setDefaultDomain(domain);
    }
    onOpen();
  };

  return (
    <>
      <Button onClick={handleOpenNewKnowledgeForm}>Add Domain Knowledge</Button>
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
                value={formState.newDomain || defaultDomain}
                onChange={handleChange}
                placeholder="Enter domain name"
              />
              <FormHelperText>e.g. x.com, calendar.google.com</FormHelperText>
            </FormControl>

            <Heading mt={4} as="h4" size="md">
              Rules
            </Heading>
            <Box borderWidth="1px" borderRadius="lg">
              <FormControl isRequired mt={4}>
                <FormLabel>Regex Type</FormLabel>
                <Select
                  name="newRegexType"
                  value={formState.newRegexType}
                  onChange={handleChange}
                >
                  <option value="all">Any URL on this domain</option>
                  <option value="one">Only this URL</option>
                  <option value="custom">Custom regex</option>
                </Select>
                {formState.newRegexType === "custom" && (
                  <Input
                    name="customRegex"
                    value={formState.customRegex}
                    onChange={handleChange}
                    placeholder="Enter custom regex"
                  />
                )}
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
            </Box>
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

  useEffect(() => {
    const initializeDomain = async () => {
      const tab = await findActiveTab();
      if (tab && tab.url) {
        const url = new URL(tab.url);
        const domain = url.hostname.replace(/^www\./, "");
        setDefaultDomain(domain);
      }
    };
    initializeDomain();
  }, []);

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
