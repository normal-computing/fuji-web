import React, { useState, useEffect } from "react";
import {
  Button,
  Input,
  FormControl,
  FormLabel,
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
} from "@chakra-ui/react";
import { SmallCloseIcon } from "@chakra-ui/icons";
import { Formik, Form, Field } from "formik";
import { findActiveTab } from "../helpers/browserUtils";
import { useAppState } from "../state/store";
import { type EditingData } from "../helpers/knowledge";

type NewKnowledgeFormProps = {
  isEditMode?: boolean;
  editKnowledge?: EditingData;
  onSaved: () => void;
};

const NewKnowledgeForm = ({
  isEditMode = false,
  editKnowledge,
  onSaved,
}: NewKnowledgeFormProps) => {
  const [defaultHost, setDefaultHost] = useState("");
  const updateSettings = useAppState((state) => state.settings.actions.update);
  const customKnowledgeBase = useAppState(
    (state) => state.settings.customKnowledgeBase,
  );

  useEffect(() => {
    const handleOpenNewKnowledgeForm = async () => {
      const tab = await findActiveTab();
      if (tab && tab.url) {
        const url = new URL(tab.url);
        const host = url.hostname.replace(/^www\./, "");
        setDefaultHost(host);
      }
    };

    if (!isEditMode) {
      handleOpenNewKnowledgeForm();
    }
  }, [isEditMode]);

  const regexOptions = [
    { value: "all", label: "Any URL on this host" },
    { value: "one", label: "Only this URL" },
    { value: "custom", label: "Custom regex" },
  ];

  const initialValues = {
    newHost: isEditMode && editKnowledge ? editKnowledge.host : defaultHost,
    rules:
      isEditMode && editKnowledge
        ? editKnowledge.rules
        : [
            {
              regexType: "all",
              regexes: [".*"],
              knowledge: {
                notes: [""],
                annotationRules: [
                  {
                    selector: "",
                    useAttributeAsName: "",
                    useStaticName: "",
                    allowInvisible: false,
                    allowCovered: false,
                    allowAriaHidden: false,
                  },
                ],
              },
            },
          ],
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={(values) => {
        const { newHost, rules } = values;
        const host = newHost !== "" ? newHost : defaultHost;
        const transformedRules = rules.map(
          ({ regexType, regexes, knowledge }) => {
            let transformedRegexes = regexes;
            switch (regexType) {
              case "all":
                transformedRegexes = [".*"];
                break;
              case "one":
                transformedRegexes = [
                  `^https?://${host.replace(/\./g, "\\.")}/?$`,
                ];
                break;
              default:
                break;
            }
            return {
              regexes: transformedRegexes,
              knowledge,
            };
          },
        );
        const updatedKnowledge = {
          ...customKnowledgeBase,
          [host]: { rules: transformedRules },
        };
        updateSettings({ customKnowledgeBase: updatedKnowledge });
        onSaved();
      }}
    >
      {({ values, handleChange, setFieldValue }) => (
        <Form>
          <ModalHeader>New Host Knowledge</ModalHeader>
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>Host</FormLabel>
              <Input
                name="newHost"
                onChange={handleChange}
                value={values.newHost || defaultHost}
                placeholder="Enter host name"
              />
            </FormControl>

            {/* Rules Section */}
            <Heading as="h4" size="md">
              Rules
            </Heading>
            {values.rules.map((rule, ruleIndex) => (
              <Box
                key={ruleIndex}
                borderWidth="1px"
                borderRadius="lg"
                p={4}
                mt={4}
              >
                <FormControl isRequired>
                  <FormLabel>Regex Type</FormLabel>
                  <Field
                    as={Select}
                    name={`rules[${ruleIndex}].regexType`}
                    placeholder="Select regex type"
                  >
                    {regexOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Field>
                </FormControl>

                {rule.regexType === "custom" &&
                  rule.regexes.map((regex, regexIndex) => (
                    <InputGroup key={regexIndex} size="md" mb={2}>
                      <Field
                        as={Input}
                        name={`rules[${ruleIndex}].regexes[${regexIndex}]`}
                        placeholder="Enter regex"
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label="Remove regex"
                          icon={<SmallCloseIcon />}
                          onClick={() => {
                            const updatedRegexes = [
                              ...values.rules[ruleIndex].regexes,
                            ];
                            updatedRegexes.splice(regexIndex, 1);
                            setFieldValue(
                              `rules[${ruleIndex}].regexes`,
                              updatedRegexes,
                            );
                          }}
                        />
                      </InputRightElement>
                    </InputGroup>
                  ))}
                <Button
                  mt={2}
                  onClick={() => {
                    const updatedRegexes =
                      values.rules[ruleIndex].regexes.concat("");
                    setFieldValue(
                      `rules[${ruleIndex}].regexes`,
                      updatedRegexes,
                    );
                  }}
                >
                  Add Another Regex
                </Button>

                {/* Notes Section */}
                <FormControl mt={4}>
                  <FormLabel>Notes</FormLabel>
                  {rule.knowledge.notes?.map((note, noteIndex) => (
                    <InputGroup key={noteIndex} size="md" mb={2}>
                      <Field
                        as={Input}
                        name={`rules[${ruleIndex}].knowledge.notes[${noteIndex}]`}
                        placeholder="Enter note"
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label="Remove note"
                          icon={<SmallCloseIcon />}
                          onClick={() => {
                            const updatedNotes = [
                              ...(values.rules[ruleIndex].knowledge.notes ||
                                []),
                            ];
                            updatedNotes.splice(noteIndex, 1);
                            setFieldValue(
                              `rules[${ruleIndex}].knowledge.notes`,
                              updatedNotes,
                            );
                          }}
                        />
                      </InputRightElement>
                    </InputGroup>
                  ))}
                  <Button
                    mt={2}
                    onClick={() => {
                      const updatedNotes = (
                        values.rules[ruleIndex].knowledge.notes || []
                      ).concat("");
                      setFieldValue(
                        `rules[${ruleIndex}].knowledge.notes`,
                        updatedNotes,
                      );
                    }}
                  >
                    Add Another Note
                  </Button>
                </FormControl>

                {/* Annotation Rules Section */}
                <Heading as="h5" size="sm" mt={4}>
                  Annotation Rules
                </Heading>
                {rule.knowledge.annotationRules?.map((annotation, aIndex) => (
                  <Box
                    key={aIndex}
                    borderWidth="1px"
                    borderRadius="lg"
                    p={4}
                    mt={2}
                  >
                    {/* Annotation Rule Fields Here */}
                    {/* Example for a single field, replicate for others */}
                    <FormControl>
                      <FormLabel>Selector</FormLabel>
                      <Field
                        as={Input}
                        name={`rules[${ruleIndex}].knowledge.annotationRules[${aIndex}].selector`}
                        placeholder="Enter selector"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>useAttributeAsName</FormLabel>
                      <Field
                        as={Input}
                        name={`rules[${ruleIndex}].knowledge.annotationRules[${aIndex}].useAttributeAsName`}
                        placeholder="Enter attribute to use as name"
                      />
                    </FormControl>

                    <FormControl mt={2}>
                      <FormLabel>useStaticName</FormLabel>
                      <Input
                        name={`rules[${ruleIndex}].knowledge.annotationRules[${aIndex}].useStaticName`}
                        value={annotation.useStaticName}
                        onChange={handleChange}
                        placeholder="Enter static name"
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center" mt={2}>
                      <FormLabel mb="0">allowInvisible</FormLabel>
                      <Switch
                        ml={2}
                        isChecked={annotation.allowInvisible}
                        onChange={handleChange}
                        name={`rules[${ruleIndex}].knowledge.annotationRules[${aIndex}].allowInvisible`}
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center" mt={2}>
                      <FormLabel mb="0">allowCovered</FormLabel>
                      <Switch
                        ml={2}
                        isChecked={annotation.allowCovered}
                        onChange={handleChange}
                        name={`rules[${ruleIndex}].knowledge.annotationRules[${aIndex}].allowCovered`}
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center" mt={2}>
                      <FormLabel mb="0">allowAriaHidden</FormLabel>
                      <Switch
                        ml={2}
                        isChecked={annotation.allowAriaHidden}
                        onChange={handleChange}
                        name={`rules[${ruleIndex}].knowledge.annotationRules[${aIndex}].allowAriaHidden`}
                      />
                    </FormControl>
                    <Button
                      mt={2}
                      colorScheme="red"
                      onClick={() => {
                        const updatedAnnotationRules = [
                          ...(values.rules[ruleIndex].knowledge
                            .annotationRules || []),
                        ];
                        updatedAnnotationRules.splice(aIndex, 1);
                        setFieldValue(
                          `rules[${ruleIndex}].knowledge.annotationRules`,
                          updatedAnnotationRules,
                        );
                      }}
                    >
                      Remove Annotation
                    </Button>
                  </Box>
                ))}
                <Button
                  mt={2}
                  onClick={() => {
                    const newAnnotationRule = {
                      selector: "",
                      useAttributeAsName: "",
                      useStaticName: "",
                      allowInvisible: false,
                      allowCovered: false,
                      allowAriaHidden: false,
                    };
                    const updatedAnnotationRules = (
                      values.rules[ruleIndex].knowledge.annotationRules ?? []
                    ).concat(newAnnotationRule);
                    setFieldValue(
                      `rules[${ruleIndex}].knowledge.annotationRules`,
                      updatedAnnotationRules,
                    );
                  }}
                >
                  Add Another Annotation
                </Button>

                <Button
                  mt={4}
                  colorScheme="red"
                  onClick={() => {
                    const updatedRules = values.rules.filter(
                      (_, idx) => idx !== ruleIndex,
                    );
                    setFieldValue("rules", updatedRules);
                  }}
                >
                  Remove Rule
                </Button>
              </Box>
            ))}
            <Button
              mt={4}
              onClick={() => {
                const newRule = {
                  regexType: "all",
                  regexes: [".*"],
                  knowledge: {
                    notes: [""],
                    annotationRules: [
                      {
                        selector: "",
                        useAttributeAsName: "",
                        useStaticName: "",
                        allowInvisible: false,
                        allowCovered: false,
                        allowAriaHidden: false,
                      },
                    ],
                  },
                };
                const updatedRules = values.rules.concat(newRule);
                setFieldValue("rules", updatedRules);
              }}
              colorScheme="blue"
            >
              Add Another Rule
            </Button>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} type="submit">
              Save
            </Button>
            <Button onClick={onSaved}>Cancel</Button>
          </ModalFooter>
        </Form>
      )}
    </Formik>
  );
};

export default NewKnowledgeForm;
