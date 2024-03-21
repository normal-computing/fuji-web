import React, { useState } from "react";
import {
  Switch,
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
  FormHelperText,
  Tooltip,
  Select,
  Button,
  Heading,
  Box,
} from "@chakra-ui/react";
import { findActiveTab } from "../helpers/browserUtils";
import { useAppState } from "../state/store";

const NewKnowledgeForm = () => {
  const [formState, setFormState] = useState({
    newDomain: "",
    rules: [
      {
        newRegexes: "",
        newRegexType: "all",
        customRegex: "",
        newNote: "",
        newSelector: "",
        newAttribute: "",
        allowInvisible: false,
        allowCovered: false,
        allowAriaHidden: false,
      },
    ],
  });
  const [defaultDomain, setDefaultDomain] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const updateSettings = useAppState((state) => state.settings.actions.update);
  const domainRules = useAppState((state) => state.settings.domainRules);
  const toast = useToast();

  const removeRule = (index: number) => {
    setFormState((prevState) => ({
      ...prevState,
      rules: prevState.rules.filter((_, ruleIndex) => ruleIndex !== index),
    }));
  };

  const addNewRule = () => {
    setFormState((prevState) => ({
      ...prevState,
      rules: [
        ...prevState.rules,
        {
          newRegexes: "",
          newRegexType: "all",
          customRegex: "",
          newNote: "",
          newSelector: "",
          newAttribute: "",
          allowInvisible: false,
          allowCovered: false,
          allowAriaHidden: false,
        },
      ],
    }));
  };

  const addDomainRules = () => {
    const { newDomain, rules } = formState;
    const domain = newDomain != "" ? newDomain : defaultDomain;

    if (!domain) {
      toast({
        title: "Domain is required",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    const newRules = rules.map((rule) => {
      let regexes: string[];
      switch (rule.newRegexType) {
        case "all":
          regexes = [".*"];
          break;
          7;
        case "one":
          regexes = [`^https?://${domain.replace(/\./g, "\\.")}$`];
          break;
        case "custom":
          regexes = [rule.customRegex];
          break;
        default:
          regexes = [];
      }

      return {
        regexes,
        knowledge: {
          notes: [rule.newNote],
          annotationRules: [
            {
              selector: rule.newSelector,
              useAttributeAsName: rule.newAttribute,
              allowInvisible: rule.allowInvisible,
              allowCovered: rule.allowCovered,
              allowAriaHidden: rule.allowAriaHidden,
            },
          ],
        },
      };
    });

    const newDomainRules = {
      domain,
      rules: newRules,
    };

    updateSettings({ domainRules: [...domainRules, newDomainRules] });

    setFormState({
      newDomain: defaultDomain,
      rules: [
        {
          newRegexes: "",
          newRegexType: "all",
          customRegex: "",
          newNote: "",
          newSelector: "",
          newAttribute: "",
          allowInvisible: false,
          allowCovered: false,
          allowAriaHidden: false,
        },
      ],
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("rules[")) {
      const index = parseInt(name.match(/\[(\d+)\]/)[1], 10);
      const propName = name.split("].")[1];
      const updatedRules = [...formState.rules];
      updatedRules[index] = {
        ...updatedRules[index],
        [propName]: type === "checkbox" ? checked : value,
      };
      setFormState((prevState) => ({
        ...prevState,
        rules: updatedRules,
      }));
    } else {
      setFormState((prevState) => ({
        ...prevState,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
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
            {formState.rules.map((rule, index) => (
              <Box key={index} borderWidth="1px" borderRadius="lg" p={4} mt={4}>
                <FormControl isRequired mt={4}>
                  <FormLabel>Regexes</FormLabel>
                  <Select
                    name={`rules[${index}].newRegexType`}
                    value={rule.newRegexes}
                    onChange={handleChange}
                  >
                    <option value="all">Any URL on this domain</option>
                    <option value="one">Only this URL</option>
                    <option value="custom">Custom regex</option>
                  </Select>
                  {rule.newRegexes === "custom" && (
                    <Input
                      name="customRegex"
                      value={rule.customRegex}
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
                    name={`rules[${index}].newNote`}
                    resize="none"
                    value={rule.newNote}
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
                    name={`rules[${index}].newSelector`}
                    resize="none"
                    value={rule.newSelector}
                    onChange={handleChange}
                    placeholder="Enter selector"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>useAttributeAsName</FormLabel>
                  <Input
                    name={`rules[${index}].newAttribute`}
                    resize="none"
                    value={rule.newAttribute}
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
                      name={`rules[${index}].allowInvisible`}
                      isChecked={rule.allowInvisible}
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
                      name={`rules[${index}].allowCovered`}
                      isChecked={rule.allowCovered}
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
                      name={`rules[${index}].allowAriaHidden`}
                      isChecked={rule.allowAriaHidden}
                      onChange={handleChange}
                    />
                  </Flex>
                </FormControl>
                <Button
                  mt={4}
                  colorScheme="red"
                  onClick={() => removeRule(index)}
                  isDisabled={formState.rules.length <= 1} // Disable if only one rule
                >
                  Remove Rule
                </Button>
              </Box>
            ))}
            <Button onClick={addNewRule}>Add Another Rule</Button>
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

export default NewKnowledgeForm;
