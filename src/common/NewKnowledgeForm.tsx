import React, { useState } from "react";
import { useFormik } from "formik";
import {
  Switch,
  Input,
  FormControl,
  Textarea,
  FormLabel,
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
  const [defaultHost, setDefaultHost] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const updateSettings = useAppState((state) => state.settings.actions.update);
  const hostData = useAppState((state) => state.settings.hostData);

  const formik = useFormik({
    initialValues: {
      newHost: defaultHost,
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
    },
    onSubmit: (values) => {
      const { newHost, rules } = values;
      const host = newHost !== "" ? newHost : defaultHost;
      const newRules = rules.map((rule) => {
        let regexes: string[];
        switch (rule.newRegexType) {
          case "all":
            regexes = [".*"];
            break;
          case "one":
            regexes = [`^https?://${host.replace(/\./g, "\\.")}$`];
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

      const updatedHostData = { ...hostData, [host]: { rules: newRules } };
      updateSettings({ hostData: updatedHostData });

      handleCloseForm();
    },
  });

  const addNewRule = () => {
    const newRule = {
      newRegexes: "",
      newRegexType: "all",
      customRegex: "",
      newNote: "",
      newSelector: "",
      newAttribute: "",
      allowInvisible: false,
      allowCovered: false,
      allowAriaHidden: false,
    };
    const updatedRules = [...formik.values.rules, newRule];
    formik.setFieldValue("rules", updatedRules);
  };

  const removeRule = (index: number) => {
    const updatedRules = formik.values.rules.filter((_, idx) => idx !== index);
    formik.setFieldValue("rules", updatedRules);
  };

  const handleOpenNewKnowledgeForm = async () => {
    const tab = await findActiveTab();
    if (tab && tab.url) {
      const url = new URL(tab.url);
      const host = url.hostname.replace(/^www\./, "");
      setDefaultHost(host);
    }
    onOpen();
  };

  const handleCloseForm = () => {
    onClose();

    formik.resetForm({
      values: {
        newHost: defaultHost,
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
      },
    });
  };

  return (
    <>
      <Button onClick={handleOpenNewKnowledgeForm}>Add Host Knowledge</Button>
      <Modal isOpen={isOpen} onClose={handleCloseForm}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={formik.handleSubmit}>
            <ModalHeader>New Host Knowledge</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl isRequired>
                <FormLabel>Host</FormLabel>
                <Input
                  name="newHost"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.newHost || defaultHost}
                  placeholder="Enter host name"
                />
              </FormControl>

              <Heading as="h4" size="md">
                Rules
              </Heading>
              {formik.values.rules.map((rule, index) => (
                <Box key={index} borderWidth="1px" borderRadius="lg">
                  <FormControl isRequired>
                    <FormLabel>Regexes</FormLabel>
                    <Select
                      name={`rules[${index}].newRegexType`}
                      onChange={formik.handleChange}
                      value={rule.newRegexType}
                    >
                      <option value="all">Any URL on this host</option>
                      <option value="one">Only this URL</option>
                      <option value="custom">Custom regex</option>
                    </Select>
                    {rule.newRegexType === "custom" && (
                      <Input
                        name={`rules[${index}].customRegex`}
                        onChange={formik.handleChange}
                        value={rule.customRegex}
                        placeholder="Enter custom regex"
                      />
                    )}
                  </FormControl>

                  <Heading mt={4} as="h5" size="sm">
                    Knowledge
                  </Heading>
                  <FormControl>
                    <FormLabel>Notes</FormLabel>
                    <FormHelperText>
                      tips about using the website
                    </FormHelperText>
                    <Textarea
                      name={`rules[${index}].newNote`}
                      resize="none"
                      onChange={formik.handleChange}
                      value={rule.newNote}
                      placeholder="Enter notes"
                    />
                  </FormControl>

                  <Heading mt={4} as="h6" size="xs">
                    annotationRules
                  </Heading>
                  <FormControl>
                    <FormLabel>selector</FormLabel>
                    <Input
                      name={`rules[${index}].newSelector`}
                      resize="none"
                      onChange={formik.handleChange}
                      value={rule.newSelector}
                      placeholder="Enter selector"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>useAttributeAsName</FormLabel>
                    <Input
                      name={`rules[${index}].newAttribute`}
                      resize="none"
                      onChange={formik.handleChange}
                      value={rule.newAttribute}
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
                        onChange={formik.handleChange}
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
                        onChange={formik.handleChange}
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
                        onChange={formik.handleChange}
                      />
                    </Flex>
                  </FormControl>
                  <Button
                    mt={4}
                    colorScheme="red"
                    onClick={() => removeRule(index)}
                    isDisabled={formik.values.rules.length <= 1}
                  >
                    Remove Rule
                  </Button>
                </Box>
              ))}
              <Button mt={4} onClick={addNewRule} colorScheme="blue">
                Add Another Rule
              </Button>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} type="submit">
                Save
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};

export default NewKnowledgeForm;
