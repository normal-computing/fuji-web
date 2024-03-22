// NewKnowledgeForm.tsx
import React, { useState, useEffect } from "react";
import {
  Button,
  Input,
  FormControl,
  FormLabel,
  Flex,
  Tooltip,
  Select,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Box,
  Heading,
  Switch,
  InputGroup,
  InputRightElement,
  IconButton,
  HStack,
} from "@chakra-ui/react";
import { AddIcon, SmallCloseIcon } from "@chakra-ui/icons";
import { useFormik } from "formik";
import { findActiveTab } from "../helpers/browserUtils";
import { useAppState } from "../state/store";

type NewKnowledgeFormProps = {
  isEditMode?: boolean;
  onSaved: () => void;
};

const NewKnowledgeForm = ({
  isEditMode = false,
  onSaved,
}: NewKnowledgeFormProps) => {
  const [defaultHost, setDefaultHost] = useState("");
  const updateSettings = useAppState((state) => state.settings.actions.update);
  const hostData = useAppState((state) => state.settings.hostData);

  const formik = useFormik({
    initialValues: {
      newHost: "",
      rules: [
        {
          regexType: "all", // 'all', 'one', or 'custom'
          regexes: [""],
          newNotes: [" "],
          annotationRules: [
            {
              newSelector: "",
              newAttribute: "",
              allowInvisible: false,
              allowCovered: false,
              allowAriaHidden: false,
            },
          ],
        },
      ],
    },
    onSubmit: (values) => {
      const { newHost, rules } = values;
      const host = newHost !== "" ? newHost : defaultHost;
      const newRules = rules.map((rule) => {
        let regexes: string[] = [];
        switch (rule.regexType) {
          case "all":
            regexes = [".*"];
            break;
          case "one":
            regexes = [`^https?://${host.replace(/\./g, "\\.")}/?$`]; // Adjust regex as needed
            break;
          case "custom":
            regexes = rule.regexes.filter((r) => r.trim() !== "");
            break;
          default:
            break;
        }

        const knowledge = {
          notes: [...rule.newNotes],
          annotationRules: rule.annotationRules.map((ar) => ({
            selector: ar.newSelector,
            useAttributeAsName: ar.newAttribute,
            allowInvisible: ar.allowInvisible,
            allowCovered: ar.allowCovered,
            allowAriaHidden: ar.allowAriaHidden,
          })),
        };

        return {
          regexes,
          knowledge,
        };
      });

      const updatedHostData = { ...hostData, [host]: { rules: newRules } };
      updateSettings({ hostData: updatedHostData });
      onSaved();
    },
  });

  useEffect(() => {
    if (isEditMode) {
      // formik.setValues({
      //   newHost: editData.host,
      //   rules: editData.rules,
      // });
      console.log("set value");
    } else {
      formik.resetForm();
      if (!isEditMode) {
        handleOpenNewKnowledgeForm();
      }
    }
  }, [isEditMode]);

  const handleOpenNewKnowledgeForm = async () => {
    const tab = await findActiveTab();
    if (tab && tab.url) {
      const url = new URL(tab.url);
      const host = url.hostname.replace(/^www\./, "");
      setDefaultHost(host);
      formik.setFieldValue("newHost", host);
    }
  };

  const addNewRule = () => {
    const newRule = {
      regexType: "all",
      regexes: [""],
      newNotes: [""],
      annotationRules: [
        {
          newSelector: "",
          newAttribute: "",
          allowInvisible: false,
          allowCovered: false,
          allowAriaHidden: false,
        },
      ],
    };

    // Add the new rule to the existing rules array in the formik state
    const updatedRules = [...formik.values.rules, newRule];
    formik.setFieldValue("rules", updatedRules);
  };

  const removeRule = (index: number) => {
    const updatedRules = formik.values.rules.filter((_, idx) => idx !== index);
    formik.setFieldValue("rules", updatedRules);
  };

  const addNote = (ruleIndex: number) => {
    const updatedRules = [...formik.values.rules];
    updatedRules[ruleIndex].newNotes.push("");
    formik.setFieldValue("rules", updatedRules);
  };

  const removeNote = (ruleIndex: number, noteIndex: number) => {
    const updatedRules = [...formik.values.rules];
    updatedRules[ruleIndex].newNotes.splice(noteIndex, 1);
    formik.setFieldValue("rules", updatedRules);
  };

  const addAnnotation = (ruleIndex: number) => {
    const newAnnotationRule = {
      newSelector: "",
      newAttribute: "",
      allowInvisible: false,
      allowCovered: false,
      allowAriaHidden: false,
    };

    const updatedRules = [...formik.values.rules];
    if (!updatedRules[ruleIndex].annotationRules) {
      updatedRules[ruleIndex].annotationRules = [];
    }
    updatedRules[ruleIndex].annotationRules.push(newAnnotationRule);

    formik.setFieldValue("rules", updatedRules);
  };

  const removeAnnotation = (ruleIndex: number, annotationIndex: number) => {
    const updatedRules = [...formik.values.rules];
    updatedRules[ruleIndex].annotationRules.splice(annotationIndex, 1);
    formik.setFieldValue("rules", updatedRules);
  };

  const addCustomRegex = (ruleIndex: number) => {
    const updatedRules = [...formik.values.rules];
    if (!updatedRules[ruleIndex].regexes) {
      updatedRules[ruleIndex].regexes = [""];
    } else {
      updatedRules[ruleIndex].regexes.push("");
    }
    formik.setFieldValue("rules", updatedRules);
  };

  const removeCustomRegex = (ruleIndex: number, regexIndex: number) => {
    const updatedRules = [...formik.values.rules];
    updatedRules[ruleIndex].regexes.splice(regexIndex, 1);
    formik.setFieldValue("rules", updatedRules);
  };

  const renderAnnotationRules = (ruleIndex, annotation, aIndex) => (
    <>
      <FormControl key={aIndex}>
        <FormLabel>selector</FormLabel>
        <Input
          name={`rules[${ruleIndex}].annotationRules[${aIndex}].newSelector`}
          onChange={formik.handleChange}
          value={annotation.newSelector}
          placeholder="Enter selector"
        />
      </FormControl>
      <FormControl>
        <FormLabel>useAttributeAsName</FormLabel>
        <Input
          name={`rules[${ruleIndex}].annotationRules[${aIndex}].newAttribute`}
          onChange={formik.handleChange}
          value={annotation.newAttribute}
          placeholder="Enter attribute"
        />
      </FormControl>
      <FormControl>
        <Flex alignItems="center">
          <Tooltip label="Allow invisible">
            <FormLabel>allowInvisible</FormLabel>
          </Tooltip>
          <Switch
            name={`rules[${aIndex}].annotationRules[${aIndex}].allowInvisible`}
            isChecked={annotation.allowInvisible}
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
            name={`rules[${aIndex}].annotationRules[${aIndex}].allowCovered`}
            isChecked={annotation.allowCovered}
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
            name={`rules[${aIndex}].annotationRules[${aIndex}].allowAriaHidden`}
            isChecked={annotation.allowAriaHidden}
            onChange={formik.handleChange}
          />
        </Flex>
      </FormControl>
      <Button onClick={() => removeAnnotation(ruleIndex, aIndex)}>
        Remove Annotation
      </Button>
    </>
  );

  return (
    <form onSubmit={formik.handleSubmit}>
      <ModalHeader>New Host Knowledge</ModalHeader>
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
        {formik.values.rules.map((rule, ruleIndex) => (
          <Box key={ruleIndex} borderWidth="1px" borderRadius="lg">
            <FormControl isRequired>
              <FormLabel>regexes</FormLabel>
              <Select
                name={`rules[${ruleIndex}].regexType`}
                onChange={formik.handleChange}
                value={rule.regexType}
              >
                <option value="all">Any URL on this host</option>
                <option value="one">Only this URL</option>
                <option value="custom">Custom regex</option>
              </Select>
              {rule.regexType === "custom" &&
                rule.regexes.map((regex, regexIndex) => (
                  <FormControl key={regexIndex}>
                    <InputGroup size="md">
                      <Input
                        name={`rules[${ruleIndex}].regexes[${regexIndex}]`}
                        value={regex}
                        onChange={formik.handleChange}
                        placeholder="Enter custom regex"
                      />
                      <InputRightElement width="4.5rem">
                        <IconButton
                          variant="ghost"
                          aria-label="Remove custom regex"
                          icon={<SmallCloseIcon />}
                          onClick={() =>
                            removeCustomRegex(ruleIndex, regexIndex)
                          }
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                ))}

              {rule.regexType === "custom" && (
                <IconButton
                  aria-label="Add custom regex"
                  icon={<AddIcon />}
                  onClick={() => addCustomRegex(ruleIndex)}
                />
              )}
            </FormControl>

            <Heading as="h5" size="sm">
              Knowledge
            </Heading>
            <Box borderWidth="1px" borderRadius="lg">
              <HStack>
                <FormLabel>notes</FormLabel>
                <IconButton
                  size="sm"
                  aria-label="Add note"
                  icon={<AddIcon />}
                  onClick={() => addNote(ruleIndex)}
                />
              </HStack>
              {rule.newNotes.map((note, noteIndex) => (
                <FormControl key={noteIndex}>
                  <InputGroup size="md">
                    <Input
                      name={`rules[${ruleIndex}].newNotes[${noteIndex}]`}
                      value={note}
                      onChange={formik.handleChange}
                      placeholder="Enter note"
                    />
                    <InputRightElement width="4.5rem">
                      <IconButton
                        variant="ghost"
                        aria-label="Remove note"
                        icon={<SmallCloseIcon />}
                        onClick={() => removeNote(ruleIndex, noteIndex)}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>
              ))}

              <Box borderWidth="1px" borderRadius="lg">
                <HStack>
                  <Heading as="h6" size="xs">
                    Annotation Rules
                  </Heading>
                  <IconButton
                    size="sm"
                    aria-label="Add annotation"
                    icon={<AddIcon />}
                    onClick={() => addAnnotation(ruleIndex)}
                  />
                </HStack>
                {rule.annotationRules.map((annotation, aIndex) =>
                  renderAnnotationRules(ruleIndex, annotation, aIndex),
                )}
              </Box>

              <Button
                colorScheme="red"
                onClick={() => removeRule(ruleIndex)}
                isDisabled={formik.values.rules.length <= 1}
              >
                Remove Rule
              </Button>
            </Box>
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
        <Button onClick={onSaved}>Cancel</Button>
      </ModalFooter>
    </form>
  );
};

export default NewKnowledgeForm;
